document.addEventListener('DOMContentLoaded', async () => {
    const ctx = document.getElementById('fitnessChart').getContext('2d');

    try {
        const res = await fetch('/fitness/all');
        const data = await res.json();

        const datasets = Object.entries(data).map(([algo, points], index) => ({
            label: algo,
            data: points.map(p => ({ x: p.t, y: p.fitness })),
            borderColor: ['red', 'green', 'blue'][index],
            fill: false,
            tension: 0.2
        }));

        new Chart(ctx, {
            type: 'line',
            data: {
                datasets: datasets
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Fitness Over Time'
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        title: {
                            display: true,
                            text: 'Time (t)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Fitness (f_best)'
                        }
                    }
                }
            }
        });
    } catch (err) {
        console.error(err);
        alert('Failed to load fitness data');
    }
});