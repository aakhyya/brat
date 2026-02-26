import { useRef, useEffect, useState } from "react";
import { contentApi } from "../services/contentApi";
import ResultSkeleton from "../components/content/ResultSkeleton";
import ErrorMessage from "../components/content/ErrorMessage";
import ResultCard from "../components/content/ResultCard";
import StarRating from "../components/ui/StarRating";

function ContentSearch() {
    const [activeTab, setActiveTab] = useState("movie");
    const [searchQuery, setSearchQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [ratingModal, setRatingModal] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const ITEMS_PER_PAGE = 20;

    const debounceRef = useRef(null);
    const lastSearchRef = useRef("");

    async function handleSearch(skipDuplicateCheck = false) {
        const query = searchQuery.trim();
        if (query.length < 2) {
            setResults([]);
            setError("Type at least 2 characters");
            return;
        }

        if (!skipDuplicateCheck && query === lastSearchRef.current) return;
        lastSearchRef.current = query;

        setLoading(true);
        setError(null);
        setResults([]);

        try {
            let data = [];

            if (activeTab === "movie") {
                data = await contentApi.searchMovies(query, currentPage);
            } else if (activeTab === "song") {
                data = await contentApi.searchSongs(query, currentPage);
            } else if (activeTab === "book") {
                data = await contentApi.searchBooks(query, currentPage);
            }

            setResults(data);
            setTotalResults(data.length || 0);
        } catch (err) {
            setError(err.message || "Search failed");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const query = searchQuery.trim();
        if (query.length < 2) return;
        if (query === lastSearchRef.current) return;

        debounceRef.current && clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(async () => {
            lastSearchRef.current = query;
            setLoading(true);
            setError(null);
            setResults([]);

            try {
                let data = [];
                if (activeTab === "movie") {
                    data = await contentApi.searchMovies(query, currentPage);
                } else if (activeTab === "song") {
                    data = await contentApi.searchSongs(query, currentPage);
                } else if (activeTab === "book") {
                    data = await contentApi.searchBooks(query, currentPage);
                }
                setResults(data);
                setTotalResults(data.length || 0);
            } catch (err) {
                setError(err.message || "Search failed");
            } finally {
                setLoading(false);
            }
        }, 400);

        return () => clearTimeout(debounceRef.current);
    }, [searchQuery, activeTab]);

    useEffect(() => {
        if (searchQuery.trim().length >= 2 && currentPage > 1) {
            handleSearch(true);
        }
    }, [currentPage]);

    function handleTabChange(tab) {
        if (tab === activeTab) return;
        clearTimeout(debounceRef.current);
        setActiveTab(tab);
        setResults([]);
        setError(null);
        lastSearchRef.current = "";
        setCurrentPage(1);
    }

    return (
        <div className="min-h-screen bg-black relative text-white px-4 sm:px-6 py-6 sm:py-10">
            {/* Header */}
            <header className="mb-6 sm:mb-10 text-center">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-black uppercase text-chrome mb-4">
                    BRAT CONTENT SEARCH
                </h1>
            </header>

            {/* Tabs */}
            <div className="flex justify-center gap-2 sm:gap-4 md:gap-6 mb-6 sm:mb-8 flex-wrap px-2">
                {["movie", "song", "book"].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => handleTabChange(tab)}
                        className={`px-4 sm:px-6 py-2 tracking-wider rounded-md transition-all duration-300 font-serif text-sm sm:text-base ${
                            activeTab === tab
                                ? "bg-gradient-to-br from-black to-neon-green border-2 text-black font-bold shadow-[0_0_20px_rgba(34,197,94,0.7)]"
                                : "bg-transparent border border-neon-green/40 text-chrome-silver hover:border-chrome-silver"
                        }`}
                    >
                        {tab}s
                    </button>
                ))}
            </div>

            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-8 sm:mb-12 max-w-2xl mx-auto px-2">
                <input
                    type="search"
                    aria-label={`Search ${activeTab}s`}
                    autoComplete="off"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            handleSearch();
                        }
                    }}
                    placeholder={`search ${activeTab}s...`}
                    className="w-full bg-black/40 backdrop-blur-md border border-neon-green rounded-md px-4 py-2 sm:py-3 outline-none focus:shadow-[0_0_25px_rgba(34,197,94,0.6)] transition text-sm sm:text-base"
                />
                <button
                    type="button"
                    onClick={handleSearch}
                    className="w-full sm:w-auto px-6 py-2 sm:py-3 bg-black/40 border border-neon-green rounded-md font-bold tracking-wider hover:shadow-[0_0_25px_rgba(34,197,94,0.9)] transition-shadow duration-300 text-sm sm:text-base whitespace-nowrap"
                >
                    search
                </button>
            </div>

            {/* Total Results */}
            {!loading && totalResults > 0 && (
                <p className="text-center text-chrome-silver italic text-sm sm:text-md mb-6">
                    <span className="text-neon-green text-lg sm:text-xl font-bold">{totalResults}</span> results on this page
                </p>
            )}

            {/* Results Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6 px-2">
                {loading && <ResultSkeleton />}
                {!loading && error && <ErrorMessage message={error} onRetry={handleSearch} />}
                {!loading && !error && results.length === 0 && searchQuery.trim().length >= 2 && (
                    <p className="col-span-full text-center text-purple-400 text-sm sm:text-base py-8">
                        No results found. Try a different search term 𓇢𓆸
                    </p>
                )}
                {!loading &&
                    !error &&
                    results.map((item) => (
                        <ResultCard key={item.externalId} item={item} type={activeTab} onAdd={(savedContent) => setRatingModal(savedContent)} />
                    ))}
            </div>

            {/* Rating Modal */}
            {ratingModal && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                    <div className="bg-black border-2 border-green-400 p-6 sm:p-8 rounded-lg max-w-md w-full">
                        <h3 className="text-xl sm:text-2xl mb-4 break-words">
                            Rate <span className="text-neon-green">{ratingModal.content.title}</span>
                        </h3>
                        <StarRating
                            rating={0}
                            onRate={async (rating) => {
                                await contentApi.rateContent(ratingModal.content._id, rating);
                                setRatingModal(null);
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Pagination */}
            {!loading && !error && results.length > 0 && (
                <div className="flex justify-center items-center gap-3 sm:gap-4 mt-8 px-2">
                    <button
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className={`px-4 sm:px-6 py-2 rounded-md font-bold tracking-wider border border-neon-green text-sm sm:text-base ${
                            currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:shadow-[0_0_25px_rgba(34,197,94,0.9)]"
                        } transition-all duration-300`}
                    >
                        ◀
                    </button>
                    <span className="text-chrome-silver text-sm sm:text-base whitespace-nowrap">Page {currentPage}</span>
                    <button
                        onClick={() => setCurrentPage((prev) => prev + 1)}
                        disabled={results.length < ITEMS_PER_PAGE}
                        className={`px-4 sm:px-6 py-2 rounded-md font-bold tracking-wider border border-neon-green text-sm sm:text-base ${
                            results.length < ITEMS_PER_PAGE ? "opacity-50 cursor-not-allowed" : "hover:shadow-[0_0_25px_rgba(34,197,94,0.9)]"
                        } transition-all duration-300`}
                    >
                        ▶
                    </button>
                </div>
            )}
        </div>
    );
}

export default ContentSearch;
