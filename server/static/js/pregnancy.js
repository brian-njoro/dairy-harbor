// Function to fetch and update the pregnancy list
const updatepregnancyList = async () => {
    console.log('Reached here at pregnancy list fetch')

    try {
        const response = await fetch('/api/pregnancy');
        const pregnancys = await response.json();

        const pregnancyList = document.getElementById('pregnancyList');
        pregnancyList.innerHTML = ''; // Clear existing list

        pregnancys.forEach(pregnancy => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${Array.isArray(pregnancy.cattle_id) ? pregnancy.cattle_id.join(', ') : pregnancy.cattle_id}</td>
                <td>${new Date(pregnancy.detection_date).toLocaleDateString()}</td>
                <td>${new Date(pregnancy.expected_delivery_date).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="deletepregnancy(${pregnancy.id})">Delete</button>
                </td>
            `;

            pregnancyList.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching pregnancy list:', error);
    }
};

// Function to delete a pregnancy
const deletepregnancy = async (id) => {
    try {
        const response = await fetch(`/api/pregnancy/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            // Update the pregnancy list after deletion
            updatepregnancyList();
        } else {
            console.error('Failed to delete pregnancy:', await response.text());
        }
    } catch (error) {
        console.error('Error deleting pregnancy:', error);
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
document.getElementById('cattlepregnancyButton').addEventListener('click', async () => {
    const dateOfDetection = document.getElementById('dateOfDetection').value;
    const expectedDateOfBirth = document.getElementById('expectedDateOfBirth').value;
    const selectedCattleCheckboxes = document.querySelectorAll('input[name="cattleId"]:checked');
    const notes = document.getElementById('notes').value;

    if (selectedCattleCheckboxes.length === 0) {
        alert('Please select at least one cattle.');
        return;
    }

    const pregnancyPromises = Array.from(selectedCattleCheckboxes).map(checkbox => {
        const cattleId = checkbox.value;

        const pregnancyData = {
            detection_date: dateOfDetection,
            expected_delivery_date:expectedDateOfBirth,
            cattle_id: cattleId,
            notes: notes,
        };

        return fetch('/api/pregnancy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(pregnancyData)
        });
    });

    try {
        const responses = await Promise.all(pregnancyPromises);

        let allSuccessful = true;
        for (const response of responses) {
            if (!response.ok) {
                allSuccessful = false;
                console.error('Failed to add pregnancy:', await response.text());
            }
        }

        if (allSuccessful) {
            // Close the modal
            const modalCloseButton = document.querySelector('#modalCattlepregnancy .btn-close');
            if (modalCloseButton) {
                modalCloseButton.click(); // Simulate click on close button
            } else {
                console.error('Close button not found in modal');
            }

            // Update the pregnancy list
            updatepregnancyList();
        } else {
            console.error('Some pregnancy entries failed.');
        }
    } catch (error) {
        console.error('Error submitting pregnancy:', error);
    }
});

// Initial fetch to populate the pregnancy list on page load
updatepregnancyList();

// Populate cattle options when the modal is shown
const modal = document.getElementById('modalCattlepregnancy');
modal.addEventListener('show.bs.modal', populateCattleOptions);
