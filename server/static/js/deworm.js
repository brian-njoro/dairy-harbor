// Function to fetch and update the deworm list
const updateDewormingList = async () => {
    console.log('Reached here at deworming list fetch')

    try {
        const response = await fetch('/api/deworming');
        const deworms = await response.json();

        const dewormList = document.getElementById('dewormList');
        dewormList.innerHTML = ''; // Clear existing list

        deworms.forEach(deworm => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${new Date(deworm.date).toLocaleDateString()}</td>
                <td>${Array.isArray(deworm.cattle_id) ? deworm.cattle_id.join(', ') : deworm.cattle_id}</td>
                <td>${deworm.vet_name}</td>
                <td>${deworm.drug_used}</td>
                <td>${deworm.method_of_administration}</td>
                <td>${deworm.disease}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="deleteDeworming(${deworm.id})">Delete</button>
                </td>
            `;

            dewormList.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching deworm list:', error);
    }
};

// Function to delete a deworm
const deleteDeworming = async (id) => {
    try {
        const response = await fetch(`/api/deworming/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            // Update the deworm list after deletion
            updateDewormingList();
        } else {
            console.error('Failed to delete deworm:', await response.text());
        }
    } catch (error) {
        console.error('Error deleting deworm:', error);
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
document.getElementById('cattleDewormButton').addEventListener('click', async () => {
    const vetName = document.getElementById('vetName').value;
    const dateOfDeworm = document.getElementById('dateOfDeworming').value;
    const selectedCattleCheckboxes = document.querySelectorAll('input[name="cattleId"]:checked');
    const drugUsed = document.getElementById('drugUsed').value;
    const dewormingMethod = document.getElementById('method').value;
    const disease = document.getElementById('disease').value;
    const notes = document.getElementById('notes').value;

    if (selectedCattleCheckboxes.length === 0) {
        alert('Please select at least one cattle.');
        return;
    }

    const dewormingPromises = Array.from(selectedCattleCheckboxes).map(checkbox => {
        const cattleId = checkbox.value;

        const dewormData = {
            vet_name: vetName,
            date: dateOfDeworm,
            cattle_id: cattleId,
            drug_used: drugUsed,
            method_of_administration: dewormingMethod,
            disease: disease,
            notes: notes,
        };

        return fetch('/api/deworming', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dewormData)
        });
    });

    try {
        const responses = await Promise.all(dewormingPromises);

        let allSuccessful = true;
        for (const response of responses) {
            if (!response.ok) {
                allSuccessful = false;
                console.error('Failed to add deworming:', await response.text());
            }
        }

        if (allSuccessful) {
            // Close the modal
            const modalCloseButton = document.querySelector('#modalCattleDeworming .btn-close');
            if (modalCloseButton) {
                modalCloseButton.click(); // Simulate click on close button
            } else {
                console.error('Close button not found in modal');
            }

            // Update the deworm list
            updateDewormingList();
        } else {
            console.error('Some deworming entries failed.');
        }
    } catch (error) {
        console.error('Error submitting deworming:', error);
    }
});

// Initial fetch to populate the deworm list on page load
updateDewormingList();

// Populate cattle options when the modal is shown
const modal = document.getElementById('modalCattleDeworming');
modal.addEventListener('show.bs.modal', populateCattleOptions);
