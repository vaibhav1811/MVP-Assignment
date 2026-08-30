const { NextResponse } = require('next/server');
const { getCurrentUser } = require('@/lib/auth');
const { wrapHandler } = require('@/lib/errors');

async function handleGetMe(req) {
  const user = await getCurrentUser(req, true);
  return NextResponse.json({ user });
}

const GET = wrapHandler(handleGetMe);

module.exports = { GET };
