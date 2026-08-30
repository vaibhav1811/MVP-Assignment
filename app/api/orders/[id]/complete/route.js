const { NextResponse } = require('next/server');
const { getCurrentUser } = require('@/lib/auth');
const { requireRole } = require('@/lib/rbac');
const { wrapHandler } = require('@/lib/errors');
const orderService = require('@/lib/services/orderService');

async function handleCompleteOrder(req, { params }) {
  const user = await getCurrentUser(req, true);
  // Allowed for admin or seller
  requireRole(user, ['admin', 'seller']);

  const { id } = params;
  const order = await orderService.updateOrderStatus(id, 'completed', user);

  return NextResponse.json({
    message: 'Order marked as completed successfully',
    order,
  });
}

const PATCH = wrapHandler(handleCompleteOrder);

module.exports = { PATCH };
