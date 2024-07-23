document.addEventListener('DOMContentLoaded', function () {
    // Data for the charts
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const incomeData = [4.4, 5.5, 4.1, 6.4, 5.2, 5.3, 4.4, 4.9, 4.3, 2.3, 5.5, 1.0];
    const expensesData = [4.4, 5.5, 4.1, 6.4, 5.2, 5.3, 4.4, 4.9, 4.3, 2.3, 5.5, 1.0];
    const profitData = [9000, 13000, 10000, 12000, 7000, 5000, 7000, 8000, 2000, 3000, 12000, 10000];
    const milkProductionData = [45, 55, 40, 65, 50, 60, 45, 50, 40, 65, 50, 60];
    const milkSalesData = [30, 40, 35, 60, 45, 55, 40, 45, 60, 45, 55, 40];
    const inventoryCostData = [25, 30, 28, 35, 32, 40, 30, 35, 35, 32, 40, 30];

    // Common chart options
    const commonChartOptions = {
        plotOptions: {
            bar: {
                borderRadius: 10,
                dataLabels: {
                    position: 'top'
                }
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
        xaxis: {
            categories: months,
            position: 'top',
            labels: {
                offsetY: -18
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
                        opacityTo: 0.5
                    }
                }
            },
            tooltip: {
                enabled: true
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
            }
        },
        yaxis: {
            axisBorder: {
                show: false
            },
            axisTicks: {
                show: false
            },
            labels: {
                show: false
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
        },
        chart: {
            zoom: {
                enabled: true
            },
            toolbar: {
                show: true,
                tools: {
                    download: true,
                    selection: true,
                    zoom: true,
                    zoomin: true,
                    zoomout: true,
                    pan: true,
                    reset: true
                }
            }
        }
    };

    // Chart options
    const incomeOptions = {
        ...commonChartOptions,
        chart: {
            ...commonChartOptions.chart,
            type: 'line',
            height: 350
        },
        stroke: {
            curve: 'smooth'
        },
        series: [{
            name: 'Income',
            data: incomeData
        }]
    };

    const expensesOptions = {
        ...commonChartOptions,
        chart: {
            ...commonChartOptions.chart,
            type: 'line',
            height: 350
        },
        stroke: {
            curve: 'smooth'
        },
        series: [{
            name: 'Expenses',
            data: expensesData
        }]
    };

    const profitOptions = {
        ...commonChartOptions,
        chart: {
            ...commonChartOptions.chart,
            type: 'bar',
            height: 350
        },
        series: [{
            name: 'Profit',
            data: profitData
        }]
    };

    const milkProductionOptions = {
        ...commonChartOptions,
        chart: {
            ...commonChartOptions.chart,
            type: 'bar',
            height: 350
        },
        series: [{
            name: 'Milk Production',
            data: milkProductionData
        }]
    };

    const milkSalesOptions = {
        ...commonChartOptions,
        chart: {
            ...commonChartOptions.chart,
            type: 'bar',
            height: 350
        },
        series: [{
            name: 'Milk Sales',
            data: milkSalesData
        }]
    };

    const inventoryCostOptions = {
        ...commonChartOptions,
        chart: {
            ...commonChartOptions.chart,
            type: 'bar',
            height: 350
        },
        series: [{
            name: 'Inventory Cost',
            data: inventoryCostData
        }]
    };

    // Render charts
    const incomeChartReport = new ApexCharts(document.querySelector("#incomeChartReport"), incomeOptions);
    const expenseChart = new ApexCharts(document.querySelector("#expenseChart"), expensesOptions);
    const milkProductionChart = new ApexCharts(document.querySelector("#milkProductionChart"), milkProductionOptions);
    const milkSalesChart = new ApexCharts(document.querySelector("#milkSalesChart"), milkSalesOptions);
    const profitLossChart = new ApexCharts(document.querySelector("#profitLossChart"), profitOptions);
    const inventoryCostChart = new ApexCharts(document.querySelector("#inventoryCostChart"), inventoryCostOptions);

    incomeChartReport.render();
    expenseChart.render();
    milkProductionChart.render();
    milkSalesChart.render();
    profitLossChart.render();
    inventoryCostChart.render();
});
