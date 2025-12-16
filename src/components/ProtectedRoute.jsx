import { Outlet, Navigate } from "react-router-dom";
import { usePrivy } from "@privy-io/react-auth";

const ProtectedRoute = () => {
  const { ready, authenticated } = usePrivy();

  if (!ready) return null;

  if (!authenticated) return <Navigate to="/" replace />;

  return <Outlet />;
};

export default ProtectedRoute;
