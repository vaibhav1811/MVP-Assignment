const { NextResponse } = require('next/server');
const { getCurrentUser } = require('@/lib/auth');
const { requireRole } = require('@/lib/rbac');
const { wrapHandler } = require('@/lib/errors');
const orderService = require('@/lib/services/orderService');

async function handleRejectOrder(req, { params }) {
  const user = await getCurrentUser(req, true);
  requireRole(user, 'admin');

  const { id } = params;
  const order = await orderService.updateOrderStatus(id, 'rejected', user);

  return NextResponse.json({
    message: 'Order rejected and stock restored successfully',
    order,
  });
}

const PATCH = wrapHandler(handleRejectOrder);

module.exports = { PATCH };
