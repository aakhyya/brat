
function ErrorMessage({ message, onRetry }) {
  return (
    <div
      className="
        col-span-full
        border-2 border-red-500
        bg-red-500/10
        text-red-400
        font-bold
        rounded-lg
        p-6
        text-center
        shadow-[0_0_20px_rgba(239,68,68,0.5)]
      "
    >
      <p className="mb-4">{message}</p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="
            px-6 py-2
            border-2 border-red-500
            rounded-md
            uppercase tracking-wider
            hover:bg-red-500 hover:text-black
            transition-all duration-300
          "
        >
          Retry
        </button>
      )}
    </div>
  );
}

export default ErrorMessage;
