document.addEventListener('DOMContentLoaded', () => {
    const ctx = document.getElementById('classChart').getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['A', 'B', 'C', 'D', 'F'],
        datasets: [{
          label: 'Grade Distribution',
          data: [12, 19, 3, 5, 2],
          backgroundColor: '#2196F3'
        }]
      }
    });
  });