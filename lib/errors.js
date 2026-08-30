const { NextResponse } = require('next/server');
const { ZodError } = require('zod');

class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

class ValidationError extends AppError {
  constructor(message = 'Validation failed', details = null) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'You do not have permission to perform this action') {
    super(message, 403, 'FORBIDDEN');
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

class InsufficientStockError extends AppError {
  constructor(message = 'Requested quantity exceeds available stock') {
    super(message, 400, 'INSUFFICIENT_STOCK');
  }
}

class InvalidTransitionError extends AppError {
  constructor(message = 'Invalid status transition') {
    super(message, 400, 'INVALID_TRANSITION');
  }
}

/**
 * Wraps an async Next.js Route Handler with centralized error handling.
 * @param {Function} handler - The async (req, context) => NextResponse function
 */
function wrapHandler(handler) {
  return async function (req, context) {
    try {
      return await handler(req, context);
    } catch (error) {
      console.error('[API Error caught in wrapHandler]:', error);

      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: error.errors.map((e) => ({
              field: e.path.join('.'),
              message: e.message,
            })),
          },
          { status: 400 }
        );
      }

      if (error instanceof AppError) {
        return NextResponse.json(
          {
            error: error.message,
            code: error.code,
            details: error.details,
          },
          { status: error.statusCode }
        );
      }

      // Handle Prisma known request errors if unhandled
      if (error.code === 'P2002') {
        return NextResponse.json(
          {
            error: 'A record with this unique value already exists',
            code: 'DUPLICATE_RESOURCE',
          },
          { status: 409 }
        );
      }

      if (error.code === 'P2025') {
        return NextResponse.json(
          {
            error: 'Resource not found in database',
            code: 'NOT_FOUND',
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          error: error.message || 'Internal Server Error',
          code: 'INTERNAL_SERVER_ERROR',
        },
        { status: 500 }
      );
    }
  };
}

module.exports = {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  InsufficientStockError,
  InvalidTransitionError,
  wrapHandler,
};
