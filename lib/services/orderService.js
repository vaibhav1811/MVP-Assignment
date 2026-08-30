const { prisma } = require('../db');
const {
  NotFoundError,
  ForbiddenError,
  InsufficientStockError,
  InvalidTransitionError,
} = require('../errors');

// Allowed status transitions mapping
const ALLOWED_TRANSITIONS = {
  pending: ['approved', 'rejected'],
  approved: ['completed'],
  rejected: [],
  completed: [],
};

/**
 * Get single order by ID with permissions check.
 */
async function getOrderById(orderId, user = null) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      buyer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      listing: {
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    throw new NotFoundError(`Order with ID '${orderId}' not found`);
  }

  if (user) {
    const isAdmin = user.role === 'admin';
    const isBuyer = order.buyerId === user.id;
    const isSeller = order.listing && order.listing.sellerId === user.id;

    if (!isAdmin && !isBuyer && !isSeller) {
      throw new ForbiddenError('You do not have permission to access this order');
    }
  }

  return order;
}

/**
 * Create a new order with atomic stock verification and decrement in a transaction.
 */
async function createOrder(buyerId, { listingId, quantity }) {
  const qty = parseInt(quantity, 10);
  if (isNaN(qty) || qty <= 0) {
    throw new InsufficientStockError('Order quantity must be at least 1');
  }

  return await prisma.$transaction(async (tx) => {
    // 1. Fetch listing inside transaction
    const listing = await tx.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      throw new NotFoundError(`Listing with ID '${listingId}' not found`);
    }

    if (!listing.isActive) {
      throw new InsufficientStockError('This listing is no longer active for orders');
    }

    // 2. Stock check
    if (listing.quantityAvailable < qty) {
      throw new InsufficientStockError(
        `Insufficient stock: requested ${qty}, but only ${listing.quantityAvailable} available`
      );
    }

    // 3. Compute totalPrice server-side (Decimal safe arithmetic)
    const unitPrice = parseFloat(listing.price.toString());
    const calculatedTotal = (unitPrice * qty).toFixed(2);

    // 4. Decrement available stock
    await tx.listing.update({
      where: { id: listingId },
      data: {
        quantityAvailable: listing.quantityAvailable - qty,
      },
    });

    // 5. Create the order with pending status
    const order = await tx.order.create({
      data: {
        buyerId,
        listingId,
        quantity: qty,
        totalPrice: calculatedTotal,
        status: 'pending',
      },
      include: {
        buyer: {
          select: { id: true, name: true, email: true },
        },
        listing: {
          include: {
            seller: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    return order;
  });
}

/**
 * Get orders filtered by role and optional status.
 */
async function getOrdersForUser(user, { status } = {}) {
  const where = {};

  if (status) {
    where.status = status;
  }

  if (user.role === 'buyer') {
    where.buyerId = user.id;
  } else if (user.role === 'seller') {
    where.listing = {
      sellerId: user.id,
    };
  } else if (user.role === 'admin') {
    // Admin can see all orders
  }

  return await prisma.order.findMany({
    where,
    include: {
      buyer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      listing: {
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

/**
 * Execute order status transition with state machine and role validation.
 */
async function updateOrderStatus(orderId, targetStatus, currentUser) {
  const order = await getOrderById(orderId);

  // 1. Validate State Machine
  const allowed = ALLOWED_TRANSITIONS[order.status] || [];
  if (!allowed.includes(targetStatus)) {
    throw new InvalidTransitionError(
      `Cannot transition order from '${order.status}' to '${targetStatus}'. Allowed transitions from '${order.status}' are: [${allowed.join(', ') || 'none'}]`
    );
  }

  // 2. Validate Role-based Transition Rules
  if (targetStatus === 'approved') {
    // Admin only
    if (currentUser.role !== 'admin') {
      throw new ForbiddenError('Only administrators can approve orders');
    }
  } else if (targetStatus === 'rejected') {
    // Admin only
    if (currentUser.role !== 'admin') {
      throw new ForbiddenError('Only administrators can reject orders');
    }
  } else if (targetStatus === 'completed') {
    // Admin OR Seller who owns the listing
    const isOwnerSeller = currentUser.role === 'seller' && order.listing && order.listing.sellerId === currentUser.id;
    const isAdmin = currentUser.role === 'admin';

    if (!isAdmin && !isOwnerSeller) {
      throw new ForbiddenError('Only an administrator or the listing seller can mark an order as completed');
    }
  }

  // 3. Perform transition (with stock restoration if rejecting)
  if (targetStatus === 'rejected') {
    return await prisma.$transaction(async (tx) => {
      // Restore listing stock
      await tx.listing.update({
        where: { id: order.listingId },
        data: {
          quantityAvailable: {
            increment: order.quantity,
          },
        },
      });

      // Update order status
      return await tx.order.update({
        where: { id: orderId },
        data: { status: 'rejected' },
        include: {
          buyer: { select: { id: true, name: true, email: true } },
          listing: {
            include: {
              seller: { select: { id: true, name: true, email: true } },
            },
          },
        },
      });
    });
  }

  // Non-reject transitions
  return await prisma.order.update({
    where: { id: orderId },
    data: { status: targetStatus },
    include: {
      buyer: { select: { id: true, name: true, email: true } },
      listing: {
        include: {
          seller: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });
}

module.exports = {
  ALLOWED_TRANSITIONS,
  getOrderById,
  createOrder,
  getOrdersForUser,
  updateOrderStatus,
};
