document.addEventListener("DOMContentLoaded", () => {
    const milkProductionForm = document.getElementById('milkProduction');
    const milkList = document.getElementById('milkList');
    const cattleRadioButtonsContainer = document.getElementById('cattleRadioButtons');

    // Function to fetch and populate cattle radio buttons in the modal
    const populateCattleOptions = async () => {
        try {
            const response = await fetch('/api/cattle/get'); // Adjust endpoint if needed
            const cattleList = await response.json();
            console.log('Reached here radiobutton');

            cattleRadioButtonsContainer.innerHTML = ''; // Clear existing options

            if (cattleList.length === 0) {
                cattleRadioButtonsContainer.innerHTML = '<p>No cattle available.</p>';
                return;
            }

            cattleList.forEach(cattle => {
                const radioButton = document.createElement('div');
                radioButton.classList.add('form-check');
                radioButton.innerHTML = `
                    <input class="form-check-input" type="radio" name="cattleId" id="cattle-${cattle.serial_number}" value="${cattle.serial_number}" required>
                    <label class="form-check-label" for="cattle-${cattle.serial_number}">
                        ${cattle.serial_number} - ${cattle.name}  <!-- Adjust based on available cattle fields -->
                    </label>
                `;
                cattleRadioButtonsContainer.appendChild(radioButton);
            });
        } catch (error) {
            console.error('Error fetching cattle data:', error);
        }
    };

    // Handle form submission for adding milk production record
    milkProductionForm.addEventListener('submit', event => {
        event.preventDefault();

        const formData = {
            date: document.getElementById('date').value,
            cattle_id: document.querySelector('input[name="cattleId"]:checked').value,
            quantity: document.getElementById('quantity').value,
            given_to_calf: document.getElementById('givenToCalf').value,
            consumed_by_staff: document.getElementById('consumedByStaff').value,
            spillage: document.getElementById('spillage').value,
            spoiled: document.getElementById('spoiled').value,
            price_per_litre: document.getElementById('pricePerLitre').value,
            notes: document.getElementById('notes').value,
        };

        fetch('/api/milk_production', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            loadMilkProductionHistory(); // Reload the milk production history
            milkProductionForm.reset(); // Clear the form fields
        })
        .catch(error => console.error('Error:', error));
    });

    // Fetch and display milk production history
    function loadMilkProductionHistory() {
        fetch('/api/milk_production')
            .then(response => response.json())
            .then(records => {
                milkList.innerHTML = '';
                records.forEach(record => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${record.date}</td>
                        <td>${record.quantity}</td>
                        <td>${record.given_to_calf}</td>
                        <td>${record.consumed_by_staff}</td>
                        <td>${record.spillage}</td>
                        <td>${record.spoiled}</td>

                        <td><button class="btn btn-danger btn-sm" onclick="deleteRecord(${record.id})">Delete</button></td>
                    `;
                    milkList.appendChild(row);
                });
            })
            .catch(error => console.error('Error fetching milk production history:', error));
    }

    // Handle deletion of milk production record
    window.deleteRecord = function(id) {
        fetch(`/api/milk_production/${id}`, {
            method: 'DELETE',
        })
        .then(response => response.json())
        .then(data => {
            console.log('Delete success:', data);
            loadMilkProductionHistory(); // Reload the milk production history
        })
        .catch(error => console.error('Error:', error));
    };

    // Initial load of milk production history
    loadMilkProductionHistory();

    // Populate cattle radio buttons when the page loads
    populateCattleOptions();
});
