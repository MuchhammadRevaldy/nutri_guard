export default function TopFoodsList({ foods }) {
    // foods is object { "Oatmeal": 5, "Banana": 2 }
    // Convert to array
    const sortedFoods = Object.entries(foods).sort(([, a], [, b]) => b - a);

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm h-fit">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Top Foods Consumed</h3>
            <div className="space-y-4">
                {sortedFoods.length > 0 ? (
                    sortedFoods.map(([name, count], index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 dark:text-gray-300">{name}</span>
                            <span className="font-bold text-gray-900 dark:text-white">{count} times</span>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-gray-500">No data available.</p>
                )}
            </div>
        </div>
    );
}
