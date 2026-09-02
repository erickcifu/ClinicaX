import { Navigate } from "react-router-dom";

import { useAuth } from "../../features/auth/context/useAuth.js";

export default function RoleRoute({
  allowedRoles,
  children,
}) {
  const { user } = useAuth();

  const userRoleCodes =
    user?.roles?.map(
      (role) => role.codigo
    ) ?? [];

  const isAllowed = allowedRoles.some(
    (role) =>
      userRoleCodes.includes(role)
  );

  if (!isAllowed) {
    return <Navigate to="/" replace />;
  }

  return children;
}
