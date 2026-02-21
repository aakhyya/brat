import { useEffect, useState } from "react";
import { contentApi } from "../services/contentApi";
import StarRating from "../components/ui/StarRating";
import ContentModal from "../components/content/ContentModal";
import CrossMediaSection from "../components/content/CrossMediaSection";

function Library() {
    const [library, setLibrary] = useState([]);
    const [filter, setFilter] = useState("all"); // all movie song book
    const [sortBy, setSortBy] = useState("newest"); // newest | rating | a-z
    const [page, setPage] = useState(1);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedForCrossMedia, setSelectedForCrossMedia] = useState(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchLibrary() {
            setLoading(true);
            setError(null);

            try {
                const res = await contentApi.getUserLibrary(filter, sortBy, page);
                setLibrary(res);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        }

        fetchLibrary();
    }, [filter, sortBy, page]);
    return (
        <div className=" min-h-full
  bg-black
  text-white
  px-6 py-10
  flex flex-col">

            <div className="flex-1">

                {/* Header */}
                <h1
                    className="
                                text-7xl
                                md:text-4xl
                                font-serif
                                font-black
                                uppercase
                                text-chrome
                                mb-10 
                                text-center
      "
                >
                    MY LIBRARY
                </h1>

                {/* Filters */}
                <div className="flex justify-center gap-4 mb-10 flex-wrap">
                    {["all", "movie", "song", "book"].map((f) => {
                        const active = filter === f;

                        return (
                            <button
                                key={f}
                                onClick={() => {
                                    setFilter(f);
                                    setPage(1);
                                }}
                                className={`
              px-6 py-2 border-2 transition-all
              ${active
                                        ? "border-chrome-silver-400 bg-gradient-to-br from-black to-neon-green text-black font-bold shadow-[0_0_20px_rgba(34,197,94,0.7)]"
                                        : "border-neon-green/30 bg-transparent text-chrome-silver-400 hover:border-chrome-silver"
                                    }
            `}
                            >
                                {f.toUpperCase()}
                            </button>
                        );
                    })}
                </div>

                <div className="flex justify-center mb-8">
                    <select
                        value={sortBy}
                        onChange={(e) => {
                            setSortBy(e.target.value);
                            setPage(1);
                        }}
                        className="
    bg-black/70
    border border-neon-green/50
    px-4 py-2 rounded-md
    text-neon-green
    font-semibold
    focus:outline-none
    focus:border-neon-green
    focus:shadow-[0_0_15px_rgba(34,197,94,0.6)]">
                        <option value="newest">latest</option>
                        <option value="rating">highest rated</option>
                        <option value="title">a-z</option>
                    </select>
                </div>

                {/* Loading Skeleton */}
                {loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className="h-60 bg-white/5 animate-pulse rounded-xl"
                            />
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && library.length === 0 && (
                    <div className="text-center text-purple-300 mt-20">
                        <p className="text-xl mb-4">you're giving tasteless 𓇢𓆸</p>
                        <a
                            href="/search"
                            className="text-green-400 underline hover:text-green-300 no-underline"
                        >
                            go discover content ᯓ➤
                        </a>
                    </div>
                )}

                {/* Content Grid */}
                {!loading && !error && library.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {library.map((item) => (
                            <div
                                key={item.content._id}
                                onClick={() => {
                                    setSelectedItem(item);
                                    setIsModalOpen(true);
                                }}
                                className="
                                bg-black/40 border border-green-400/30
                                rounded-xl p-4 cursor-pointer
                                hover:border-green-400/60 transition-all
                            "
                            >
                                <div className="flex justify-between">
                                    <div>
                                    <h3 className="text-lg font-bold  text-neon-green">
                                        {item.isFavorite && (
                                            <span className="text-pink-400 mr-2">
                                                ★
                                            </span>
                                        )}
                                        {item.content.title}
                                    </h3>
                                    </div>
                                    <div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation(); // prevent modal from opening
                                            setSelectedForCrossMedia(item.content);
                                        }}
                                        className="
                                            px-3 py-2 rounded-md
                                            text-sm font-bold border border-pink-300
                                            text-chrome-silver
                                            hover:shadow-[0_0_20px_rgba(168,85,247,0.6)]
                                            transition-all duration-300
                                        "
                                    >
                                        🔗 similar content
                                    </button>
                                    </div>
                                </div>
                                <p className="text-gray-200 mb-1 text-md">
                                    {item.content.type}
                                </p>

                                <StarRating
                                    rating={item.rating || 0}
                                    onRate={async (newRating) => {
                                        try {
                                            await contentApi.rateContent(item.content._id, newRating);

                                            // optimistic UI update
                                            setLibrary((prev) =>
                                                prev.map((libItem) =>
                                                    libItem.content._id === item.content._id
                                                        ? { ...libItem, rating: newRating }
                                                        : libItem
                                                )
                                            );
                                        } catch (err) {
                                            console.error("Failed to rate content", err);
                                        }
                                    }}
                                />

                            </div>
                        ))}
                    </div>
                )}
                {isModalOpen && selectedItem && (
                    <ContentModal
                        isOpen={isModalOpen}
                        content={selectedItem.content}
                        interaction={selectedItem}
                        onClose={() => setIsModalOpen(false)}
                        onRate={async (rating) => {
                            await contentApi.rateContent(selectedItem.content._id, rating);
                            setLibrary((prev) =>
                                prev.map((i) =>
                                    i.content._id === selectedItem.content._id
                                        ? { ...i, rating }
                                        : i
                                )
                            );
                        }}
                        onFavorite={async () => {
                            const res = await contentApi.toggleFavorite(
                                selectedItem.content._id
                            );
                            setLibrary((prev) =>
                                prev.map((i) =>
                                    i.content._id === selectedItem.content._id
                                        ? { ...i, isFavorite: res.data.isFavorite }
                                        : i
                                )
                            );
                        }}
                        onDelete={async () => {
                            const contentId = selectedItem.content._id;
                            const previousLibrary = library;

                            try {
                                // optimistic
                                setLibrary((prev) =>
                                    prev.filter(
                                        (i) => i.content._id !== contentId
                                    )
                                );

                                await contentApi.deleteInteraction(contentId);
                                setIsModalOpen(false);

                            } catch (err) {
                                console.error("Failed to delete interaction:", err);

                                // rollback
                                setLibrary(previousLibrary);

                                alert("Delete failed. Restored item.");
                            }
                        }}

                    />
                )}
            </div>

            <div className="flex justify-center gap-6 mt-auto pt-10">
                <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                >
                    ◀
                </button>
                <span className="text-neon-green">{page}</span>
                <button onClick={() => setPage(p => p + 1)}>
                    ▶
                </button>
            </div>
            {/* Cross-Media Modal */}
            {selectedForCrossMedia && (
                <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
                    <div className="bg-black border-2 border-green-400 rounded-lg p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto relative shadow-[0_0_40px_rgba(34,197,94,0.5)]">

                        {/* Close button */}
                        <button
                            onClick={() => setSelectedForCrossMedia(null)}
                            className="absolute top-4 right-4
            text-3xl text-red-400
            hover:text-red-600 hover:scale-150
            transition-all duration-300"
                        >
                            ✘
                        </button>

                        {/* Header */}
                        <h2 className="text-3xl text-white  mb-2">
                            <span className=" text-neon-green italic font-semibold">
                                {selectedForCrossMedia.title}
                            </span> coded
                        </h2>

                        <p className="text-gray-400 mb-6">
                            
                        </p>

                        {/* Cross-media section */}
                        <CrossMediaSection sourceContent={selectedForCrossMedia} />
                    </div>
                </div>
            )}

        </div>
    );

}

export default Library;
