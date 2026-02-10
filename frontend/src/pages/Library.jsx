import { useEffect, useState } from "react";
import { contentApi } from "../services/contentApi";
import StarRating from "../components/ui/StarRating";

function Library() {
    const [library, setLibrary] = useState([]);
    const [filter, setFilter] = useState("all"); // all movie song book
    const [sortBy, setSortBy] = useState("newest"); // newest | rating | a-z
    const [page, setPage] = useState(1);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchLibrary() {
            setLoading(true);
            setError(null);

            try {
                const res = await contentApi.getUserLibrary(filter, sortBy, page);
                setLibrary(res.data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        }

        fetchLibrary();
    }, [filter, sortBy, page]);
    return (
        <div className=" min-h-screen
      bg-black
      relative
      text-white
      px-6 py-10">

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
                    <option value="az">a-z</option>
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
                    <p className="text-xl mb-4">you're giving tasteless❗</p>
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
                            className="
              bg-black/40 border border-purple-500/20
              rounded-xl p-4
              hover:border-green-400/50 transition-all
            "
                        >
                            <h3 className="text-lg font-bold text-gray-200 mb-1">
                                {item.content.title}
                            </h3>

                            <p className="text-purple-400 text-sm">
                                {item.content.type.toUpperCase()}
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


                            {item.isFavorite && (
                                <p className="text-pink-400 mt-1">
                                    ♥ Favorite
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

}

export default Library;
