const { prisma } = require('../db');
const { NotFoundError, ForbiddenError } = require('../errors');

/**
 * Get listings with optional filters.
 */
async function getListings({ isActive, sellerId, search } = {}) {
  const where = {};

  if (isActive !== undefined) {
    where.isActive = typeof isActive === 'string' ? isActive === 'true' : Boolean(isActive);
  }

  if (sellerId) {
    where.sellerId = sellerId;
  }

  if (search && search.trim()) {
    const term = search.trim();
    where.OR = [
      { title: { contains: term, mode: 'insensitive' } },
      { description: { contains: term, mode: 'insensitive' } },
    ];
  }

  return await prisma.listing.findMany({
    where,
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

/**
 * Get a single listing by ID.
 */
async function getListingById(id) {
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!listing) {
    throw new NotFoundError(`Listing with ID '${id}' not found`);
  }

  return listing;
}

/**
 * Create a new listing (Seller only).
 */
async function createListing(sellerId, data) {
  return await prisma.listing.create({
    data: {
      title: data.title,
      description: data.description,
      price: data.price,
      quantityAvailable: data.quantityAvailable,
      isActive: data.isActive !== undefined ? data.isActive : true,
      sellerId,
    },
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

/**
 * Update an existing listing with ownership check.
 */
async function updateListing(sellerId, listingId, data) {
  const existing = await getListingById(listingId);

  if (existing.sellerId !== sellerId) {
    throw new ForbiddenError('You can only update your own listings');
  }

  return await prisma.listing.update({
    where: { id: listingId },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.price !== undefined && { price: data.price }),
      ...(data.quantityAvailable !== undefined && { quantityAvailable: data.quantityAvailable }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

/**
 * Soft delete a listing (sets isActive = false) with ownership check.
 */
async function deleteListing(sellerId, listingId) {
  const existing = await getListingById(listingId);

  if (existing.sellerId !== sellerId) {
    throw new ForbiddenError('You can only delete your own listings');
  }

  return await prisma.listing.update({
    where: { id: listingId },
    data: { isActive: false },
  });
}

module.exports = {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
};
