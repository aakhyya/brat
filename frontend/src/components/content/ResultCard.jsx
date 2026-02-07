import { useState } from "react";
import { contentApi } from "../../services/contentApi";

function ResultCard({ item, type, onAdd }) {
    const [adding, setAdding] = useState(false);
    const [added, setAdded] = useState(false);
    const [error, setError] = useState(null);

    const { externalId, title, subtitle, thumbnail } = item;

    async function handleAdd() {
        if (adding || added) return; //prevents race conditions or user rage-clicking the button

        setAdding(true); //disables button
        setError(null);

        try {
            let saved;

            if (type === "movie") {
                saved = await contentApi.enrichMovie(externalId);
            }
            else if (type === "song") {
                saved = await contentApi.enrichSong(externalId);
            }
            else if (type === "book") {
                saved = await contentApi.enrichBook(externalId);
            }

            setAdded(true); //locks the card
            onAdd?.(saved);// If onAdd exists → call it, show toast || If not → safely do nothing
        }
        catch (err) {
            setError(err.message || "Failed to add");
            setAdding(false);
            
            setTimeout(() => setError(null), 5000); // auto-clear
            return;
        }
        finally {
            setAdding(false);
        }
    }

    return (
        <div
            className="
                bg-black/40 backdrop-blur-md
                border border-green-400/30
                rounded-lg overflow-hidden
                hover:border-green-400
                hover:shadow-[0_0_20px_rgba(34,197,94,0.5)]
                transition-all duration-300">

            {/* Thumbnail */}
            <div className="w-full aspect-square bg-black/60 overflow-hidden">
                {thumbnail ? (
                    <img
                        src={thumbnail}
                        alt={title}
                        className="
                            w-full h-full object-cover
                            hover:scale-110
                            transition-all duration-500"/>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm opacity-50">
                        No Image
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col gap-3">
                <div>
                    <h3
                        className="
                            text-xl font-bold
                            bg-gradient-to-r from-green-400 to-purple-400
                            bg-clip-text text-transparent">
                        
                        {title}
                    </h3>

                    {subtitle && (
                        <p className="text-sm text-green-300/70 mt-1">
                            {subtitle}
                        </p>
                    )}
                </div>

                {/* Add Button */}
                <button
                    onClick={handleAdd}
                    disabled={adding || added}
                    className={`
                        mt-auto px-4 py-2 rounded-md
                        uppercase tracking-wider font-bold
                        text-black
                        bg-gradient-to-r from-green-400 to-green-600
                        shadow-[0_0_15px_rgba(34,197,94,0.6)]
                        hover:shadow-[0_0_25px_rgba(34,197,94,0.9)]
                        transition-all duration-300
                        disabled:opacity-50 disabled:cursor-not-allowed
                    `}>
                    {added
                        ? "Added ✓"
                        : adding
                            ? "Adding…"
                            : "+ Add to BRAT"}
                </button>

                {error && (
                    <p className="text-xs text-acid-pink mt-1">
                        {error}
                    </p>
                )}
            </div>
        </div>
    )
}

export default ResultCard;