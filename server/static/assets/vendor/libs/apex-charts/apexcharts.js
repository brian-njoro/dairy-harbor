document.addEventListener('DOMContentLoaded', function() {
	const incomeOptions = {
	  chart: {
		type: 'bar',
		height: 350
	  },
	  series: [{
		name: 'Income',
		data: [44000, 55000, 41000, 64000, 52000, 53000, 44000, 49000]
	  }],
	  xaxis: {
		categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']
	  }
	};

	const expensesOptions = {
	  chart: {
		type: 'bar',
		height: 350
	  },
	  series: [{
		name: 'Expenses',
		data: [35000, 42000, 31000, 52000, 45000, 48000, 37000, 41000]
	  }],
	  xaxis: {
		categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']
	  }
	};

	const profitOptions = {
	  chart: {
		type: 'bar',
		height: 350
	  },
	  series: [{
		name: 'Profit',
		data: [9000, 13000, 10000, 12000, 7000, 5000, 7000, 8000]
	  }],
	  xaxis: {
		categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']
	  }
	};

	const incomeChart = new ApexCharts(document.querySelector("#incomechart"), incomeOptions);
	const expensesChart = new ApexCharts(document.querySelector("#expenseschart"), expensesOptions);
	const profitChart = new ApexCharts(document.querySelector("#profitchart"), profitOptions);

	incomeChart.render();
	expensesChart.render();
	profitChart.render();

	document.querySelectorAll('.nav-link').forEach(tab => {
	  tab.addEventListener('click', function() {
		setTimeout(() => {
		  incomeChart.updateOptions(incomeOptions);
		  expensesChart.updateOptions(expensesOptions);
		  profitChart.updateOptions(profitOptions);
		}, 10);
	  });
	});
  });


const options = {
	chart: {
	  type: 'bar',
	  height: 350,
	  toolbar: {
		show: false
	  }
	},
	plotOptions: {
	  bar: {
		borderRadius: 10,
		dataLabels: {
		  position: 'top', // Show data labels at the top
		},
	  }
	},
	dataLabels: {
	  enabled: true,
	  formatter: function (val) {
		return val;
	  },
	  offsetY: -20,
	  style: {
		fontSize: '12px',
		colors: ["#304758"]
	  }
	},
	series: [{
	  name: 'Total Revenue',
	  data: [44, 55, 41, 64, 22, 43, 21, 49] // Static values
	}],
	xaxis: {
	  categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
	  position: 'top',
	  labels: {
		offsetY: -18,
	  },
	  axisBorder: {
		show: false
	  },
	  axisTicks: {
		show: false
	  },
	  crosshairs: {
		fill: {
		  type: 'gradient',
		  gradient: {
			colorFrom: '#D8E3F0',
			colorTo: '#BED1E6',
			stops: [0, 100],
			opacityFrom: 0.4,
			opacityTo: 0.5,
		  }
		}
	  },
	  tooltip: {
		enabled: true,
	  }
	},
	fill: {
	  gradient: {
		shade: 'light',
		type: "horizontal",
		shadeIntensity: 0.25,
		gradientToColors: undefined,
		inverseColors: true,
		opacityFrom: 0.85,
		opacityTo: 0.85,
		stops: [50, 0, 100, 100]
	  },
	},
	yaxis: {
	  axisBorder: {
		show: false
	  },
	  axisTicks: {
		show: false,
	  },
	  labels: {
		show: false,
		formatter: function (val) {
		  return val;
		}
	  }
	},
	title: {
	  text: 'Monthly Revenue',
	  floating: true,
	  offsetY: 330,
	  align: 'center',
	  style: {
		color: '#444'
	  }
	}
  };
  
  const chart = new ApexCharts(document.querySelector("#chart"), options);
  chart.render();
  