document.addEventListener('DOMContentLoaded', function() {
	// Define chart options
	const incomeOptions = {
	  chart: {
		type: 'bar',
		height: 350
	  },
	  series: [],
	  xaxis: {
		categories: []
	  }
	};
  
	const expensesOptions = {
	  chart: {
		type: 'bar',
		height: 350
	  },
	  series: [],
	  xaxis: {
		categories: []
	  }
	};
  
	const profitOptions = {
	  chart: {
		type: 'bar',
		height: 350
	  },
	  series: [],
	  xaxis: {
		categories: []
	  }
	};
  
	// Create charts
	const incomeHomeChart = new ApexCharts(document.querySelector("#incomeHomeChart"), incomeOptions);
	const expensesChart = new ApexCharts(document.querySelector("#expenseschart"), expensesOptions);
	const profitChart = new ApexCharts(document.querySelector("#profitchart"), profitOptions);
  
	// Render charts
	incomeHomeChart.render();
	expensesChart.render();
	profitChart.render();
  
	// Function to fetch and update chart data
	async function updateChartData(chart, endpoint, seriesName) {
	  try {
		const response = await fetch(endpoint);
		const data = await response.json();
  
		const categories = data.map(item => item.date);
		const seriesData = data.map(item => item.amount);
  
		chart.updateOptions({
		  series: [{
			name: seriesName,
			data: seriesData
		  }],
		  xaxis: {
			categories: categories
		  }
		});
	  } catch (error) {
		console.error('Error fetching data:', error);
	  }
	}
  
	// Update charts with data from APIs
	updateChartData(incomeHomeChart, '/api/income-data', 'Income');
	updateChartData(expensesChart, '/api/expenses-data', 'Expenses');
	updateChartData(profitChart, '/api/milk-sales-data', 'Milk Sales');
  
	// Re-render charts when switching tabs
	document.querySelectorAll('.nav-link').forEach(tab => {
	  tab.addEventListener('click', function() {
		setTimeout(() => {
		  incomeHomeChart.updateOptions(incomeOptions);
		  expensesChart.updateOptions(expensesOptions);
		  profitChart.updateOptions(profitOptions);
		}, 10);
	  });
	});
  });
  