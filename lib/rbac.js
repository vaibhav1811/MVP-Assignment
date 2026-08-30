const { UnauthorizedError, ForbiddenError } = require('./errors');

/**
 * Ensures a user is authenticated.
 * @param {Object|null} user - The user object
 */
function requireAuth(user) {
  if (!user) {
    throw new UnauthorizedError('Authentication required');
  }
  return user;
}

/**
 * Ensures the authenticated user has one of the allowed roles.
 * @param {Object|null} user - The user object
 * @param {string|string[]} allowedRoles - Single role or array of allowed roles
 */
function requireRole(user, allowedRoles) {
  requireAuth(user);

  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  if (!roles.includes(user.role)) {
    throw new ForbiddenError(
      `Forbidden: Action requires one of [${roles.join(', ')}] role(s). Your role is '${user.role}'.`
    );
  }
  return user;
}

module.exports = {
  requireAuth,
  requireRole,
};
