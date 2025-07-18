const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        title: {
            display: true,
            text: "Algorithm Fitness Evolution Over Time",
            font: {
                size: 18,
                weight: 'bold'
            },
            color: '#1e3a8a'
        },
        legend: {
            position: "top",
            labels: {
                font: {
                    size: 14,
                    weight: '500'
                },
                color: '#374151',
                usePointStyle: true,
                pointStyle: 'line'
            }
        },
        tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            titleColor: '#1e3a8a',
            bodyColor: '#374151',
            borderColor: '#e5e7eb',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: true,
            callbacks: {
                title: function (context) {
                    return `Time: ${context[0].parsed.x}`;
                },
                label: function (context) {
                    return `${context.dataset.label}: ${context.parsed.y.toFixed(4)}`;
                }
            }
        }
    },
    scales: {
        x: {
            type: "linear",
            title: {
                display: true,
                text: "Time (t)",
                font: {
                    size: 14,
                    weight: '600'
                },
                color: '#374151'
            },
            grid: {
                color: '#f3f4f6',
                lineWidth: 1
            },
            ticks: {
                color: '#6b7280',
                font: {
                    size: 12
                }
            }
        },
        y: {
            title: {
                display: true,
                text: "Fitness Value (f_best)",
                font: {
                    size: 14,
                    weight: '600'
                },
                color: '#374151'
            },
            grid: {
                color: '#f3f4f6',
                lineWidth: 1
            },
            ticks: {
                color: '#6b7280',
                font: {
                    size: 12
                }
            }
        },
    },
    interaction: {
        intersect: false,
        mode: 'index'
    }
};


const getAlgorithmColor = (algoName, index) => {
    const colorPalette = [
        '#1e3a8a', '#059669', '#d97706',
        '#7c3aed', '#dc2626', '#0891b2',
        '#9d174d', '#4d7c0f', '#b45309'
    ];

    // Relies on pre-sorted array passed from parent
    return colorPalette[index % colorPalette.length];
};

export {
    chartOptions,
    getAlgorithmColor,

}