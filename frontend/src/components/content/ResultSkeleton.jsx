function ResultSkeleton() {
  return (
    <>
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="
            bg-black/40 backdrop-blur-md
            border border-green-400/20
            rounded-lg overflow-hidden
            animate-pulse
          "
        >
          {/* Image */}
          <div
            className="
              w-full aspect-square
              bg-gradient-to-r
              from-purple-900/20 via-green-400/20 to-purple-900/20
            "
          />

          {/* Text */}
          <div className="p-4 space-y-3">
            <div
              className="
                h-5 w-3/4 rounded
                bg-gradient-to-r
                from-purple-900/20 via-green-400/20 to-purple-900/20
              "
            />

            <div
              className="
                h-4 w-1/2 rounded
                bg-gradient-to-r
                from-purple-900/20 via-green-400/20 to-purple-900/20
              "
            />

            <div
              className="
                h-9 w-full rounded-md
                bg-gradient-to-r
                from-green-400/30 to-green-600/30
              "
            />
          </div>
        </div>
      ))}
    </>
  );
}

export default ResultSkeleton;
