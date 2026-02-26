import { useEffect, useState } from "react";
import api from "../services/api";
import StarRating from "../components/ui/StarRating";

function Recommendations() {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [ratingModal, setRatingModal] = useState(null);

    useEffect(() => {
        async function fetchRecommendations() {
            try {
                setLoading(true);
                const res = await api.get("/api/content/recommendations");
                setRecommendations(res.data.recommendations || []);
            } catch (err) {
                setError("Failed to load recommendations", err);
            } finally {
                setLoading(false);
            }
        }
        fetchRecommendations();
    }, []);

    const getScoreColor = (score) => {
        if (score >= 0.85)
            return "bg-green-300";
        if (score >= 0.5)
            return "bg-yellow-200";
        return "bg-red-300";
    };

    return (
        <div className="min-h-screen bg-black text-white px-6 py-10">
            <h1
                className="
          text-7xl md:text-4xl
          font-serif font-black uppercase
          text-chrome mb-8 text-center
        "
            >
                Your Recommendations
            </h1>
            <p className="text-center text-neon-green italic mb-6">
                {recommendations.length} <span className="text-chrome-silver">results found</span>
            </p>

            {loading && (
                <p className="text-center text-neon-green">Loading your taste profile...</p>
            )}

            {error && (
                <p className="text-center text-red-400">🚨 {error}</p>
            )}

            {!loading && !error && recommendations.length === 0 && (
                <>
                    <p className="text-neon-green text-center">
                        no recommendations yet 𓇢𓆸
                    </p>
                    <p className="text-gray-300 text-center">
                        Go rate some content 🔪
                    </p>
                </>
            )}

            {!loading && !error && recommendations.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {recommendations.map(({ content, score, explanation }) => {
                        const safeScore = Math.max(0, score);
                        const percentage = (safeScore * 100).toFixed(0);


                        return (
                            <div
                                key={content._id}
                                className="
                  bg-black/40 backdrop-blur-md
                  border border-green-400/30
                  rounded-lg overflow-hidden
                  hover:border-neon-green
                  transition-all duration-300 flex flex-col h-full
                  relative
                "
                            >
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

                                {/* Image */}
                                <div className="w-full aspect-square bg-black/60 overflow-hidden">
                                    {(content.images?.poster || content.images?.backdrop || content.images?.cover) ? (
                                        <img
                                            src={content.images?.poster || content.images?.backdrop || content.images?.cover || "/placeholder.jpg"}
                                            alt={content.title}
                                            className="
                        w-full h-full object-cover
                        hover:scale-110
                        transition-all duration-500
                      "
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-sm opacity-50">
                                            No Image
                                        </div>
                                    )}
                                </div>

                                {/* Content Info */}
                                <div className="p-4 flex flex-col flex-1 gap-3">
                                    <div>
                                        <h3
                                            className="
        text-xl font-bold
        bg-neon-green
        bg-clip-text text-transparent
      "
                                        >
                                            {content.title}
                                        </h3>
                                        {explanation && (
                                            <p className="text-sm italic text-chrome-silver">
                                                {explanation}
                                            </p>
                                        )}

                                    </div>

                                    <div className="mt-auto">
                                        <p className="text-xs text-gray-400 capitalize mb-3">
                                            {content.type}
                                        </p>

                                        <button
                                            onClick={() => setRatingModal(content)}
                                            className="
        w-full px-4 py-2 rounded-md
        uppercase tracking-wider font-bold
        text-black
        bg-gradient-to-r from-green-400 to-green-600
        shadow-[0_0_15px_rgba(34,197,94,0.6)]
        hover:shadow-[0_0_25px_rgba(34,197,94,0.9)]
        transition-all duration-300
      "
                                        >
                                            add to library
                                        </button>
                                    </div>
                                </div>

                            </div>
                        );
                    })}
                </div>
            )}

            {/* Rating Modal */}
            {ratingModal && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
                    <div className="bg-black border-2 border-green-400 p-8 rounded-lg">
                        <h3 className="text-2xl mb-4">
                            Rate{" "}
                            <span className="text-neon-green">
                                {ratingModal.title}
                            </span>
                        </h3>
                        <StarRating
                            rating={0}
                            onRate={async (rating) => {
                                await api.post(
                                    `/api/content/${ratingModal._id}/rate`,
                                    { rating }
                                );
                                setRatingModal(null);
                                // Optionally refresh recommendations
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default Recommendations;
