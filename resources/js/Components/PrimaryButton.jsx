export default function PrimaryButton({ className = '', disabled, children, ...props }) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center justify-center px-4 py-3 bg-emerald-500/50 backdrop-blur-md border border-emerald-400/50 rounded-full font-bold text-xs text-white uppercase tracking-widest shadow-md shadow-emerald-500/20 hover:bg-emerald-400/60 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:ring-offset-2 transition ease-in-out duration-150 ` +
                className + ` ${disabled && 'opacity-25'}`
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
