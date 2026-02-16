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
          bg-gradient-to-br from-black via-gray-600 to-black
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
            text-3xl text-red-400
            hover:text-red-600 hover:scale-150
            transition-all duration-300
          "
        >
          ✘
        </button>

        {/* Main Content */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <img
            src={content.images?.poster || content.images?.backdrop || content.images?.cover|| "/placeholder.jpg"}
            alt={content.title}
            className="
              w-64 h-auto
              rounded-lg
              border-2 border-green-400/30
              mx-auto md:mx-0
            "
          />

          {/* Details */}
          <div className="flex-1">
            <h2
              className="
                text-3xl font-black italic font-serif mb-2 text-chrome-silver
              "
            >
              {content.title}
            </h2>

            {content.creators?.length > 0 && (
              <p className="text-sm text-green-300 mb-6">
                {content.creators?.map(c => typeof c === 'string' ? c : c.name).join(", ")}
              </p>
            )}

            <p className="text-neon-green mb-8">
              {content.description || "No description available."}
            </p>

            

            {/* Rating */}
            <div className="mb-10">
              <StarRating
                rating={interaction?.rating || 0}
                onRate={onRate}
              />
            </div>

            {/* Favorite */}
            <button
              onClick={onFavorite}
              className={`px-4 py-2 rounded-md font-bold
                ${
                  interaction?.isFavorite
                    ? "bg-black border border-pink-300 text-pink-300  hover:border-neon-green hover:text-neon-green"
                    : "bg-black border border-neon-green text-neon-green hover:border-pink-300 hover:text-pink-300"
                }
                transition-all
              `}
            >
              {interaction?.isFavorite ? "remove from favourites" : "add to favorites"}
            </button>


            {/* Delete */}
            <div className="mt-8">
              <button
                onClick={onDelete}
                className="
                  bg-black
                  hover:bg-red-600
                  text-white font-bold
                  px-5 py-2 rounded-md
                  transition-all
                "
              >
                delete from library
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContentModal;
