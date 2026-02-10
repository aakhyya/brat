import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer
      className="
        bg-black
        border-t-2 border-green-400/30
        px-6 py-8
        mt-auto
      "
    >
      <div
        className="
          max-w-7xl mx-auto
          grid grid-cols-1 md:grid-cols-3 gap-8
          items-center
        "
      >
        {/* ================= LEFT: BRANDING ================= */}
        <div>
          <h2
            className="
              text-2xl font-bold
              bg-gradient-to-r from-green-400 to-purple-400
              bg-clip-text text-transparent
            "
          >
            BRAT
          </h2>
          <p className="text-sm text-gray-400 mt-2">
            don♱ lie to the algorithm𓏲ּ𝄢
          </p>
        </div>

        {/* ================= CENTER: LINKS ================= */}
        <div className="flex justify-center gap-6 flex-wrap">
          {[
            { name: "About", path: "/about" },
            { name: "Privacy Policy", path: "/privacy" },
            { name: "Terms of Service", path: "/terms" },
            { name: "Contact", path: "/contact" },
          ].map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="
                text-green-400
                hover:text-purple-400
                transition-colors
                text-sm
              "
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* ================= RIGHT: COPYRIGHT ================= */}
        <div className="text-center md:text-right text-sm text-green-400">
          ~ Aakhyya<div className="text-gray-400">@ 2026</div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
