// Sample chart initialization
document.addEventListener('DOMContentLoaded', () => {
    const ctx = document.getElementById('performanceChart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [{
          label: 'Your Performance',
          data: [75, 82, 78, 85],
          borderColor: '#2196F3',
          tension: 0.4
        }]
      }
    });
  });