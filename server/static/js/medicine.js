document.addEventListener('DOMContentLoaded', function () {
    const addMedicineButton = document.getElementById('addMedicine');
    const updateMedicineButton = document.getElementById('updateMedicineButton');

    // Fetch medicines and populate the table
    function fetchMedicines() {
        fetch('/api/medicine')
            .then(response => response.json())
            .then(medicines => {
                const medicineTable = document.getElementById('medicineTable');
                medicineTable.innerHTML = '';
                medicines.forEach(medicine => {
                    medicineTable.innerHTML += `
                        <tr>
                            <td>${medicine.purchase_date}</td>
                            <td>${medicine.name}</td>
                            <td>${medicine.quantity}</td>
                            <td>${medicine.price}</td>
                            <td>${medicine.agent}</td>
                            <td>
                                <button class="btn btn-info btn-sm" onclick="editMedicine(${medicine.id})">Edit</button>
                                <button class="btn btn-danger btn-sm" onclick="deleteMedicine(${medicine.id})">Delete</button>
                            </td>
                        </tr>`;
                });
            })
            .catch(error => console.error('Error fetching medicines:', error));
    }

    // Add new medicine record
    addMedicineButton.addEventListener('click', function () {
        const medicineData = {
            purchase_date: document.getElementById('purchaseDate').value,
            name: document.getElementById('medicineName').value,
            quantity: document.getElementById('quantity').value,
            price: document.getElementById('price').value,
            agent: document.getElementById('agent').value
        };

        fetch('/api/medicine', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(medicineData)
        })
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    alert(data.message);
                } else {
                    fetchMedicines();
                    closeModal('#modalMedicine');
                }
            })
            .catch(error => console.error('Error adding medicine:', error));
    });

    // Edit medicine
    window.editMedicine = function (id) {
        fetch(`/api/medicine/${id}`)
            .then(response => response.json())
            .then(medicine => {
                document.getElementById('editMedicineId').value = medicine.id;
                document.getElementById('editModalPurchaseDate').value = medicine.purchase_date;
                document.getElementById('editModalName').value = medicine.name;
                document.getElementById('editModalQuantity').value = medicine.quantity;
                document.getElementById('editModalPrice').value = medicine.price;
                document.getElementById('editModalAgent').value = medicine.agent;
                new bootstrap.Modal(document.getElementById('editMedicineModal')).show();
            })
            .catch(error => console.error('Error fetching medicine:', error));
    };

    // Update medicine
    updateMedicineButton.addEventListener('click', function () {
        const id = document.getElementById('editMedicineId').value;
        const medicineData = {
            purchase_date: document.getElementById('editModalPurchaseDate').value,
            name: document.getElementById('editModalName').value,
            quantity: document.getElementById('editModalQuantity').value,
            price: document.getElementById('editModalPrice').value,
            agent: document.getElementById('editModalAgent').value
        };

        fetch(`/api/medicine/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(medicineData)
        })
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    alert(data.message);
                } else {
                    fetchMedicines();
                    closeModal('#editMedicineModal');
                }
            })
            .catch(error => console.error('Error updating medicine:', error));
    });

    // Delete medicine
    window.deleteMedicine = function (id) {
        if (confirm('Are you sure you want to delete this medicine record?')) {
            fetch(`/api/medicine/${id}`, {
                method: 'DELETE'
            })
                .then(response => response.json())
                .then(data => {
                    alert(data.message);
                    fetchMedicines();
                })
                .catch(error => console.error('Error deleting medicine:', error));
        }
    };

    // Close modal function
    function closeModal(modalSelector) {
        const modalCloseButton = document.querySelector(`${modalSelector} .btn-close`);
        if (modalCloseButton) {
            modalCloseButton.click();
        } else {
            console.error('Close button not found in modal');
        }
    }

    // Initialize medicine list
    fetchMedicines();
});
