// Function to fetch and update the N_insemination list
const updateNinseminationList = async () => {
    console.log('Reached here natural insemination list fetch');

    try {
        const response = await fetch('/api/natural_insemination');
        const N_inseminations = await response.json();

        const N_inseminationList = document.getElementById('NinseminationList');
        N_inseminationList.innerHTML = ''; // Clear existing list

        N_inseminations.forEach(N_insemination => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${new Date(N_insemination.date).toLocaleDateString()}</td>
                <td>${N_insemination.cattle_id}</td>
                <td>${N_insemination.father_breed}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="deleteNinsemination(${N_insemination.id})">Delete</button>
                </td>
            `;

            N_inseminationList.appendChild(row);
        });
    } catch (error) {
        console.log('Error fetching N_insemination list:', error);
    }
};


// Function to delete a N_insemination
const deleteNinsemination = async (id) => {
    try {
        const response = await fetch(`/api/natural_insemination/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            // Update the N_insemination list after deletion
            updateNinseminationList();
        } else {
            console.error('Failed to delete N_insemination:', await response.text());
        }
    } catch (error) {
        console.error('Error deleting N_insemination:', error);
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
        console.log('Reached here checkbox');

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
document.getElementById('CattleNInseminationButton').addEventListener('click', async () => {
    const date = document.getElementById('dateOfInsemination').value;
    const selectedCattleCheckboxes = document.querySelectorAll('input[name="cattleId"]:checked');
    const father_breed = document.getElementById('donorBreed').value;
    const father_id = document.getElementById('fatherId').value;
    const notes = document.getElementById('notes').value;

    if (selectedCattleCheckboxes.length === 0) {
        alert('Please select at least one cattle.');
        return;
    }

    const NinseminationPromises = Array.from(selectedCattleCheckboxes).map(checkbox => {
        const cattleId = checkbox.value;

        const NinseminationData = {
            date: date,
            cattle_id: cattleId,
            father_breed: father_breed,
            father_id: father_id,
            notes: notes,
        };

        return fetch('/api/natural_insemination', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(NinseminationData)
        });
    });

    try {
        const responses = await Promise.all(NinseminationPromises);

        let allSuccessful = true;
        for (const response of responses) {
            if (!response.ok) {
                allSuccessful = false;
                console.error('Failed to add natural insemination:', await response.text());
            }
        }

        if (allSuccessful) {
            // Close the modal
            const modalCloseButton = document.querySelector('#modalCattleNInsemination .btn-close');
            if (modalCloseButton) {
                modalCloseButton.click(); // Simulate click on close button
                console.log("Insemination data sent successfully!");
            } else {
                console.error('Close button not found in modal');
            }

            // Update the N_insemination list
            updateNinseminationList();
        } else {
            console.error('Some inseminations failed.');
        }
    } catch (error) {
        console.error('Error submitting natural insemination:', error);
    }
});

// Initial fetch to populate the N_insemination list on page load
updateNinseminationList();

// Populate cattle options when the modal is shown
const modal = document.getElementById('modalCattleNInsemination');
modal.addEventListener('show.bs.modal', populateCattleOptions);

