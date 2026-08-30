const { NextResponse } = require('next/server');
const { COOKIE_NAME } = require('@/lib/auth');
const { wrapHandler } = require('@/lib/errors');

async function handleLogout() {
  const response = NextResponse.json({ message: 'Logged out successfully' });
  
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}

const POST = wrapHandler(handleLogout);

module.exports = { POST };
