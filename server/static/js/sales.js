document.addEventListener('DOMContentLoaded', function () {
    const salesForm = document.getElementById('salesForm');
    const addSaleButton = document.getElementById('addSale');
    const salesList = document.getElementById('salesList');

    // Function to add a sale
    async function addSale(event) {
        event.preventDefault();
        
        const data = {
            date: document.getElementById('date').value,
            quantity: parseFloat(document.getElementById('quantity').value),
            buyer_type: document.getElementById('buyerType').value,
            buyer_name: document.getElementById('buyerName').value,
            buyer_contact: document.getElementById('buyerCOntact').value,
            price_per_litre: parseFloat(document.getElementById('pricePerLitre').value),
            sold_by: parseInt(document.getElementById('soldBy').value),
            notes: document.getElementById('notes').value,
            farmer_id: null,  // This will be set on the server side
            cattle_id: 0
        };

        try {
            const response = await fetch('/api/milk_sales', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });


            if (response.ok) {
                const result = await response.json();
                appendSaleToList(result);

                // Close the modal
                const modalCloseButton = document.querySelector('#modalMilkSales .btn-close');
                if (modalCloseButton) {
                    modalCloseButton.click(); // Simulate click on close button
                } else {
                    console.error('Close button not found in modal');
                }
                
                } else {
                const error = await response.json();
                alert('Error: ' + error.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while adding the sale.');
        }
    }

    // Function to append a sale to the sales list
    function appendSaleToList(sale) {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${sale.date}</td>
            <td>${sale.quantity}</td>
            <td>${sale.price_per_litre}</td>
            <td>${(sale.quantity * sale.price_per_litre).toFixed(2)}</td>
            <td>${sale.buyer_name || ''}</td>
        `;

        salesList.appendChild(row);
    }

    // Function to load sales from the server and populate the sales list
    async function loadSales() {
        try {
            const response = await fetch('/api/milk_sales');
            if (response.ok) {
                // Close the modal
                const modalCloseButton = document.querySelector('#modalMilkSales .btn-close');
                if (modalCloseButton) {
                    modalCloseButton.click(); // Simulate click on close button
                } else {
                    console.error('Close button not found in modal');
                }
                
                const sales = await response.json();
                sales.forEach(sale => appendSaleToList(sale));
            } else {
                console.error('Failed to fetch sales');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    addSaleButton.addEventListener('click', addSale);

    // Load sales on page load
    loadSales();
});
