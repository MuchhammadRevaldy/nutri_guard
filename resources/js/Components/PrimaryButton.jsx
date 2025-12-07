export default function PrimaryButton({ className = '', disabled, children, ...props }) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center justify-center px-4 py-3 bg-emerald-500 border border-transparent rounded-full font-bold text-xs text-white uppercase tracking-widest hover:bg-emerald-600 focus:bg-emerald-600 active:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition ease-in-out duration-150 ` +
                className + ` ${disabled && 'opacity-25'}`
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
