import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import api from "../../services/api";

function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Delete account states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    if (!open) return;
    
    const handleClickOutside = (e) => {
      if (!e.target.closest('.user-menu')) {
        setOpen(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [open]);

  const navLinks = [
    { name: "Search Content", path: "/search" },
    { name: "Recommendations", path: "/recommendations" },
    { name: "My Library", path: "/library" },
  ];

  function handleLogout() {
    logout();
    navigate("/login");
    setMobileMenuOpen(false);
  }

  function handleProfile() {
    navigate("/taste-graph");
    setMobileMenuOpen(false);
  }

  function handleNavClick() {
    setMobileMenuOpen(false);
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      setDeleteError("Please type DELETE to confirm");
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await api.delete('/api/auth/account');
      logout();
      navigate('/');
    } catch (err) {
      console.error('Failed to delete account:', err);
      setDeleteError(err.response?.data?.message || 'Failed to delete account');
      setIsDeleting(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
    setOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b-2 border-green-400/30">
      <div className="px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* LOGO */}
          <Link
            to="/home"
            className="text-2xl sm:text-3xl font-black font-serif uppercase tracking-wider bg-gradient-to-r from-gray-200 via-gray-400 to-gray-200 bg-clip-text text-transparent hover:scale-105 transition-transform"
          >
            Bra♱
          </Link>

          {/* DESKTOP NAV */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-4 py-2 transition-colors ${
                    isActive ? "text-neon-purple" : "text-neon-green hover:text-chrome-silver"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}

            <div className="relative">
              <button
                onClick={() => setOpen((prev) => !prev)}
                className="flex items-center gap-2 px-4 py-2 italic border border-chrome-silver rounded-md text-gray-200 hover:shadow-[0_0_15px_rgba(34,197,94,0.6)] transition-shadow user-menu"
              >
                <span className="text-sm font-medium">{user?.profile.displayName || "you"}</span>
                <span className="text-green-400">⤵︎</span>
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-44 bg-black/90 backdrop-blur-md border border-green-400/30 rounded-md overflow-hidden shadow-lg">
                  <button
                    onClick={handleProfile}
                    className="w-full text-left px-4 py-2 text-green-400 hover:text-purple-400 hover:bg-green-400/10"
                  >
                    Profile
                  </button>
                  <button
                    onClick={handleDeleteClick}
                    className="w-full text-left px-4 py-2 text-orange-400 hover:text-orange-300 hover:bg-orange-400/10"
                  >
                    Delete Account
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* MOBILE HAMBURGER */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-neon-green hover:text-chrome-silver transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* MOBILE MENU */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-green-400/30 pt-4">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={handleNavClick}
                    className={`px-4 py-3 rounded-md transition-colors ${
                      isActive
                        ? "bg-green-400/10 text-neon-purple border border-green-400/30"
                        : "text-neon-green hover:bg-green-400/5"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
              <button
                onClick={handleProfile}
                className="text-left px-4 py-3 rounded-md text-green-400 hover:bg-green-400/5 transition-colors"
              >
                Profile - {user?.profile.displayName || "you"}
              </button>
              <button
                onClick={handleDeleteClick}
                className="text-left px-4 py-3 rounded-md text-orange-400 hover:bg-orange-400/10 transition-colors"
              >
                Delete Account
              </button>
              <button
                onClick={handleLogout}
                className="text-left px-4 py-3 rounded-md text-red-400 hover:bg-red-400/10 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed h-[800px] inset-0  flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-black border-2 border-red-500 rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.5)] max-w-md w-full p-4 sm:p-6 lg:p-8 animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="text-center mb-4 sm:mb-6">
              <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">⚠️</div>
              <h2 className="text-2xl sm:text-3xl font-black text-red-400 mb-2 uppercase tracking-tight">
                Delete Account?
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm">
                This action cannot be undone
              </p>
            </div>

            {/* Warning Message */}
            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <p className="text-red-300 text-xs sm:text-sm leading-relaxed">
                All your data will be permanently deleted including:
              </p>
              <ul className="text-red-300 text-xs sm:text-sm mt-2 space-y-1 list-disc list-inside">
                <li>Your library and ratings</li>
                <li>Your taste profile</li>
                <li>All recommendations</li>
                <li>Account information</li>
              </ul>
            </div>

            {/* Confirmation Input */}
            <div className="mb-4 sm:mb-6">
              <label className="block text-gray-300 text-xs sm:text-sm mb-2 font-mono">
                Type <span className="text-red-400 font-bold">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => {
                  setDeleteConfirmText(e.target.value);
                  setDeleteError(null);
                }}
                placeholder="DELETE"
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-black border-2 border-red-500/50 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                disabled={isDeleting}
              />
              {deleteError && (
                <p className="text-red-400 text-xs sm:text-sm mt-2">{deleteError}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText("");
                  setDeleteError(null);
                }}
                disabled={isDeleting}
                className="flex-1 px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base bg-black border-2 border-neon-green text-neon-green font-bold rounded-lg hover:bg-neon-green hover:text-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting || deleteConfirmText !== "DELETE"}
                className="flex-1 px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base bg-red-600 border-2 border-red-500 text-white font-bold rounded-lg hover:bg-red-700 hover:shadow-[0_0_20px_rgba(239,68,68,0.6)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete Forever'}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
