import { useState, useEffect } from "react";
import api from "../../services/api";
import StarRating from "../ui/StarRating"

function CrossMediaSection({ sourceContent }) {
  const [selectedType, setSelectedType] = useState("movie");
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ratingModal, setRatingModal] = useState(null);

  useEffect(() => {
    async function fetchMatches() {
      if (!sourceContent?._id) return;

      setLoading(true);
      try {
        const res = await api.get(
          `/api/content/${sourceContent._id}/cross-media?targetType=${selectedType}`
        );

        setMatches(res.data.data.matches || []);
      } catch (err) {
        console.error("Failed to fetch cross-media matches:", err);
        setMatches([]);
      } finally {
        setLoading(false);
      }
    }

    fetchMatches();
  }, [selectedType, sourceContent._id]);

   const getScoreColor = (score) => {
        if (score >= 0.85)
            return "bg-green-300/90";
        if (score >= 0.5)
            return "bg-yellow-200/90";
        return "bg-red-300/90";
    };

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-green-400/30">
        {["movie", "song", "book"].map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`
              px-4 py-2 uppercase font-bold text-sm
              transition-all duration-300
              ${
                selectedType === type
                  ? "border-b-2 border-neon-green text-neon-green"
                  : "text-gray-400 hover:text-white"
              }
            `}
          >
            {type}s
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <p className="text-center text-gray-400">
          Loading matches...
        </p>
      ) : matches.length === 0 ? (
        <p className="text-center text-gray-400">
          No similar {selectedType}s found
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {matches.map(({ content, score, connectionType, explanation }) => {
            const percentage = (score * 100).toFixed(0);

            return (
              <div
                key={content._id}
                className="
                  bg-black/40 backdrop-blur-md
                  border border-green-400/30
                  rounded-lg overflow-hidden
                  hover:border-green-400
                  hover:shadow-[0_0_20px_rgba(34,197,94,0.5)]
                  transition-all duration-300
                  flex flex-col
                "
              >
                <div className="w-full aspect-square bg-black/60 overflow-hidden relative">
                {/* Match Badge */}
                                <div
                                    className={`
                    absolute top-2 right-2 z-10
                    px-3 py-1 rounded-full
                    text-black text-xs font-bold
                    ${getScoreColor(score)}
                  `}
                                    title={explanation}
                                >
                                    {percentage}% match
                                </div>

                  {content.images?.poster || content.images?.cover ? (
                    <img
                      src={content.images?.poster || content.images?.cover}
                      alt={content.title}
                      className="w-full h-full object-cover hover:scale-110 transition-all duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm opacity-50">
                      No Image
                    </div>
                  )}
                </div>

                <div className="p-3 flex flex-col gap-2">
                  <h3 className="text-lg font-bold text-neon-green">
                    {content.title}
                  </h3>

                  <p className="text-sm text-chrome-silver line-clamp-2 italic tracking-wide">
                     Similar <span className="text-neon-green"> {connectionType} </span>
                     <div>✴ <span className="  text-pink-300">{explanation} </span></div>
                  </p>

                  <button
                    onClick={() => setRatingModal(content)}
                    className="
                      mt-auto px-3 py-2 rounded-md
                      text-sm font-bold uppercase
                      bg-gradient-to-r from-green-400 to-green-600
                      text-black
                      hover:shadow-[0_0_20px_rgba(34,197,94,0.8)]
                      transition-all duration-300
                    "
                  >
                    Add to Library
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {ratingModal && (
  <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
    <div className="bg-black border-2 border-green-400 p-8 rounded-lg">
      <h3 className="text-2xl mb-4 text-white">
        Rate <span className="text-neon-green">{ratingModal.title}</span>
      </h3>
      <StarRating
        rating={0}
        onRate={async (rating) => {
          await api.post(`/api/content/${ratingModal._id}/rate`, { rating });
          setRatingModal(null);
          // Optionally show success message
        }}
      />
    </div>
  </div>
)}

    </div>
  );
}

export default CrossMediaSection;
