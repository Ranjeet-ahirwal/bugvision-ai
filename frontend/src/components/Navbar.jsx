import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/login");
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">

        <div className="flex h-16 items-center justify-between">

          {/* Brand */}
          <Link
            to="/dashboard"
            onClick={closeMenu}
            className="flex min-w-0 items-center gap-3"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-lg">
              🐞
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-base font-bold text-white sm:text-lg">
                BugVision AI
              </h1>

              <p className="hidden text-xs text-slate-500 sm:block">
                Software Defect Prediction
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-6 md:flex">

            <Link
              to="/dashboard"
              className="text-sm font-medium text-slate-300 transition hover:text-white"
            >
              Dashboard
            </Link>

            {user && (
              <div className="border-l border-slate-800 pl-6">
                <p className="text-sm font-medium text-slate-200">
                  {user.name}
                </p>

                <p className="text-xs text-slate-500">
                  Project Lead
                </p>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-red-500 hover:text-red-400"
            >
              Logout
            </button>

          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg border border-slate-700 p-2 text-slate-300 transition hover:border-slate-500 hover:text-white md:hidden"
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>

        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <div className="border-t border-slate-800 py-4 md:hidden">

            <div className="flex flex-col gap-3">

              <Link
                to="/dashboard"
                onClick={closeMenu}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-900 hover:text-white"
              >
                Dashboard
              </Link>

              {user && (
                <div className="rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-3">
                  <p className="text-sm font-medium text-slate-200">
                    {user.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Project Lead
                  </p>
                </div>
              )}

              <button
                onClick={handleLogout}
                className="w-full rounded-lg border border-slate-700 px-3 py-2 text-left text-sm font-medium text-slate-300 transition hover:border-red-500 hover:text-red-400"
              >
                Logout
              </button>

            </div>

          </div>
        )}

      </div>
    </header>
  );
};

export default Navbar;