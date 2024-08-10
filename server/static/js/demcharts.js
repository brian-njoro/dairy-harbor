document.addEventListener('DOMContentLoaded', async function () {
    async function fetchData(endpoint) {
        const response = await fetch(endpoint);
        const data = await response.json();
        return data;
    }

    // Fetch data from the endpoints
    const incomeData = await fetchData('/api/income-data');
    const expensesData = await fetchData('/api/expenses-data');
    const milkProductionData = await fetchData('/api/milk-production-data');
    const milkSalesData = await fetchData('/api/milk-sales-data');
    const inventoryCostData = await fetchData('/api/inventory-cost-data');

    // Extract dates and values
    const incomeDates = incomeData.map(item => item.date);
    const incomeValues = incomeData.map(item => item.amount);
    const expenseDates = expensesData.map(item => item.date);
    const expenseValues = expensesData.map(item => item.amount);
    const milkProductionDates = milkProductionData.map(item => item.date);
    const milkProductionValues = milkProductionData.map(item => item.quantity);
    const milkSalesDates = milkSalesData.map(item => item.date);
    const milkSalesValues = milkSalesData.map(item => item.quantity);
    const inventoryCostDates = inventoryCostData.map(item => item.date);
    const inventoryCostValues = inventoryCostData.map(item => item.cost);

    // Extract values
    const totalIncome = incomeData.reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = expensesData.reduce((sum, item) => sum + item.amount, 0);
    const netProfitLoss = totalIncome - totalExpenses;

    // Update report card values
    document.getElementById('totalIncome').textContent = `Sh.${totalIncome.toLocaleString()}`;
    document.getElementById('totalExpenses').textContent = `Sh.${totalExpenses.toLocaleString()}`;
    document.getElementById('netProfitLoss').textContent = `Sh.${netProfitLoss.toLocaleString()}`;

    // Common chart options
    const commonChartOptions = {
        chart: {
            type: 'line',
            height: 250,
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
        },
        stroke: {
            curve: 'smooth',
            width: 1.5 // Set the line width to 1.5 for thinner lines
        },
        xaxis: {
            categories: [],
            position: 'bottom',
            labels: {
                offsetY: -18
            },
            axisBorder: {
                show: false
            },
            axisTicks: {
                show: false
            },
            tooltip: {
                enabled: true
            }
        },
        yaxis: {
            labels: {
                show: false,
                formatter: function (val) {
                    return val.toFixed(1); // Format y-axis labels to 1 decimal place
                }
            }
        }
    };

    // Chart options
    const incomeOptions = {
        ...commonChartOptions,
        series: [{
            name: 'Income',
            data: incomeValues
        }],
        xaxis: {
            ...commonChartOptions.xaxis,
            categories: incomeDates
        }
    };

    const expensesOptions = {
        ...commonChartOptions,
        chart: {
            ...commonChartOptions.chart,
            type: 'bar' // Change to bar chart
        },
        series: [{
            name: 'Expenses',
            data: expenseValues
        }],
        xaxis: {
            ...commonChartOptions.xaxis,
            categories: expenseDates
        }
    };

    const profitOptions = {
        ...commonChartOptions,
        series: [{
            name: 'Profit',
            data: incomeValues.map((income, index) => income - (expenseValues[index] || 0))
        }],
        xaxis: {
            ...commonChartOptions.xaxis,
            categories: incomeDates
        }
    };

    const milkProductionOptions = {
        ...commonChartOptions,
        series: [{
            name: 'Milk Production',
            data: milkProductionValues
        }],
        xaxis: {
            ...commonChartOptions.xaxis,
            categories: milkProductionDates
        }
    };

    const milkSalesOptions = {
        ...commonChartOptions,
        chart: {
            ...commonChartOptions.chart,
            type: 'bar' // Change to bar chart
        },
        series: [{
            name: 'Milk Sales',
            data: milkSalesValues
        }],
        xaxis: {
            ...commonChartOptions.xaxis,
            categories: milkSalesDates
        }
    };

    const inventoryCostOptions = {
        ...commonChartOptions,
        series: [{
            name: 'Inventory Cost',
            data: inventoryCostValues
        }],
        xaxis: {
            ...commonChartOptions.xaxis,
            categories: inventoryCostDates
        }
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
