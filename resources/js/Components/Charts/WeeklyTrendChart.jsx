import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function WeeklyTrendChart({ chartData }) {
    // Default to empty if no data provided
    const labels = chartData?.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const values = chartData?.data || [0, 0, 0, 0, 0, 0, 0];

    const data = {
        labels: labels,
        datasets: [
            {
                label: 'Calories',
                data: values,
                backgroundColor: '#34d399', // emerald-400
                borderRadius: 4,
                hoverBackgroundColor: '#10b981', // emerald-500
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: '#1f2937',
                padding: 12,
                cornerRadius: 8,
            }
        },
        scales: {
            y: {
                display: true, // Show Y axis numbers as requested
                grid: {
                    color: 'rgba(200, 200, 200, 0.1)',
                },
                ticks: {
                    color: '#9ca3af', // gray-400
                    font: {
                        size: 10
                    }
                }
            },
            x: {
                grid: {
                    display: false, // Hide vertical grid lines
                },
                ticks: {
                    color: '#9ca3af', // gray-400
                    font: {
                        size: 10
                    }
                }
            }
        },
    };

    return (
        <div className="h-48 w-full">
            <Bar data={data} options={options} />
        </div>
    );
}
