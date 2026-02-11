import { useState,useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

    useEffect(() => {
    if (!open) return;
    
    const handleClickOutside = (e) => {
      if (!e.target.closest('.user-menu')) {  // Add class to menu container
        setOpen(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [open]);


  const navLinks = [
    { name: "Search Content", path: "/search" },
    { name: "My Library", path: "/library" },
    // future:
    // { name: "Recommendations", path: "/recommendations" },
    // { name: "Explore", path: "/explore" },
  ];

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav
      className="
        sticky top-0 z-50
        bg-black/80 backdrop-blur-md
        border-b-2 border-green-400/30
        px-6 py-4
      "
    >
      <div className="flex items-center justify-between max-w-9xl mx-auto">
        {/* ================= LEFT: LOGO ================= */}
        <Link
          to="/home"   
          className="
            text-3xl font-black font-serif uppercase tracking-wider
            bg-gradient-to-r from-gray-200 via-gray-400 to-gray-200
            bg-clip-text text-transparent
            hover:scale-105 transition-transform"
        >
          Bra♱
        </Link>

        {/* ================= CENTER: NAV LINKS ================= */}
        <div className="hidden md:flex gap-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={
                  isActive
                    ? `
                      px-4 py-2
                      text-neon-purple
                    `
                    : `
                      px-4 py-2
                      text-neon-green
                      hover:text-chrome-silver
                      transition-colors
                    `
                }
              >
                {link.name}
              </Link>
            );
          })}
          
        
          <button
            onClick={() => setOpen((prev) => !prev)}
            className="
              flex items-center gap-2
              px-4 italic
              border border-chrome-silver
              rounded-md
              text-gray-200
              hover:shadow-[0_0_15px_rgba(34,197,94,0.6)]
              transition-shadow user-menu
            "
          >
            <span className="text-sm font-medium">
              {user?.profile.displayName || "you"}
            </span>
            <span className="text-green-400">⤵︎</span>
          </button>

          {open && (
            <div
              className="
                absolute right-0 mt-3 w-44
                bg-black/90 backdrop-blur-md
                border border-green-400/30
                rounded-md overflow-hidden
                shadow-lg menu
              "
            >
              <button
                className="
                  w-full text-left px-4 py-2
                  text-purple-400 hover:text-green-400
                  hover:bg-green-400/10
                "
                disabled
              >
                Profile
              </button>

              <button
                className="
                  w-full text-left px-4 py-2
                  text-purple-400 hover:text-green-400
                  hover:bg-green-400/10
                "
                disabled
              >
                Settings
              </button>

              <button
                onClick={handleLogout}
                className="
                  w-full text-left px-4 py-2
                  text-red-400 hover:text-red-300
                  hover:bg-red-400/10
                "
              >
                Logout
              </button>
            </div>
          )}
          </div>
      </div>
    </nav>
  );
}

export default Navbar;
