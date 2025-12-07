import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function MacroDonutChart({ label, value, total, color = '#34d399' }) {
    const percentage = Math.round((value / total) * 100);
    const remaining = 100 - percentage;

    const data = {
        labels: ['Consumed', 'Remaining'],
        datasets: [
            {
                data: [percentage, remaining],
                backgroundColor: [color, '#f3f4f6'], // Color + Gray-100
                borderWidth: 0,
                cutout: '75%', // Thinner ring
            },
        ],
    };

    const options = {
        plugins: {
            legend: { display: false },
            tooltip: { enabled: false }, // Disable tooltip for simple donut
        },
        maintainAspectRatio: false,
    };

    return (
        <div className="relative w-24 h-24 flex items-center justify-center">
            <div className="absolute inset-0">
                <Doughnut data={data} options={options} />
            </div>
            <div className="text-center z-10">
                <span className="block text-sm font-bold text-gray-900 dark:text-white">{percentage}%</span>
            </div>
        </div>
    );
}
