const { NextResponse } = require('next/server');
const { getCurrentUser } = require('@/lib/auth');
const { requireRole } = require('@/lib/rbac');
const { wrapHandler } = require('@/lib/errors');
const { updateListingSchema } = require('@/lib/validators/listing');
const listingService = require('@/lib/services/listingService');

async function handleGetListing(req, { params }) {
  const { id } = params;
  const listing = await listingService.getListingById(id);
  return NextResponse.json({ listing });
}

async function handleUpdateListing(req, { params }) {
  const user = await getCurrentUser(req, true);
  requireRole(user, 'seller');

  const { id } = params;
  const body = await req.json();
  const validated = updateListingSchema.parse(body);

  const listing = await listingService.updateListing(user.id, id, validated);
  return NextResponse.json({ listing });
}

async function handleDeleteListing(req, { params }) {
  const user = await getCurrentUser(req, true);
  requireRole(user, 'seller');

  const { id } = params;
  await listingService.deleteListing(user.id, id);
  return NextResponse.json({ message: 'Listing deactivated successfully' });
}

const GET = wrapHandler(handleGetListing);
const PUT = wrapHandler(handleUpdateListing);
const DELETE = wrapHandler(handleDeleteListing);

module.exports = { GET, PUT, DELETE };
