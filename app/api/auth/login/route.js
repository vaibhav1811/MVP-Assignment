const { NextResponse } = require('next/server');
const { prisma } = require('@/lib/db');
const { comparePassword, signToken, COOKIE_NAME, COOKIE_OPTIONS } = require('@/lib/auth');
const { wrapHandler, UnauthorizedError } = require('@/lib/errors');
const { loginSchema } = require('@/lib/validators/auth');

async function handleLogin(req) {
  const body = await req.json();
  const validated = loginSchema.parse(body);

  const user = await prisma.user.findUnique({
    where: { email: validated.email.toLowerCase() },
  });

  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const isMatch = await comparePassword(validated.password, user.hashedPassword);
  if (!isMatch) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Sign JWT token
  const token = await signToken(user);

  const response = NextResponse.json({
    message: 'Login successful',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });

  // Set httpOnly cookie
  response.cookies.set(COOKIE_NAME, token, COOKIE_OPTIONS);

  return response;
}

const POST = wrapHandler(handleLogin);

module.exports = { POST };
