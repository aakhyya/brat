//type: info, error, success
function Alert({type="info",message,onClose}){ 
    const styles={
        error:
            `border-hot-pink
            text-hot-pink
            shadow-[0_0_20px_rgba(255,0,110,0.4)]`,
        success:
            `border-neon-green
            text-neon-green
            shadow-neon-glow`,
        info:
            `border-electric-cyan
            text-electric-cyan
            shadow-[0_0_20px_rgba(0,255,255,0.4)]`,
    };

    return(
        <div className={`
            relative
            p-4
            mb-6
            bg-glossy-black/90
            backdrop-blur-xl
            border-2
            ${styles[type]}
            rounded-lg
            animate-pulse
        `}>
            <div className="flex items-center justify-between">
                <p className="font-bold uppercase tracking-wide text-sm">
                    {message}
                </p>

                {onClose && (
                    <button 
                    onClick={onClose}
                    className="
                        ml-4
                        text-2xl
                        transition-transform
                        hover:scale-110
                    ">
                        ✘
                    </button>
                )}
            </div>
        </div>
    );
}

export default Alert;