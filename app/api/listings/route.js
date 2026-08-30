const { NextResponse } = require('next/server');
const { getCurrentUser } = require('@/lib/auth');
const { requireRole } = require('@/lib/rbac');
const { wrapHandler } = require('@/lib/errors');
const { createListingSchema } = require('@/lib/validators/listing');
const listingService = require('@/lib/services/listingService');

async function handleGetListings(req) {
  const { searchParams } = new URL(req.url);
  const isActive = searchParams.get('isActive');
  const sellerId = searchParams.get('sellerId');
  const search = searchParams.get('search');

  const listings = await listingService.getListings({
    isActive: isActive !== null ? isActive : undefined,
    sellerId: sellerId || undefined,
    search: search || undefined,
  });

  return NextResponse.json({ listings });
}

async function handleCreateListing(req) {
  const user = await getCurrentUser(req, true);
  requireRole(user, 'seller');

  const body = await req.json();
  const validated = createListingSchema.parse(body);

  const listing = await listingService.createListing(user.id, validated);

  return NextResponse.json({ listing }, { status: 201 });
}

const GET = wrapHandler(handleGetListings);
const POST = wrapHandler(handleCreateListing);

module.exports = { GET, POST };
