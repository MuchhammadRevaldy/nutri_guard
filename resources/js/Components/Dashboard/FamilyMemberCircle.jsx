export default function FamilyMemberCircle({ name, active = false, role = 'member', ageCategory }) {
    // Generate initials
    const initials = name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);

    const isActive = active;

    return (
        <div className="flex flex-col items-center space-y-2 cursor-pointer transition-transform hover:scale-105">
            <div className={`relative w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold ${isActive ? 'bg-orange-100 text-orange-600 ring-2 ring-orange-500 ring-offset-2' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300'}`}>
                {initials}

                {/* Status Dot */}
                <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${isActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            </div>
            <div className="flex flex-col items-center">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{name}</span>
                {ageCategory && (
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">({ageCategory})</span>
                )}
            </div>
        </div>
    );
}
