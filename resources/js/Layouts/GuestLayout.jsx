import ThemeToggle from '@/Components/ThemeToggle';

export default function Guest({ children }) {
    return (
        <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>

            <div className="w-full sm:max-w-md mt-6 px-8 py-10 bg-white dark:bg-gray-800 shadow-xl overflow-hidden sm:rounded-2xl transition-colors duration-300 animate-zoom-in">
                {children}
            </div>
        </div>
    );
}
