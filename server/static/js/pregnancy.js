// Function to fetch and update the pregnancy list
const updatePregnancyList = async () => {
    console.log('Starting to fetch pregnancy list');
    const pregnancyList = document.getElementById('pregnancyList');

    try {
        const response = await fetch('/api/pregnancy');
        console.log('Fetch response:', response);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const pregnancies = await response.json();
        console.log('Parsed pregnancies:', pregnancies);

        pregnancyList.innerHTML = ''; // Clear existing list

        if (pregnancies.length === 0) {
            pregnancyList.innerHTML = '<tr><td colspan="4">No pregnancies found.</td></tr>';
            return;
        }

        pregnancies.forEach(pregnancy => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${pregnancy.cattle_id}</td>
                <td>${new Date(pregnancy.detection_date).toLocaleDateString()}</td>
                <td>${new Date(pregnancy.expected_delivery_date).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="deletePregnancy(${pregnancy.id})">Delete</button>
                </td>
            `;

            pregnancyList.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching pregnancy list:', error);
        pregnancyList.innerHTML = '<tr><td colspan="4">Error loading pregnancy data. Please try again later.</td></tr>';
    }
};

// Function to delete a pregnancy
const deletePregnancy = async (id) => {
    try {
        const response = await fetch(`/api/pregnancy/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            console.log(`Pregnancy with id ${id} deleted successfully`);
            updatePregnancyList();
        } else {
            console.error('Failed to delete pregnancy:', await response.text());
            alert('Failed to delete pregnancy. Please try again.');
        }
    } catch (error) {
        console.error('Error deleting pregnancy:', error);
        alert('Error deleting pregnancy. Please try again.');
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
    console.log('Populating cattle options');
    const cattleCheckboxesContainer = document.getElementById('cattleCheckboxes');

    try {
        const response = await fetch('/api/cattle/get');
        console.log('Cattle fetch response:', response);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const cattleList = await response.json();
        console.log('Parsed cattle list:', cattleList);

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
                    ${cattle.serial_number} - ${cattle.name}
                </label>
            `;
            cattleCheckboxesContainer.appendChild(checkbox);
        });
    } catch (error) {
        console.error('Error fetching cattle data:', error);
        cattleCheckboxesContainer.innerHTML = '<p>Error loading cattle data. Please try again later.</p>';
    }
};

// Event listener for the submit button
document.getElementById('cattlepregnancyButton').addEventListener('click', async () => {
    const dateOfDetection = document.getElementById('dateOfDetection').value;
    const dateOfDelivery = document.getElementById('dateOfDelivery').value;
    const notes = document.getElementById('notes').value;
    const selectedCattleCheckboxes = document.querySelectorAll('input[name="cattleId"]:checked');

    if (selectedCattleCheckboxes.length === 0) {
        alert('Please select at least one cattle.');
        return;
    }

    for (const checkbox of selectedCattleCheckboxes) {
        const cattleId = checkbox.value;

        const pregnancyData = {
            cattle_id: cattleId,
            detection_date: dateOfDetection,
            expected_delivery_date: dateOfDelivery,
            notes: notes,
        };

        try {
            const response = await fetch('/api/pregnancy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(pregnancyData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            console.log(`Pregnancy added for cattle ${cattleId}`);
        } catch (error) {
            console.error('Error submitting pregnancy:', error);
            alert(`Failed to add pregnancy for cattle ${cattleId}. Please try again.`);
        }
    }

    // Close the modal
    const modalCloseButton = document.querySelector('#modalCattlepregnancy .btn-close');
    if (modalCloseButton) {
        modalCloseButton.click(); // Simulate click on close button
    } else {
        console.error('Close button not found in modal');
    }

    // Update the pregnancy list
    updatePregnancyList();
});

// Initial fetch to populate the pregnancy list on page load
document.addEventListener('DOMContentLoaded', () => {
    updatePregnancyList();
});

// Populate cattle options when the modal is shown
const modal = document.getElementById('modalCattlepregnancy');
modal.addEventListener('show.bs.modal', populateCattleOptions);