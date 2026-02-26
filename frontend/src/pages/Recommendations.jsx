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
                setError("Failed to load recommendations");
            } finally {
                setLoading(false);
            }
        }
        fetchRecommendations();
    }, []);

    const getScoreColor = (score) => {
        if (score >= 0.85) return "bg-green-400 text-black";
        if (score >= 0.5) return "bg-yellow-400 text-black";
        return "bg-red-400 text-black";
    };

    return (
        <div className="min-h-screen bg-black text-white px-4 sm:px-6 py-6 sm:py-10">
            {/* Header */}
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-black uppercase text-chrome mb-4 sm:mb-6 text-center">
                    Your Recommendations
                </h1>

                {/* Results Count */}
                {!loading && recommendations.length > 0 && (
                    <p className="text-center text-chrome-silver italic mb-6 sm:mb-8 text-sm sm:text-base">
                        <span className="text-neon-green font-bold text-lg sm:text-xl">{recommendations.length}</span> personalized picks
                    </p>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-12 sm:py-20">
                        <div className="animate-pulse text-neon-green text-lg sm:text-xl mb-4">Loading your taste profile...</div>
                        <div className="flex gap-2">
                            <div className="w-3 h-3 bg-neon-green rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                            <div className="w-3 h-3 bg-neon-green rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                            <div className="w-3 h-3 bg-neon-green rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="flex flex-col items-center justify-center py-12 sm:py-20">
                        <p className="text-red-400 text-lg sm:text-xl mb-4">🚨 {error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2 border border-red-400 rounded-md text-red-400 hover:bg-red-400/10 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && recommendations.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 sm:py-20 text-center px-4">
                        <div className="text-6xl sm:text-8xl mb-6">𓇢𓆸</div>
                        <p className="text-neon-green text-xl sm:text-2xl mb-3">no recommendations yet</p>
                        <p className="text-gray-400 text-sm sm:text-base mb-6">Rate some content to get personalized picks</p>
                        <a
                            href="/search"
                            className="px-6 py-3 bg-gradient-to-r from-green-400 to-green-600 text-black font-bold rounded-md hover:shadow-[0_0_25px_rgba(34,197,94,0.9)] transition-all"
                        >
                            Start Rating Content 🔪
                        </a>
                    </div>
                )}

                {/* Recommendations Grid */}
                {!loading && !error && recommendations.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
                        {recommendations.map(({ content, score, explanation }) => {
                            const safeScore = Math.max(0, score);
                            const percentage = (safeScore * 100).toFixed(0);

                            return (
                                <div
                                    key={content._id}
                                    className="bg-black/40 backdrop-blur-md border border-green-400/30 rounded-lg overflow-hidden hover:border-neon-green hover:scale-105 transition-all duration-300 flex flex-col h-full relative group"
                                >
                                    {/* Match Badge */}
                                    <div
                                        className={`absolute top-2 right-2 z-10 px-2 sm:px-3 py-1 rounded-full text-xs font-bold shadow-lg ${getScoreColor(
                                            score
                                        )}`}
                                        title={explanation}
                                    >
                                        {percentage}%
                                    </div>

                                    {/* Image Container */}
                                    <div className="w-full aspect-[2/3] bg-black/60 overflow-hidden relative">
                                        {content.images?.poster || content.images?.backdrop || content.images?.cover ? (
                                            <img
                                                src={content.images?.poster || content.images?.backdrop || content.images?.cover}
                                                alt={content.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs sm:text-sm opacity-50 text-gray-400">
                                                No Image
                                            </div>
                                        )}

                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3 sm:p-4">
                                            {explanation && (
                                                <p className="text-xs sm:text-sm text-gray-300 line-clamp-2">{explanation}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Content Info */}
                                    <div className="p-3 sm:p-4 flex flex-col flex-1 gap-2 sm:gap-3">
                                        <div className="flex-1">
                                            <h3 className="text-sm sm:text-base md:text-lg font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent line-clamp-2 mb-1">
                                                {content.title}
                                            </h3>
                                            <p className="text-xs text-gray-400 capitalize">{content.type}</p>
                                        </div>

                                        {/* Add Button */}
                                        <button
                                            onClick={() => setRatingModal(content)}
                                            className="w-full px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm uppercase tracking-wider font-bold text-black bg-gradient-to-r from-green-400 to-green-600 shadow-[0_0_15px_rgba(34,197,94,0.6)] hover:shadow-[0_0_25px_rgba(34,197,94,0.9)] transition-all duration-300"
                                        >
                                            + Add
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Rating Modal */}
            {ratingModal && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-black border-2 border-green-400 p-6 sm:p-8 rounded-lg max-w-md w-full shadow-[0_0_40px_rgba(34,197,94,0.5)] animate-fadeIn">
                        {/* Close Button */}
                        <button
                            onClick={() => setRatingModal(null)}
                            className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-red-400 transition-colors"
                        >
                            ✕
                        </button>

                        <h3 className="text-xl sm:text-2xl mb-4 pr-8 break-words">
                            Rate <span className="text-neon-green font-bold">{ratingModal.title}</span>
                        </h3>

                        <StarRating
                            rating={0}
                            onRate={async (rating) => {
                                try {
                                    await api.post(`/api/content/${ratingModal._id}/rate`, { rating });
                                    setRatingModal(null);
                                    // Refresh recommendations
                                    const res = await api.get("/api/content/recommendations");
                                    setRecommendations(res.data.recommendations || []);
                                } catch (err) {
                                    console.error("Failed to rate:", err);
                                }
                            }}
                        />

                        <p className="text-xs sm:text-sm text-gray-400 mt-4 text-center">
                            Your rating helps improve recommendations
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Recommendations;
