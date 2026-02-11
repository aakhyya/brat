import { useState } from "react";

function StarRating({
  rating = 0,
  onRate,
  readonly = false,
}) {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = hoverRating || rating;

  return (
    <div className="flex gap-1 items-center">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= displayRating;

        return (
          <span
            key={star}
            onMouseEnter={() => {
              if (!readonly) setHoverRating(star);
            }}
            onMouseLeave={() => {
              if (!readonly) setHoverRating(0);
            }}
            onClick={() => {
              if (!readonly && onRate) onRate(star);
            }}
            className={`text-2xl
              transition-all duration-200
              ${readonly ? "cursor-default opacity-80" : "cursor-pointer"}
              ${
                filled
                  ? "text-pink-300 filter drop-shadow-[0_0_8px_rgba(250,204,21,0.8)] hover:scale-125"
                  : "text-zinc-300 hover:scale-110"
              }
            `}
          >
            {filled ? "✟" : "✞"}
          </span>
        );
      })}
    </div>
  );
}

export default StarRating;
