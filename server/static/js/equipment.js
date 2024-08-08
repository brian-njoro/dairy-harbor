document.addEventListener('DOMContentLoaded', function () {
    const addEquipmentButton = document.getElementById('addEquipment');
    const updateEquipmentButton = document.getElementById('updateEquipmentButton');

    // Fetch equipments and populate the table
    function fetchEquipments() {
        console.log('Fetching equipments...');
        fetch('/api/equipment')
            .then(response => {
                console.log('Response received from fetchEquipments:', response);
                return response.json();
            })
            .then(equipments => {
                console.log('Equipments data:', equipments);
                const equipmentTable = document.getElementById('equipmentTable');
                equipmentTable.innerHTML = '';
                equipments.forEach(equipment => {
                    equipmentTable.innerHTML += `
                        <tr>
                            <td>${equipment.purchase_date}</td>
                            <td>${equipment.name}</td>
                            <td>${equipment.quantity}</td>
                            <td>${equipment.price}</td>
                            <td>${equipment.agent}</td>
                            <td>
                                <button class="btn btn-info btn-sm" onclick="editEquipment(${equipment.id})">Edit</button>
                                <button class="btn btn-danger btn-sm" onclick="deleteEquipment(${equipment.id})">Delete</button>
                            </td>
                        </tr>`;
                });
            })
            .catch(error => {
                console.error('Error fetching equipments:', error);
            });
    }

    // Add new equipment record
    addEquipmentButton.addEventListener('click', function () {
        console.log('Adding new equipment...');
        const equipmentData = {
            purchase_date: document.getElementById('purchaseDate').value,
            name: document.getElementById('equipmentName').value,
            quantity: document.getElementById('quantity').value,
            price: document.getElementById('price').value,
            agent: document.getElementById('agent').value
        };

        fetch('/api/equipment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(equipmentData)
        })
            .then(response => {
                console.log('Response received from addEquipment:', response);
                return response.json();
            })
            .then(data => {
                if (data.message) {
                    console.error('Add equipment error:', data.message);
                    alert(data.message);
                } else {
                    console.log('Equipment added successfully:', data);
                    fetchEquipments();
                    closeModal('#modalEquipment');
                }
            })
            .catch(error => {
                console.error('Error adding equipment:', error);
            });
    });

    // Edit equipment
    window.editEquipment = function (id) {
        console.log(`Fetching equipment with ID: ${id} for editing...`);
        fetch(`/api/equipment/${id}`)
            .then(response => {
                console.log('Response received from editEquipment:', response);
                return response.json();
            })
            .then(equipment => {
                console.log('Equipment data for editing:', equipment);
                document.getElementById('editEquipmentId').value = equipment.id;
                document.getElementById('editModalPurchaseDate').value = equipment.purchase_date;
                document.getElementById('editModalName').value = equipment.name;
                document.getElementById('editModalQuantity').value = equipment.quantity;
                document.getElementById('editModalPrice').value = equipment.price;
                document.getElementById('editModalAgent').value = equipment.agent;
                new bootstrap.Modal(document.getElementById('editEquipmentModal')).show();
            })
            .catch(error => {
                console.error('Error fetching equipment for editing:', error);
            });
    };

    // Update equipment
    updateEquipmentButton.addEventListener('click', function () {
        console.log('Updating equipment...');
        const id = document.getElementById('editEquipmentId').value;
        const equipmentData = {
            purchase_date: document.getElementById('editModalPurchaseDate').value,
            name: document.getElementById('editModalName').value,
            quantity: document.getElementById('editModalQuantity').value,
            price: document.getElementById('editModalPrice').value,
            agent: document.getElementById('editModalAgent').value
        };

        fetch(`/api/equipment/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(equipmentData)
        })
            .then(response => {
                console.log('Response received from updateEquipment:', response);
                return response.json();
            })
            .then(data => {
                if (data.message) {
                    console.error('Update equipment error:', data.message);
                    alert(data.message);
                } else {
                    console.log('Equipment updated successfully:', data);
                    fetchEquipments();
                    closeModal('#editEquipmentModal');
                }
            })
            .catch(error => {
                console.error('Error updating equipment:', error);
            });
    });

    // Delete equipment
    window.deleteEquipment = function (id) {
        console.log(`Deleting equipment with ID: ${id}...`);
        if (confirm('Are you sure you want to delete this equipment record?')) {
            fetch(`/api/equipment/${id}`, {
                method: 'DELETE'
            })
                .then(response => {
                    console.log('Response received from deleteEquipment:', response);
                    return response.json();
                })
                .then(data => {
                    console.log('Equipment deleted:', data);
                    alert(data.message);
                    fetchEquipments();
                })
                .catch(error => {
                    console.error('Error deleting equipment:', error);
                });
        }
    };

    // Close modal function
    function closeModal(modalSelector) {
        console.log(`Closing modal with selector: ${modalSelector}`);
        const modalCloseButton = document.querySelector(`${modalSelector} .btn-close`);
        if (modalCloseButton) {
            modalCloseButton.click();
        } else {
            console.error('Close button not found in modal');
        }
    }

    // Initialize equipment list
    fetchEquipments();
});
