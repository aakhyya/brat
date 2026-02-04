function Button({children, variant = "primary", loading = false, disabled = false, ...props}){

    //applied to all buttons
    const baseStyles = `
        w-full
        py-4
        px-6
        font-black
        text-lg
        uppercase
        tracking-wider
        rounded-lg
        transition-all
        duration-300
        disabled:opacity-50
        disabled:cursor-not-allowed
        relative
        overflow-hidden`;

    const variants = {
        //Chrome button
        primary: `
            bg-gradient-to-r
            from-chrome-silver
            via-liquid-metal
            to-chrome-silver
            text-glossy-black
            shadow-chrome
            hover:shadow-neon-glow
            hover:scale-105
            active:scale-95
            `,
        //neon outline
        secondary: `
            bg-glossy-black/90
            text-neon-green
            border-2
            border-neon-green
            shadow-[0_0_20px_rgba(0,255,65,0.3)]
            hover:shadow-[0_0_30px_rgba(0,255,65,0.6)]
            hover:bg-neon-green/10
            `,
    };

    return(
        <button
            disabled={disabled || loading}
            className={`${baseStyles} ${variants[variant]}`}
            {...props}>
                {loading ? (
                    <div className="flex items-center justify-center gap-3">
                        <div className="
                            w-6
                            h-6
                            border-4
                            border-glossy-black
                            border-t-transparent
                            rounded-full
                            animate-spin
                        "/>
                        <span>Processing...</span>
                    </div>
                ) : (children)}

            {/* Chrome Shine Effect */}
            <div
                className="
                absolute
                inset-0
                bg-gradient-to-r
                from-transparent
                via-white/20
                to-transparent
                -translate-x-full
                hover:translate-x-full
                transition-transform
                duration-1000
                pointer-events-none
                "
            />
        </button>
    );
}

export default Button;