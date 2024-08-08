// Function to fetch and update the calving list
const updatecalvingList = async () => {
    console.log('Reached here calving list fetch')

    try {
        const response = await fetch('/api/calving');
        const calvings = await response.json();

        const calvingList = document.getElementById('calvingList');
        calvingList.innerHTML = ''; // Clear existing list

        calvings.forEach(calving => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${new Date(calving.calving_date).toLocaleDateString()}</td>
                <td>${Array.isArray(calving.cattle_id) ? calving.cattle_id.join(', ') : calving.cattle_id}</td>
                <td>${calving.outcome}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="deletecalving(${calving.id})">Delete</button>
                </td>
            `;

            calvingList.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching calving list:', error);
    }
};

// Function to delete a calving
const deletecalving = async (id) => {
    try {
        const response = await fetch(`/api/calving/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            // Update the calving list after deletion
            updatecalvingList();
        } else {
            console.error('Failed to delete calving:', await response.text());
        }
    } catch (error) {
        console.error('Error deleting calving:', error);
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
document.getElementById('cattleCalvingButton').addEventListener('click', async () => {
    const dateOfCalving = document.getElementById('dateOfCalving').value;
    const calfId = document.getElementById('calfId').value;
    const selectedCattleCheckboxes = document.querySelectorAll('input[name="cattleId"]:checked');
    const outcome = document.getElementById('outcome').value;
    const assistedBy = document.getElementById('assistedBy').value;
    const notes = document.getElementById('notes').value;

    if (selectedCattleCheckboxes.length === 0) {
        alert('Please select at least one cattle.');
        return;
    }

    const calvingPromises = Array.from(selectedCattleCheckboxes).map(checkbox => {
        const cattleId = checkbox.value;

        const calvingData = {
            calving_date: dateOfCalving,
            calf_id: calfId,
            cattle_id: cattleId,
            outcome: outcome,
            assisted_by: assistedBy,
            notes: notes,
        };

        return fetch('/api/calving', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(calvingData)
        });
    });

    try {
        const responses = await Promise.all(calvingPromises);

        let allSuccessful = true;
        for (const response of responses) {
            if (!response.ok) {
                allSuccessful = false;
                console.error('Failed to add calving:', await response.text());
            }
        }

        if (allSuccessful) {
            // Close the modal
            const modalCloseButton = document.querySelector('#modalNewCalf .btn-close');
            if (modalCloseButton) {
                modalCloseButton.click(); // Simulate click on close button
            } else {
                console.error('Close button not found in modal');
            }

            // Update the calving list
            updatecalvingList();
        } else {
            console.error('Some calvings failed.');
        }
    } catch (error) {
        console.error('Error submitting calving:', error);
    }
});

// Initial fetch to populate the calving list on page load
updatecalvingList();

// Populate cattle options when the modal is shown
const modal = document.getElementById('modalNewCalf');
modal.addEventListener('show.bs.modal', populateCattleOptions);
