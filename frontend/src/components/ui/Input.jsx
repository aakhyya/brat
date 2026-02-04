function Input({label,type="text",error,icon,...props}){
    return(
        <div className="mb-6">
            {label && (
                <label className="
                    block
                    text-chrome-silver
                    text-sm
                    font-bold
                    uppercase
                    tracking-wider
                    mb-2
                ">
                    {label}
                </label>
            )}

            <div className="relative">
                {icon && (
                    <div className="
                        absolute
                        left-4
                        top-1/2
                        -translate-y-1/2
                        text-neon-green
                        z-10
                        pointer-events-none
                    ">
                        {icon}
                    </div>
                )}

                <input 
                type={type}
                className={`
                    w-full
                    px-4
                    py-3
                    ${icon ? "pl-12" : ""} //If an icon exists → add extra left padding
                    bg-glossy-black/50
                    border-2
                    ${error ? "border-hot-pink" : "border-neon-green/30"}
                    rounded-lg
                    text-chrome-silver
                    placeholder-dark-chrome
                    backdrop-blur-xl
                    focus:outline-none
                    focus:border-neon-green
                    focus:shadow-neon-glow
                    transition-all //smooth transitions
                    duration-300`}
                    {...props}
                />
            </div>

            {error && (
                <p className="
                    mt-2
                    text-hot-pink
                    text-sm
                    font-bold
                    uppercase
                    tracking-wide
                    animate-pulse
                ">
                   ⚠ {error}
                </p>
            )}
        </div>
    );
}

export default Input;