const { NextResponse } = require('next/server');
const { getCurrentUser } = require('@/lib/auth');
const { requireRole } = require('@/lib/rbac');
const { wrapHandler } = require('@/lib/errors');
const { createOrderSchema } = require('@/lib/validators/order');
const orderService = require('@/lib/services/orderService');

async function handleGetOrders(req) {
  const user = await getCurrentUser(req, true);
  // Admin can list/filter all orders
  requireRole(user, 'admin');

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || undefined;

  const orders = await orderService.getOrdersForUser(user, { status });
  return NextResponse.json({ orders });
}

async function handleCreateOrder(req) {
  const user = await getCurrentUser(req, true);
  // Buyer only can create orders
  requireRole(user, 'buyer');

  const body = await req.json();
  const validated = createOrderSchema.parse(body);

  const order = await orderService.createOrder(user.id, validated);
  return NextResponse.json({ order }, { status: 201 });
}

const GET = wrapHandler(handleGetOrders);
const POST = wrapHandler(handleCreateOrder);

module.exports = { GET, POST };
