export default function FoodLogItem({ name, calories, time }) {
    // Simple time formatter
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors rounded-lg px-2">
            <div className="flex items-center gap-4">
                {/* Icon Placeholder based on name (basic logic) */}
                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-lg">
                    {name.toLowerCase().includes('apple') ? '🍎' :
                        name.toLowerCase().includes('salad') ? '🥗' :
                            name.toLowerCase().includes('oat') ? '🥣' : '🍽️'}
                </div>
                <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{name}</h4>
                    <span className="text-xs text-green-500 font-medium">{time ? formatTime(time) : 'Today'}</span>
                </div>
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-sm">{calories} kcal</span>
        </div>
    );
}
