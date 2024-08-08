// Function to fetch and update the miscarriage list
const updatemiscarriageList = async () => {
    console.log('Reached here at miscarriage list fetch')

    try {
        const response = await fetch('/api/miscarriage');
        const miscarriages = await response.json();

        const miscarriageList = document.getElementById('miscarriageList');
        miscarriageList.innerHTML = ''; // Clear existing list

        miscarriages.forEach(miscarriage => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${new Date(miscarriage.date).toLocaleDateString()}</td>
                <td>${Array.isArray(miscarriage.cattle_id) ? miscarriage.cattle_id.join(', ') : miscarriage.cattle_id}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="deletemiscarriage(${miscarriage.id})">Delete</button>
                </td>
            `;

            miscarriageList.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching miscarriage list:', error);
    }
};

// Function to delete a miscarriage
const deletemiscarriage = async (id) => {
    try {
        const response = await fetch(`/api/miscarriage/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            // Update the miscarriage list after deletion
            updatemiscarriageList();
        } else {
            console.error('Failed to delete miscarriage:', await response.text());
        }
    } catch (error) {
        console.error('Error deleting miscarriage:', error);
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
document.getElementById('cattleMiscarriageButton').addEventListener('click', async () => {
    const dateOfMiscarriage = document.getElementById('dateOfMiscarriage').value;
    const selectedCattleCheckboxes = document.querySelectorAll('input[name="cattleId"]:checked');
    const notes = document.getElementById('notes').value;

    if (selectedCattleCheckboxes.length === 0) {
        alert('Please select at least one cattle.');
        return;
    }

    const miscarriagePromises = Array.from(selectedCattleCheckboxes).map(checkbox => {
        const cattleId = checkbox.value;

        const miscarriageData = {
            date: dateOfMiscarriage,
            cattle_id: cattleId,
            notes: notes,
        };

        return fetch('/api/miscarriage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(miscarriageData)
        });
    });

    try {
        const responses = await Promise.all(miscarriagePromises);

        let allSuccessful = true;
        for (const response of responses) {
            if (!response.ok) {
                allSuccessful = false;
                console.error('Failed to add miscarriage:', await response.text());
            }
        }

        if (allSuccessful) {
            // Close the modal
            const modalCloseButton = document.querySelector('#modalMiscarriagedCattle .btn-close');
            if (modalCloseButton) {
                modalCloseButton.click(); // Simulate click on close button
            } else {
                console.error('Close button not found in modal');
            }

            // Update the miscarriage list
            updatemiscarriageList();
        } else {
            console.error('Some miscarriage entries failed.');
        }
    } catch (error) {
        console.error('Error submitting miscarriage:', error);
    }
});

// Initial fetch to populate the miscarriage list on page load
updatemiscarriageList();

// Populate cattle options when the modal is shown
const modal = document.getElementById('modalMiscarriagedCattle');
modal.addEventListener('show.bs.modal', populateCattleOptions);
