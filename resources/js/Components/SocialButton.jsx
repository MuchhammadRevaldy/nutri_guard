export default function SocialButton({ icon, label, ...props }) {
    return (
        <button
            type="button"
            className="w-full inline-flex justify-center items-center px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full font-medium text-xs text-gray-700 dark:text-gray-300 uppercase tracking-widest hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
            {...props}
        >
            <span className="mr-2">{icon}</span>
            <span className="capitalize text-gray-600">{label}</span>
        </button>
    );
}
