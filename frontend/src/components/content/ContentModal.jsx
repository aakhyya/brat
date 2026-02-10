import { useEffect } from "react";
import StarRating from "../ui/StarRating";

function ContentModal({
  content,
  interaction,
  isOpen,
  onClose,
  onRate,
  onFavorite,
  onDelete,
}) {
  // 1️⃣ Exit early if modal is closed
  if (!isOpen || !content) return null;

  // 2️⃣ Escape key + body scroll lock
  useEffect(() => {
    function handleEsc(e) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [onClose]);

  return (
    /* Backdrop */
    <div
      className="
        fixed inset-0 z-50
        bg-black/80 backdrop-blur-sm
        flex items-center justify-center
      "
      onClick={onClose}
    >
      {/* Modal Container */}
      <div
        className="
          bg-gradient-to-br from-black via-purple-900 to-green-900/20
          border-2 border-green-400
          rounded-lg
          shadow-[0_0_40px_rgba(34,197,94,0.5)]
          max-w-3xl w-full max-h-[90vh]
          overflow-y-auto p-8
          relative
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="
            absolute top-4 right-4
            text-3xl text-green-400
            hover:text-green-300 hover:rotate-90
            transition-all duration-300
          "
        >
          ×
        </button>

        {/* Main Content */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <img
            src={content.images?.poster || "/placeholder.jpg"}
            alt={content.title}
            className="
              w-64 h-auto
              rounded-lg
              border-2 border-green-400/30
              shadow-[0_0_20px_rgba(34,197,94,0.3)]
              mx-auto md:mx-0
            "
          />

          {/* Details */}
          <div className="flex-1">
            <h2
              className="
                text-4xl font-black uppercase mb-3
                bg-gradient-to-r from-green-400 to-purple-400
                bg-clip-text text-transparent
              "
            >
              {content.title}
            </h2>

            <p className="text-purple-300 mb-4">
              {content.description || "No description available."}
            </p>

            {content.creators?.length > 0 && (
              <p className="text-sm text-green-300 mb-4">
                By: {content.creators.join(", ")}
              </p>
            )}

            {/* Rating */}
            <div className="mb-6">
              <StarRating
                rating={interaction?.rating || 0}
                onRate={onRate}
              />
            </div>

            {/* Favorite */}
            <button
              onClick={onFavorite}
              className={`
                mb-6 px-4 py-2 rounded-md font-bold
                ${
                  interaction?.isFavorite
                    ? "bg-pink-500 text-black shadow-[0_0_20px_rgba(236,72,153,0.8)]"
                    : "bg-black border border-pink-500 text-pink-400 hover:bg-pink-500 hover:text-black"
                }
                transition-all
              `}
            >
              {interaction?.isFavorite ? "♥ Favorited" : "♡ Add to Favorites"}
            </button>

            {/* Delete */}
            <div className="mt-8">
              <button
                onClick={onDelete}
                className="
                  bg-gradient-to-r from-red-500 to-red-700
                  hover:shadow-[0_0_20px_rgba(239,68,68,0.8)]
                  text-white font-bold uppercase
                  px-6 py-3 rounded-md
                  transition-all
                "
              >
                Delete from Library
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContentModal;
