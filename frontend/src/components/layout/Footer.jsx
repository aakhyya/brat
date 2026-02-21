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
          items-center flex justify-between
        "
      >
        <div >
          <h2
            className="
              text-2xl font-bold text-neon-green"
          >
            BRAT
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            don♱ lie to the algorithm𓏲ּ𝄢
          </p>
        </div>
        
        <div className=" text-sm text-neon-green">@ 2026</div>
        
      </div>
    </footer>
  );
}

export default Footer;
