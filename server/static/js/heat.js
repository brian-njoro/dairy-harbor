// Function to fetch and update the heat list
const updateheatList = async () => {
    console.log('Reached here heat list fetch')

    try {
        const response = await fetch('/api/heat_detection');
        const heats = await response.json();

        const heatList = document.getElementById('heatDetectionList');
        heatList.innerHTML = ''; // Clear existing list

        heats.forEach(heat => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${new Date(heat.detection_date).toLocaleDateString()}</td>
                <td>${heat.cattle_id}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="deleteheat(${heat.id})">Delete</button>
                </td>
            `;

            heatList.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching heat list:', error);
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


// Function to fetch and update the heat list
// const updateHeatList = async () => {
//     console.log('Reached here heat list fetch')

//     try {
//         const response = await fetch('/api/heat_detection');
//         const heats = await response.json();

//         const heatList = document.getElementById('heatDetectionList');
//         heatList.innerHTML = ''; // Clear existing list

//         heats.forEach(heat => {
//             const row = document.createElement('tr');

//             row.innerHTML = `
//                 <td>${new Date(heat.detection_date).toLocaleDateString()}</td>
//                 <td>${Array.isArray(heat.cattle_id) ? heat.cattle_id.join(', ') : heat.cattle_id}</td>
//                 <td>
//                     <button class="btn btn-danger btn-sm" onclick="deleteHeat(${heat.id})">Delete</button>
//                 </td>
//             `;

//             heatList.appendChild(row);
//         });
//     } catch (error) {
//         console.error('Error fetching heat list:', error);
//     }
// };

// Function to delete a heat
const deleteHeat = async (id) => {
    try {
        const response = await fetch(`/api/heat_detection/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            // Update the heat list after deletion
            updateHeatList();
        } else {
            console.error('Failed to delete heat:', await response.text());
        }
    } catch (error) {
        console.error('Error deleting heat:', error);
    }
};


// Event listener for the submit button
document.getElementById('cattleHeatButton').addEventListener('click', async () => {
    const dateOfDetection = document.getElementById('dateOfDetection').value;
    const selectedCattleCheckboxes = document.querySelectorAll('input[name="cattleId"]:checked');
    const detectedBy = document.getElementById('detectedBy').value;
    const notes = document.getElementById('notes').value;

    if (selectedCattleCheckboxes.length === 0) {
        alert('Please select at least one cattle.');
        return;
    }

    const heatDetectionPromises = Array.from(selectedCattleCheckboxes).map(checkbox => {
        const cattleId = checkbox.value;

        const heatData = {
            cattle_id: cattleId,
            detection_date: dateOfDetection,
            detected_by: detectedBy,
            notes: notes,
        };

        return fetch('/api/heat_detection', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(heatData)
        });
    });

    try {
        const responses = await Promise.all(heatDetectionPromises);

        let allSuccessful = true;
        for (const response of responses) {
            if (!response.ok) {
                allSuccessful = false;
                console.error('Failed to add heat detection:', await response.text());
            }
        }

        if (allSuccessful) {
            // Close the modal
            const modalCloseButton = document.querySelector('#modalCattleHeat .btn-close');
            if (modalCloseButton) {
                modalCloseButton.click(); // Simulate click on close button
            } else {
                console.error('Close button not found in modal');
            }

            // Update the heat list
            updateHeatList();
        } else {
            console.error('Some heat detection entries failed.');
        }
    } catch (error) {
        console.error('Error submitting heat detection:', error);
    }
});

// Initial fetch to populate the heat list on page load
updateHeatList();

// Populate cattle options when the modal is shown
const modal = document.getElementById('modalCattleHeat');
modal.addEventListener('show.bs.modal', populateCattleOptions);
