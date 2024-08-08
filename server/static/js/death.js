// Function to fetch and update the death list
const updatedeathList = async () => {
    console.log('Reached here death list fetch')

    try {
        const response = await fetch('/api/cattle_death');
        const deaths = await response.json();

        const deathList = document.getElementById('deathList');
        deathList.innerHTML = ''; // Clear existing list

        deaths.forEach(death => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${new Date(death.date).toLocaleDateString()}</td>
                <td>${Array.isArray(death.cattle_id) ? death.cattle_id.join(', ') : death.cattle_id}</td>
                <td>${death.cause_of_death}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="deleteDeath(${death.id})">Delete</button>
                </td>
            `;

            deathList.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching death list:', error);
    }
};

// Function to delete a death
const deleteDeath = async (id) => {
    try {
        const response = await fetch(`/api/cattle_death/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            // Update the death list after deletion
            updatedeathList();
        } else {
            console.error('Failed to delete death:', await response.text());
        }
    } catch (error) {
        console.error('Error deleting death:', error);
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
document.getElementById('CattleDeathButton').addEventListener('click', async () => {
    const dateOfDeath = document.getElementById('dateOfDeath').value;
    const selectedCattleCheckboxes = document.querySelectorAll('input[name="cattleId"]:checked');
    const cause_of_death = document.getElementById('CauseOfDeath').value;
    const notes = document.getElementById('notes').value;

    if (selectedCattleCheckboxes.length === 0) {
        alert('Please select at least one cattle.');
        return;
    }

    const deathPromises = Array.from(selectedCattleCheckboxes).map(checkbox => {
        const cattleId = checkbox.value;

        const deathData = {
            date: dateOfDeath,
            cause_of_death: cause_of_death,
            cattle_id: cattleId,
            notes: notes,
        };

        return fetch('/api/cattle_death', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(deathData)
        });
    });

    try {
        const responses = await Promise.all(deathPromises);

        let allSuccessful = true;
        for (const response of responses) {
            if (!response.ok) {
                allSuccessful = false;
                console.error('Failed to add death:', await response.text());
            }
        }

        if (allSuccessful) {
            // Close the modal
            const modalCloseButton = document.querySelector('#modalCattleDeath .btn-close');
            if (modalCloseButton) {
                modalCloseButton.click(); // Simulate click on close button
            } else {
                console.error('Close button not found in modal');
            }

            // Update the death list
            updatedeathList();
        } else {
            console.error('Some deaths failed.');
        }
    } catch (error) {
        console.error('Error submitting death:', error);
    }
});

// Initial fetch to populate the death list on page load
updatedeathList();

// Populate cattle options when the modal is shown
const modal = document.getElementById('modalCattleDeath');
modal.addEventListener('show.bs.modal', populateCattleOptions);
