// Function to fetch and update the treatment list
const updateTreatmentList = async () => {
    console.log('Reached here treatment list fetch')

    try {
        const response = await fetch('/api/treatment');
        const treatments = await response.json();

        const treatmentList = document.getElementById('treatmentList');
        treatmentList.innerHTML = ''; // Clear existing list

        treatments.forEach(treatment => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${new Date(treatment.date).toLocaleDateString()}</td>
                <td>${Array.isArray(treatment.cattle_id) ? treatment.cattle_id.join(', ') : treatment.cattle_id}</td>
                <td>${treatment.vet_name}</td>
                <td>${treatment.method_of_administration}</td>
                <td>${treatment.drug_used}</td>
                <td>${treatment.disease}</td>
                <td>${treatment.cost}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="deleteTreatment(${treatment.id})">Delete</button>
                </td>
            `;

            treatmentList.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching treatment list:', error);
    }
};

// Function to delete a treatment
const deleteTreatment = async (id) => {
    try {
        const response = await fetch(`/api/treatment/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            // Update the treatment list after deletion
            updateTreatmentList();
        } else {
            console.error('Failed to delete treatment:', await response.text());
        }
    } catch (error) {
        console.error('Error deleting treatment:', error);
    }
};

// Function to handle "Select All" checkbox
const handleSelectAll = (selectAllCheckbox) => {
    const cattleCheckboxes = document.querySelectorAll('input[name="cattleId"]');
    cattleCheckboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });
};

// Function to fetch and populate cattle checkboxes in the modal
const populateCattleOptions = async () => {
    try {
        const response = await fetch('/api/cattle/get'); // Adjust endpoint if needed
        const cattleList = await response.json();
        console.log('Reached here checkbox')

        const cattleCheckboxesContainer = document.getElementById('cattleRadioButtons');
        cattleCheckboxesContainer.innerHTML = ''; // Clear existing options

        // Add "Select All" checkbox
        const selectAllCheckbox = document.createElement('div');
        selectAllCheckbox.classList.add('form-check');
        selectAllCheckbox.innerHTML = `
            <input class="form-check-input" type="checkbox" id="selectAllCattle">
            <label class="form-check-label" for="selectAllCattle">
                Select All
            </label>
        `;
        cattleCheckboxesContainer.appendChild(selectAllCheckbox);

        // Add event listener to "Select All" checkbox
        selectAllCheckbox.querySelector('input').addEventListener('change', (e) => handleSelectAll(e.target));

        if (cattleList.length === 0) {
            cattleCheckboxesContainer.innerHTML += '<p>No cattle available.</p>';
            return;
        }

        cattleList.forEach(cattle => {
            const checkbox = document.createElement('div');
            checkbox.classList.add('form-check');
            checkbox.innerHTML = `
                <input class="form-check-input" type="checkbox" name="cattleId" id="cattle-${cattle.serial_number}" value="${cattle.serial_number}">
                <label class="form-check-label" for="cattle-${cattle.serial_number}">
                    ${cattle.serial_number} - ${cattle.name}  <!-- Adjust based on available cattle fields -->
                </label>
            `;
            cattleCheckboxesContainer.appendChild(checkbox);
        });
    } catch (error) {
        console.error('Error fetching cattle data:', error);
    }
};

// Event listener for the submit button
document.getElementById('CattleTreatmentButton').addEventListener('click', async () => {
    const vetName = document.getElementById('vetName').value;
    const dateOfTreatment = document.getElementById('dateOfTreatment').value;
    const selectedCattle = Array.from(document.querySelectorAll('input[name="cattleId"]:checked')).map(checkbox => checkbox.value);
    const drugUsed = document.getElementById('drugUsed').value;
    const methodOfAdministration = document.getElementById('methodOfAdministration').value;
    const disease = document.getElementById('disease').value;
    const cost = document.getElementById('cost').value;
    const notes = document.getElementById('notes').value;

    if (selectedCattle.length === 0) {
        alert('Please select at least one cattle.');
        return;
    }


    for (const cattleId of selectedCattle) {
        const treatmentData = {
            vet_name: vetName,
            date: dateOfTreatment,
            cattle_id: cattleId,
            drug_used: drugUsed,
            method_of_administration: methodOfAdministration,
            disease: disease,
            notes: notes,
            cost:cost,
        };

        try {
            const response = await fetch('/api/treatment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(treatmentData)
            });

            if (!response.ok) {
                console.error('Failed to add treatment for cattle', cattleId, ':', await response.text());
            }
        } catch (error) {
            console.error('Error submitting treatment for cattle', cattleId, ':', error);
        }
    }

    // Close the modal
    const modalCloseButton = document.querySelector('#modalCattleTreatment .btn-close');
    if (modalCloseButton) {
        modalCloseButton.click(); // Simulate click on close button
    } else {
        console.error('Close button not found in modal');
    }

    // Update the treatment list
    updateTreatmentList();
});

// Initial fetch to populate the treatment list on page load
updateTreatmentList();

// Populate cattle options when the modal is shown
const modal = document.getElementById('modalCattleTreatment');
modal.addEventListener('show.bs.modal', populateCattleOptions);
