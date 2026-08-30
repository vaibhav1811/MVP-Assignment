const { SignJWT, jwtVerify } = require('jose');
const bcrypt = require('bcryptjs');
const { prisma } = require('./db');
const { UnauthorizedError } = require('./errors');

const JWT_SECRET_STRING = process.env.JWT_SECRET || 'super-secret-jwt-key-for-marketplace-mvp-must-be-at-least-32-chars-long';
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);
const COOKIE_NAME = 'auth_token';

const COOKIE_OPTIONS = {
  name: COOKIE_NAME,
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
};

/**
 * Hash plain text password.
 */
async function hashPassword(plainPassword) {
  return await bcrypt.hash(plainPassword, 10);
}

/**
 * Compare plain text password with hashed password.
 */
async function comparePassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Sign JWT token using jose.
 */
async function signToken(user) {
  const token = await new SignJWT({
    sub: user.id,
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);

  return token;
}

/**
 * Verify JWT token string.
 */
async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (err) {
    return null;
  }
}

/**
 * Extract token from Request object (cookies or Authorization header).
 */
function extractTokenFromRequest(req) {
  if (!req) return null;

  // 1. Try NextRequest cookies
  if (req.cookies && typeof req.cookies.get === 'function') {
    const cookie = req.cookies.get(COOKIE_NAME);
    if (cookie && cookie.value) return cookie.value;
  }

  // 2. Try raw headers Cookie
  if (req.headers) {
    const rawCookie = typeof req.headers.get === 'function' 
      ? req.headers.get('cookie') 
      : req.headers.cookie;

    if (rawCookie) {
      const match = rawCookie.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]*)`));
      if (match) return decodeURIComponent(match[1]);
    }

    // 3. Fallback to Authorization: Bearer <token>
    const authHeader = typeof req.headers.get === 'function' 
      ? req.headers.get('authorization') 
      : req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7).trim();
    }
  }

  return null;
}

/**
 * Get currently authenticated user from Request. Throws UnauthorizedError if required is true.
 */
async function getCurrentUser(req, required = false) {
  const token = extractTokenFromRequest(req);
  if (!token) {
    if (required) throw new UnauthorizedError('Authentication required. No token found.');
    return null;
  }

  const payload = await verifyToken(token);
  if (!payload || !payload.sub) {
    if (required) throw new UnauthorizedError('Invalid or expired authentication token.');
    return null;
  }

  // Fetch fresh user from DB
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user && required) {
    throw new UnauthorizedError('User account no longer exists.');
  }

  return user;
}

module.exports = {
  COOKIE_NAME,
  COOKIE_OPTIONS,
  hashPassword,
  comparePassword,
  signToken,
  verifyToken,
  extractTokenFromRequest,
  getCurrentUser,
};
