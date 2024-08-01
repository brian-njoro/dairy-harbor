// Function to fetch and update the pest list
const updatePestList = async () => {
    console.log('Reached here pest list fetch')

    try {
        const response = await fetch('/api/pest_control');
        const pests = await response.json();

        const pestList = document.getElementById('pestControlList');
        pestList.innerHTML = ''; // Clear existing list

        pests.forEach(pest => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${new Date(pest.control_date).toLocaleDateString()}</td>
                <td>${Array.isArray(pest.cattle_id) ? pest.cattle_id.join(', ') : pest.cattle_id}</td>
                <td>${pest.pest_type}</td>
                <td>${pest.pesticide_used}</td>
                <td>${pest.method_used}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="deletePest(${pest.id})">Delete</button>
                </td>
            `;

            pestList.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching pest list:', error);
    }
};

// Function to delete a pest
const deletePest = async (id) => {
    try {
        const response = await fetch(`/api/pest_control/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            // Update the pest list after deletion
            updatePestList();
        } else {
            console.error('Failed to delete pest:', await response.text());
        }
    } catch (error) {
        console.error('Error deleting pest:', error);
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
document.getElementById('pestControlButton').addEventListener('click', async () => {
    const vetName = document.getElementById('vetName').value;
    const controlDate = document.getElementById('controlDate').value;

    const selectedCattleCheckboxes = document.querySelectorAll('input[name="cattleId"]:checked');
    const controlMethod = document.getElementById('method').value;
    const pesticide = document.getElementById('pesticide').value;
    const pestName = document.getElementById('pestName').value;
    const notes = document.getElementById('notes').value;
    const cost = document.getElementById('cost').value;



    if (selectedCattleCheckboxes.length === 0) {
        alert('Please select at least one cattle.');
        return;
    }


    const pestControlPromises = Array.from(selectedCattleCheckboxes).map(checkbox => {
        const cattleId = checkbox.value;

        const pestData = {
            vet_name: vetName,
            cattle_id: cattleId,
            control_date: controlDate,
            pest_type: pestName,
            method_used: controlMethod,
            pesticide_used: pesticide,
            notes: notes,
        };

        return fetch('/api/pest_control', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(pestData)
        });
    });

    try {
        const responses = await Promise.all(pestControlPromises);

        let allSuccessful = true;
        for (const response of responses) {
            if (!response.ok) {
                allSuccessful = false;
                console.error('Failed to add pest control:', await response.text());
            }
        }

        if (allSuccessful) {
            // Close the modal
            const modalCloseButton = document.querySelector('#modalPestControl .btn-close');
            if (modalCloseButton) {
                modalCloseButton.click(); // Simulate click on close button
            } else {
                console.error('Close button not found in modal');
            }

            // Update the pest list
            updatePestList();
        } else {
            console.error('Some pest control entries failed.');
        }
    } catch (error) {
        console.error('Error submitting pest control:', error);
    }
});

// Initial fetch to populate the pest list on page load
updatePestList();

// Populate cattle options when the modal is shown
const modal = document.getElementById('modalPestControl');
modal.addEventListener('show.bs.modal', populateCattleOptions);
