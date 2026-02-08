import { useEffect, useState } from "react";
import { contentApi } from "../services/contentApi";

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
        <div className="bg-gradient-to-br from-black via-purple-900/50 to-black min-h-screen px-6 py-10">

            {/* Header */}
            <h1
                className="
        text-6xl font-black uppercase text-center mb-8
        bg-gradient-to-r from-gray-200 via-gray-400 to-gray-200
        bg-clip-text text-transparent
      "
            >
                MY LIBRARY
            </h1>

            {/* Filters */}
            <div className="flex justify-center gap-4 mb-6 flex-wrap">
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
                                    ? "border-green-400 bg-gradient-to-r from-green-400 to-purple-500 text-black font-bold shadow-[0_0_20px_rgba(34,197,94,0.7)]"
                                    : "border-purple-500/30 bg-transparent text-purple-400 hover:border-purple-400"
                                }
            `}
                        >
                            {f.toUpperCase()}
                        </button>
                    );
                })}
            </div>

            {/* Sort Dropdown */}
            <div className="flex justify-center mb-8">
                <select
                    value={sortBy}
                    onChange={(e) => {
                        setSortBy(e.target.value);
                        setPage(1);
                    }}
                    className="
          bg-black/40 border border-green-400/40
          px-4 py-2 rounded-md text-green-300
          focus:outline-none
          focus:shadow-[0_0_15px_rgba(34,197,94,0.6)]
        "
                >
                    <option value="newest">Newest</option>
                    <option value="rating">Highest Rated</option>
                    <option value="az">A–Z</option>
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
                    <p className="text-xl mb-4">Your library is empty.</p>
                    <a
                        href="/search"
                        className="text-green-400 underline hover:text-green-300"
                    >
                        Discover content →
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

                            {item.rating && (
                                <p className="text-green-400 mt-2">
                                    ⭐ {item.rating}
                                </p>
                            )}

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
