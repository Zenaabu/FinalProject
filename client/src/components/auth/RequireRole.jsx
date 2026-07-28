// ─── RequireRole.jsx ──────────────────────────────────────────────────────────
// Route guard. Wraps an area's layout and only renders it when the logged-in
// user has one of the allowed roles.
//
//   not logged in  -> /login
//   wrong role     -> that user's own home area
//
// The API guards (requireAdmin / requireInstructor) are still the real
// protection — this only keeps a user out of a shell they cannot use.
// ──────────────────────────────────────────────────────────────────────────────

import { Navigate } from "react-router-dom";
import useSession from "./useSession";

// where each role belongs when it lands somewhere it should not be
export const HOME_BY_ROLE = {
  admin: "/admin",
  instructor: "/instructor",
  user: "/user",
};

function RequireRole({ roles, children }) {
  const { user, loading } = useSession();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!roles.includes(user.role)) {
    return <Navigate to={HOME_BY_ROLE[user.role] ?? "/"} replace />;
  }

  return children;
}

export default RequireRole;
