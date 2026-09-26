import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const ProtectedRoute = () => {
  const {
    isAuthenticated,
    loading
  } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 px-8 py-6 text-center">
          <p className="text-sm text-slate-400">
            Loading BugVision AI...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;