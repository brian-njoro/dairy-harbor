// Function to fetch and update the dehorning list
const updateDehorningList = async () => {
    console.log('Reached here dehorning list fetch')

    try {
        const response = await fetch('/api/dehorning');
        const dehornings = await response.json();

        const dehorningList = document.getElementById('dehorningList');
        dehorningList.innerHTML = ''; // Clear existing list

        dehornings.forEach(dehorning => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${new Date(dehorning.date).toLocaleDateString()}</td>
                <td>${Array.isArray(dehorning.cattle_id) ? dehorning.cattle_id.join(', ') : dehorning.cattle_id}</td>
                <td>${dehorning.method}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="deleteDehorning(${dehorning.id})">Delete</button>
                </td>
            `;

            dehorningList.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching dehorning list:', error);
    }
};

// Function to delete dehorning
const deleteDehorning = async (id) => {
    try {
        const response = await fetch(`/api/dehorning/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            // Update the dehorning list after deletion
            updateDehorningList();
        } else {
            console.error('Failed to delete dehorning:', await response.text());
        }
    } catch (error) {
        console.error('Error deleting dehorning:', error);
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
document.getElementById('cattleDehornButton').addEventListener('click', async () => {
    const vetName = document.getElementById('vetName').value;
    const dateOfDehorn = document.getElementById('dateOfDehorning').value;
    const selectedCattleCheckboxes = document.querySelectorAll('input[name="cattleId"]:checked');
    const dehorningMethod = document.getElementById('method').value;
    const notes = document.getElementById('notes').value;



    if (selectedCattleCheckboxes.length === 0) {
        alert('Please select at least one cattle.');
        return;
    }


    const dehorningPromises = Array.from(selectedCattleCheckboxes).map(checkbox => {
        const cattleId = checkbox.value;

        const dehornData = {
            vet_name: vetName,
            date: dateOfDehorn,
            cattle_id: cattleId,
            method: dehorningMethod,
            notes: notes,
        };

        return fetch('/api/dehorning', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dehornData)
        });
    });

    try {
        const responses = await Promise.all(dehorningPromises);

        let allSuccessful = true;
        for (const response of responses) {
            if (!response.ok) {
                allSuccessful = false;
                console.error('Failed to add dehorning:', await response.text());
            }
        }

        if (allSuccessful) {
            // Close the modal
            const modalCloseButton = document.querySelector('#modalCattleDehorning .btn-close');
            if (modalCloseButton) {
                modalCloseButton.click(); // Simulate click on close button
            } else {
                console.error('Close button not found in modal');
            }

            // Update the dehorning list
            updateDehorningList();
        } else {
            console.error('Some dehornings failed.');
        }
    } catch (error) {
        console.error('Error submitting dehorning:', error);
    }
});

// Initial fetch to populate the dehorning list on page load
updateDehorningList();

// Populate cattle options when the modal is shown
const modal = document.getElementById('modalCattleDehorning');
modal.addEventListener('show.bs.modal', populateCattleOptions);
