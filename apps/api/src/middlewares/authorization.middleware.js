export function authorizeRoles(...allowedRoles) {
  return function authorizationMiddleware(
    req,
    res,
    next
  ) {
    try {
      if (!req.auth) {
        const error = new Error(
          "Se requiere autenticación"
        );

        error.statusCode = 401;
        error.code = "AUTH_REQUIRED";

        throw error;
      }

      const userRoles =
        req.auth.roles.map(
          (role) => role.codigo
        );

      const hasPermission =
        allowedRoles.some(
          (role) =>
            userRoles.includes(role)
        );

      if (!hasPermission) {
        const error = new Error(
          "No tiene permisos para realizar esta operación"
        );

        error.statusCode = 403;
        error.code = "FORBIDDEN_ROLE";

        throw error;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}