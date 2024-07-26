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
                <td>${heat.detected_by}</td>
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


// Function to delete a heat
const deleteheat = async (id) => {
    try {
        const response = await fetch(`/api/heat_detection/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            // Update the heat list after deletion
            updateheatList();
        } else {
            console.error('Failed to delete heat:', await response.text());
        }
    } catch (error) {
        console.error('Error deleting heat:', error);
    }
};

// Function to fetch and populate cattle radio buttons in the modal
const populateCattleOptions = async () => {
    try {
        const response = await fetch('/api/cattle/get'); // Adjust endpoint if needed
        const cattleList = await response.json();
        console.log('Reached here radiobutton')

        const cattleRadioButtonsContainer = document.getElementById('cattleRadioButtons');
        cattleRadioButtonsContainer.innerHTML = ''; // Clear existing options

        if (cattleList.length === 0) {
            cattleRadioButtonsContainer.innerHTML = '<p>No cattle available.</p>';
            return;
        }

        cattleList.forEach(cattle => {
            const radioButton = document.createElement('div');
            radioButton.classList.add('form-check');
            radioButton.innerHTML = `
                <input class="form-check-input" type="radio" name="cattleId" id="cattle-${cattle.serial_number}" value="${cattle.serial_number}" required>
                <label class="form-check-label" for="cattle-${cattle.serial_number}">
                    ${cattle.serial_number} - ${cattle.name}  <!-- Adjust based on available cattle fields -->
                </label>
            `;
            cattleRadioButtonsContainer.appendChild(radioButton);
        });
    } catch (error) {
        console.error('Error fetching cattle data:', error);
    }
};

// Event listener for the submit button
document.getElementById('cattleheatButton').addEventListener('click', async () => {
    const dateOfDetection = document.getElementById('dateOfDetection').value;
    const cattleId = document.querySelector('input[name="cattleId"]:checked')?.value;
    const detectedBy = document.getElementById('detectedBy').value;
    const notes = document.getElementById('notes').value;

    if (!cattleId) {
        alert('Please select a cattle.');
        return;
    }

    const heatData = {
        cattle_id: cattleId,
        detection_date: dateOfDetection,
        detected_by: detectedBy,
        notes: notes,
    };

    try {
        const response = await fetch('/api/heat_detection', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(heatData)
        });

        if (response.ok) {
            // Close the modal
            const modalCloseButton = document.querySelector('#modalCattleheat .btn-close');
            if (modalCloseButton) {
                modalCloseButton.click(); // Simulate click on close button
            } else {
                console.error('Close button not found in modal');
            }

            // Update the heat list
            updateheatList();
        } else {
            console.error('Failed to add heat:', await response.text());
        }
    } catch (error) {
        console.error('Error submitting heat:', error);
    }
});

// Initial fetch to populate the heat list on page load
updateheatList();

// Populate cattle options when the modal is shown
const modal = document.getElementById('modalCattleheat');
modal.addEventListener('show.bs.modal', populateCattleOptions);
