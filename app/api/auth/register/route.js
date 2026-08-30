const { NextResponse } = require('next/server');
const { prisma } = require('@/lib/db');
const { hashPassword } = require('@/lib/auth');
const { wrapHandler, ValidationError, AppError } = require('@/lib/errors');
const { registerSchema } = require('@/lib/validators/auth');

async function handleRegister(req) {
  const body = await req.json();
  const validated = registerSchema.parse(body);

  // Additional guard against admin self-registration
  if (validated.role === 'admin') {
    throw new ValidationError('Admin accounts cannot be self-registered');
  }

  // Check email collision
  const existingUser = await prisma.user.findUnique({
    where: { email: validated.email.toLowerCase() },
  });

  if (existingUser) {
    throw new AppError('An account with this email address already exists', 409, 'EMAIL_EXISTS');
  }

  const hashedPassword = await hashPassword(validated.password);

  const newUser = await prisma.user.create({
    data: {
      name: validated.name,
      email: validated.email.toLowerCase(),
      hashedPassword,
      role: validated.role,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return NextResponse.json(
    {
      message: 'Registration successful',
      user: newUser,
    },
    { status: 201 }
  );
}

const POST = wrapHandler(handleRegister);

module.exports = { POST };
