import { useRef, useEffect, useState } from "react";
import { contentApi } from "../services/contentApi";
import ResultSkeleton from "../components/content/ResultSkeleton";
import ErrorMessage from "../components/content/ErrorMessage";
import ResultCard from "../components/content/ResultCard";
import StarRating from "../components/ui/StarRating";

function ContentSearch() {
    const [activeTab, setActiveTab] = useState("movie"); //movie song book
    const [searchQuery, setSearchQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [ratingModal, setRatingModal] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const ITEMS_PER_PAGE = 10; // External APIs typically return 20 items


    const debounceRef = useRef(null); //updating Refs does NOT cause re-renders, hence
    const lastSearchRef = useRef(""); //perfect for timers and mutable values

    async function handleSearch(skipDuplicateCheck=false) {
        const query = searchQuery.trim();
        if (query.length < 2) {
            setResults([]);
            setError("Type at least 2 characters");
            return;
        }

        if (!skipDuplicateCheck && query === lastSearchRef.current) return; //prevent duplicate query
        lastSearchRef.current = query;

        setLoading(true);
        setError(null);
        setResults([]);

        try {
            let data = [];

            if (activeTab === "movie") {
                data = await contentApi.searchMovies(query,currentPage);
            }
            else if (activeTab === "song") {
                data = await contentApi.searchSongs(query,currentPage);
            }
            else if (activeTab === "book") {
                data = await contentApi.searchBooks(query,currentPage);
            }

            setResults(data);
            setTotalResults(data.length || 0);
        }
        catch (err) {
            setError(err.message || "Search failed");
        }
        finally {
            setLoading(false);
        }
    }

    //Debounce
    useEffect(() => {
        const query = searchQuery.trim();
        if (query.length < 2) return;

        if (query === lastSearchRef.current) return;

        //If there is already a scheduled search waiting to run, cancel it
        debounceRef.current && clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(async () => {
            lastSearchRef.current = query;
            setLoading(true);
            setError(null);
            setResults([]);

            try {
                let data = [];
                if (activeTab === "movie") {
                    data = await contentApi.searchMovies(query,currentPage);
                } else if (activeTab === "song") {
                    data = await contentApi.searchSongs(query,currentPage);
                } else if (activeTab === "book") {
                    data = await contentApi.searchBooks(query,currentPage);
                }
                setResults(data);
            } catch (err) {
                setError(err.message || "Search failed");
            } finally {
                setLoading(false);
            }
        }, 400); //If the user stops typing for 400ms, then perform the search.

        return () => clearTimeout(debounceRef.current);//reset timer while unmounting 
    }, [searchQuery, activeTab]); //reset while new query or switching tabs

    // Separate effect for pagination
useEffect(() => {
    if (searchQuery.trim().length >= 2 && currentPage > 1) {
        handleSearch(true); // Skip duplicate check for pagination
    }
}, [currentPage]);





    function handleTabChange(tab) {
        if (tab === activeTab) return;

        clearTimeout(debounceRef.current); // Cancel pending search

        //Change context, wipe stale state, allow fresh intent
        setActiveTab(tab);
        setResults([]);
        setError(null);
        lastSearchRef.current = ""; //clears last searched values
        setCurrentPage(1);

    }

    return (

        <div
            className="
      min-h-screen
      bg-black
      relative
      text-white
      px-6 py-10
    "
        >
            {/* Header */}
            <header className="mb-10 text-center">
                <h1
                    className="text-7xl
                                md:text-4xl
                                font-serif
                                font-black
                                uppercase
                                text-chrome
                                mb-4
                                text-center"
                >
                    BRAT CONTENT SEARCH
                </h1>
            </header>

            {/* Tabs */}
            <div className="flex justify-center gap-6 mb-8">
                {["movie", "song", "book"].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => handleTabChange(tab)}
                        className={`px-6 py-2  tracking-wider rounded-md transition-all duration-300 font-serif
            ${activeTab === tab
                                ? "bg-gradient-to-br from-black to-neon-green border-2 text-black font-bold shadow-[0_0_20px_rgba(34,197,94,0.7)]"
                                : "bg-transparent border border-neon-green/40 text-chrome-silver hover:border-chrome-silver"
                            }`}
                    >
                        {tab}s
                    </button>
                ))}
            </div>

            {/* Search Bar */}
            <div className="flex justify-center gap-4 mb-12">
                <input
                    type="search"
                    aria-label={`Search ${activeTab}s`}  // Screen readers
                    autoComplete="off"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            handleSearch();
                        }
                    }}
                    placeholder={`search ${activeTab}s...`}
                    className="
          w-full max-w-md
          bg-black/40 backdrop-blur-md
          border border-neon-green
          rounded-md px-4 py-2
          outline-none
          focus:shadow-[0_0_25px_rgba(34,197,94,0.6)]
          transition
        "
                />

                <button
                    type="button"
                    onClick={handleSearch}
                    className="
          px-6 py-2  bg-black/40
          border border-neon-green
          rounded-md font-bold tracking-wider
          hover:shadow-[0_0_25px_rgba(34,197,94,0.9)]
          transition-shadow duration-300
        "
                >
                    search
                </button>
            </div>

            {!loading && totalResults > 0 && (
    <p className="text-center text-chrome-silver italic text-md mb-6">
        <span className="text-neon-green text-xl">
            {totalResults}
        </span>
        {" "}results on this page
    </p>
)}

            {/* Results */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {/* Loading */}
                {loading && <ResultSkeleton />}

                {/* Error */}
                {!loading && error && (
                    <ErrorMessage
                        message={error}
                        onRetry={handleSearch}
                    />
                )}

                {/* Empty State */}
                {!loading &&
                    !error &&
                    results.length === 0 &&
                    searchQuery.trim().length >= 2 && (
                        <p className="col-span-full text-center text-purple-400">
                            No results found. Try a different search term 𓇢𓆸
                        </p>
                    )}

                {/* Results */}
                {!loading &&
                    !error &&
                    results.map((item) => (
                        <ResultCard
                            key={item.externalId}
                            item={item}
                            type={activeTab}
                            onAdd={(savedContent) => {
                                setRatingModal(savedContent); //Open rating modal with this content
                            }}
                        />
                    ))}
            </div>
            {ratingModal && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
                    <div className="bg-black border-2 border-green-400 p-8 rounded-lg">
                        <h3 className="text-2xl mb-4">Rate <span className="text-neon-green">{ratingModal.content.title}</span></h3>
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
            {/* Pagination Controls */}
{!loading && !error && results.length > 0 && (
    <div className="flex justify-center items-center gap-4 mt-8">
        <button
    onClick={() => {
        setCurrentPage(prev => Math.max(1, prev - 1));
        // Remove handleSearch() from here
    }}
    disabled={currentPage === 1}
    className={`...`}
>
    ◀
</button>

<span className="text-chrome-silver">
    Page {currentPage}
</span>

<button
    onClick={() => {
        setCurrentPage(prev => prev + 1);
        // Remove handleSearch() from here
    }}
    disabled={results.length < ITEMS_PER_PAGE}
    className={`...`}
>
    ▶
</button>

    </div>
)}


        </div>
    );


}

export default ContentSearch;