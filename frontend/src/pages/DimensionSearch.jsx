import { useEffect, useState } from "react";
import api from '../services/api';
import ContentModal from '../components/content/ContentModal';
import ResultSkeleton from '../components/content/ResultSkeleton';

function DimensionSearch() {
    const [dimensions, setDimensions] = useState({});
    const [mediaTypes, setMediaTypes] = useState(['movie', 'song', 'book']);
    const [results, setResults] = useState([]);
    const [dimensionCategories, setDimensionCategories] = useState(null);
    const [loadingDimensions, setLoadingDimensions] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searched, setSearched] = useState(false);
    const [selectedContent, setSelectedContent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // open state
    const [openCategory, setOpenCategory] = useState(null);

    useEffect(() => {
        const fetchDimensions = async () => {
            try {
                const response = await api.get('/api/content/dimensions');
                setDimensionCategories(response.data.data);
            } catch (err) {
                console.error('Failed to fetch dimensions:', err);
                setError('Failed to load dimensions');
            } finally {
                setLoadingDimensions(false);
            }
        };

        fetchDimensions();
    }, []);

    const handleSliderChange = (key, value) => {
        setDimensions(prev => ({
            ...prev,
            [key]: parseFloat(value) //as HTML range inputs return strings
        }));
    };

    const handleMediaType = (type) => {
        setMediaTypes(prev =>
            prev.includes(type)
                ? prev.filter(t => t !== type) //if exists -> remove it
                : [...prev, type] // ow add it
        );
    };

    async function handleSearch() {
        const activeDimensions = Object.fromEntries(
            Object.entries(dimensions).filter(([key, value]) => value > 0) // filter out 0
        );
        if (Object.keys(activeDimensions).length === 0) {
            setError('Please select at least one dimension');
            return;
        }
        if (mediaTypes.length === 0) {
            setError('Please select at least one media type');
            return;
        }
        setLoading(true);
        setError(null);
        setSearched(true);

        try {
            const res = await api.post('/api/content/mood-search', {
                dimensions: activeDimensions,
                mediaTypes: mediaTypes,
                limit: 20
            });

            setResults(res.data.data || []);
        }
        catch (err) {
            console.error('Dimension search error:', err);
            setError(err.res?.data?.message || 'Failed to search by dimensions');
        }
        finally {
            setLoading(false);
        }
    }

    const handleReset = () => {
        setDimensions({});
        setMediaTypes(['movie', 'book', 'song']);
        setResults([]);
        setSearched(false);
        setError(null);
        setOpenCategory(false);
    };

    if (loadingDimensions) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-400 mx-auto mb-4"></div>
                    <p className="text-lg">Loading dimensions...</p>
                </div>
            </div>
        );
    }

    if (!dimensionCategories) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400 text-xl mb-4">Failed to load dimensions 𓇢𓆸</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-neon-green text-black font-bold rounded hover:bg-neon-purple transition"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const handleOpenModal = (content) => {
        setSelectedContent(content);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedContent(null);
    };

    const handleRate = async (rating) => {
        if (!selectedContent) return;

        try {
            await api.post(`/api/content/${selectedContent._id}/rate`, { rating });
            alert(`Rated ${rating} stars and added to library!`);
            handleCloseModal();
        } catch (err) {
            console.error('Failed to rate:', err);
            alert('Failed to add to library');
        }
    };

    const handleFavorite = async () => {
        if (!selectedContent) return;

        try {
            await api.post(`/api/content/${selectedContent._id}/favorite`);
            alert('Added to favorites!');
        } catch (err) {
            console.error('Failed to favorite:', err);
        }
    };

    const handleDelete = async () => {
        if (!selectedContent) return;

        try {
            await api.delete(`/api/content/${selectedContent._id}/interaction`);
            alert('Removed from library!');
            handleCloseModal();
        } catch (err) {
            console.error('Failed to delete:', err);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 85)
            return "bg-green-300";
        if (score >= 50)
            return "bg-yellow-200";
        return "bg-red-300";
    };

    return (
        <div className="min-h-screen bg-black text-white p-6">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <h1 className="text-7xl
                                md:text-4xl
                                font-serif
                                font-black
                                uppercase
                                text-chrome
                                mb-3 
                                text-center">
                    Discover by Vibe
                </h1>
                <p className="text-pink-200 text-center text-md">
                    adjust the sliders to find content that matches your mood
                </p>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Panel: Dimension Sliders */}
                <div className="lg:col-span-2">
                    {error && (
                        <div className="p-4 bg-red-900/20 border border-red-500 rounded-lg mb-6">
                            <p className="text-red-400">{error}</p>
                        </div>
                    )}

                    {loading && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <ResultSkeleton key={i} />
                            ))}
                        </div>
                    )}

                    {!loading && searched && results.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-xl text-gray-400 mb-4">No matches found</p>
                            <p className="text-sm text-gray-500">
                                Try adjusting your dimension sliders or selecting different media types
                            </p>
                        </div>
                    )}

                    {!loading && results.length > 0 && (
                        <>
                            <div className="mb-6">
                                <h2 className="text-lg text-center text-chrome mb-2">
                                    {results.length} matches found
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {results.map((result, index) => {
                                    const content = result.content;

                                    // Format the content for ResultCard
                                    const formattedItem = {
                                        externalId: content._id,
                                        title: content.title,
                                        subtitle: content.creators?.[0]?.name || content.metadata?.artist || content.releaseDate?.split('-')[0],
                                        thumbnail: content.images?.poster || content.images?.cover || content.images?.backdrop
                                    };

                                    return (
                                        <div key={index} className="relative">
                                            {/* Display card with poster */}
                                            <div className="bg-black/40 backdrop-blur-md border border-neon-green rounded-lg overflow-hidden hover:border-green-400 hover:shadow-[0_0_20px_rgba(34,197,94,0.5)] transition-all duration-300">

                                                {/* Thumbnail */}
                                                <div className="w-full aspect-square bg-black/60 overflow-hidden">
                                                    {formattedItem.thumbnail ? (
                                                        <img
                                                            src={formattedItem.thumbnail}
                                                            alt={formattedItem.title}
                                                            className="w-full h-full object-cover hover:scale-110 transition-all duration-500"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-sm opacity-50">
                                                            No Image
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Content Info */}
                                                <div className="p-4">
                                                    <h3 className="text-xl font-bold bg-green-400 bg-clip-text text-transparent">
                                                        {formattedItem.title}
                                                    </h3>
                                                    {formattedItem.subtitle && (
                                                        <p className="text-sm text-green-300/70 mt-1">
                                                            {formattedItem.subtitle}
                                                        </p>
                                                    )}
                                                    <p className="text-xs text-gray-400 mt-2 capitalize">
                                                        {content.type}
                                                    </p>
                                                </div>

                                                {/* Add to Library Button */}
                                                <button
                                                    onClick={() => handleOpenModal(content)}
                                                    className="mt-auto py-2 w-full rounded-md uppercase tracking-wider font-bold text-black bg-gradient-to-r from-green-400 to-green-600 shadow-[0_0_15px_rgba(34,197,94,0.6)] hover:shadow-[0_0_25px_rgba(34,197,94,0.9)] transition-all duration-300"
                                                >
                                                    + Add to Library
                                                </button>


                                                {/* Match Badge */}
                                                <div className={`absolute top-2 right-2 z-10
                                                                px-3 py-1 rounded-full
                                                                text-black text-xs font-bold
                                                                ${getScoreColor(result.matchPercentage)}`}>
                                                    {result.matchPercentage}% match
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>  


                        </>
                    )}

                    {!loading && !searched && (
                        <div className="text-center italic py-20">

                            <p className="text-md text-chrome-silver">
                                select dimensions that match your current mood or preferences ✧˚ ༘ ⋆｡˚
                            </p>
                        </div>
                    )}
                </div>

                {/* Right Panel: Results */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            className="flex-1 px-6 py-3 font-serif italic border border-neon-green bg-black text-neon-green font-bold rounded-lg hover:bg-neon-green hover:text-black transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Searching...' : 'Search'}
                        </button>
                        <button
                            onClick={handleReset}
                            className="px-6 py-3 border font-serif italic border-neon-green text-neon-green font-bold rounded-lg hover:bg-neon-green hover:text-black transition"
                        >
                            Reset
                        </button>
                    </div>
                    {/* Media Type Filters */}
                    <div className="p-6 bg-black/40 border border-pink-300 rounded-lg">
                        <h3 className="text-lg font-bold italic text-center text-neon-green mb-4">Media Types</h3>
                        <div className="space-y-3">
                            {['movie', 'song', 'book'].map(type => (
                                <label key={type} className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={mediaTypes.includes(type)}
                                        onChange={() => handleMediaType(type)}
                                        className="w-5 h-5 accent-neon-green"
                                    />
                                    <span className="text-chrome-silver italic font-mono capitalize">{type}s</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Dimension Sliders by Category */}
                    {Object.entries(dimensionCategories).map(([category, dims]) => {
                        const isOpen = openCategory === category;

                        return (
                            <div
                                key={category}
                                className="border border-pink-200 rounded-xl bg-black/40 overflow-hidden"
                            >
                                {/* Header */}
                                <button
                                    onClick={() =>
                                        setOpenCategory(isOpen ? null : category)
                                    }
                                    className="w-full px-6 py-4 flex justify-between items-center text-left hover:bg-black/60 transition"
                                >
                                    <h3 className="text-lg font-bold italic text-neon-green capitalize">
                                        {category}
                                    </h3>
                                    <span className="text-neon-green text-xl">
                                        {isOpen ? "−" : "+"}
                                    </span>
                                </button>

                                {/* Collapsible Content */}
                                {isOpen && (
                                    <div className="px-6 pb-6 space-y-4">
                                        {dims.map(dim => (
                                            <div key={dim.key}>
                                                <div className="flex justify-between mb-2">
                                                    <label className="text-sm italic font-mono text-chrome-silver">
                                                        {dim.label}
                                                    </label>
                                                    <span className="text-sm text-neon-green font-mono">
                                                        {Math.round((dimensions[dim.key] || 0) * 100)}%
                                                    </span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="1"
                                                    step="0.01"
                                                    value={dimensions[dim.key] || 0}
                                                    onChange={(e) =>
                                                        handleSliderChange(dim.key, e.target.value)
                                                    }
                                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-neon-green"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}


                </div>


            </div>
            {/* Rating Modal */}
            <ContentModal
                content={selectedContent}
                interaction={null}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onRate={handleRate}
                onFavorite={handleFavorite}
                onDelete={handleDelete}
            />
        </div>
    );
}

export default DimensionSearch;