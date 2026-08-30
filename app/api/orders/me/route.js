const { NextResponse } = require('next/server');
const { getCurrentUser } = require('@/lib/auth');
const { requireRole } = require('@/lib/rbac');
const { wrapHandler } = require('@/lib/errors');
const orderService = require('@/lib/services/orderService');

async function handleGetMyOrders(req) {
  const user = await getCurrentUser(req, true);
  // Buyer or Seller can check their relevant orders
  requireRole(user, ['buyer', 'seller']);

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || undefined;

  const orders = await orderService.getOrdersForUser(user, { status });
  return NextResponse.json({ orders });
}

const GET = wrapHandler(handleGetMyOrders);
const dynamic = 'force-dynamic';

module.exports = { GET, dynamic };
