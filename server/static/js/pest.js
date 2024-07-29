// Function to fetch and update the pest list
const updatepestList = async () => {
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
                <td>${pest.cattle_id}</td>
                <td>${pest.vet_name}</td>
                <td>${pest.pesticide_used}</td>
                <td>${pest.method_used}</td>
                <td>${pest.pest_type}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="deletepest(${pest.id})">Delete</button>
                </td>
            `;

            pestList.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching pest list:', error);
    }
};


// Function to delete a pest
const deletepest = async (id) => {
    try {
        const response = await fetch(`/api/pest_control/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            // Update the pest list after deletion
            updatepestList();
        } else {
            console.error('Failed to delete pest:', await response.text());
        }
    } catch (error) {
        console.error('Error deleting pest:', error);
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
document.getElementById('pestControlButton').addEventListener('click', async () => {
    const vet_name = document.getElementById('vetName').value;
    const controlDate = document.getElementById('controlDate').value;
    const cattleId = document.querySelector('input[name="cattleId"]:checked')?.value;
    const method = document.getElementById('method').value;
    const pesticide = document.getElementById('pesticide').value;
    const pestName = document.getElementById('pestName').value;
    const notes = document.getElementById('notes').value;
    const cost = document.getElementById('cost').value;



    if (!cattleId) {
        alert('Please select a cattle.');
        return;
    }

    const pestData = {
        vet_name:vet_name,
        cattle_id: cattleId,
        control_date: controlDate,
        pest_type: pestName,
        method_used: method,
        pesticide_used:pesticide,
        notes: notes,
        cost: cost
    };

    try {
        const response = await fetch('/api/pest_control', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(pestData)
        });

        if (response.ok) {
            // Close the modal
            const modalCloseButton = document.querySelector('#modalPestControl .btn-close');
            if (modalCloseButton) {
                modalCloseButton.click(); // Simulate click on close button
            } else {
                console.error('Close button not found in modal');
            }

            // Update the pest list
            updatepestList();
        } else {
            console.error('Failed to add pest:', await response.text());
        }
    } catch (error) {
        console.error('Error submitting pest:', error);
    }
});

// Initial fetch to populate the pest list on page load
updatepestList();

// Populate cattle options when the modal is shown
const modal = document.getElementById('modalPestControl');
modal.addEventListener('show.bs.modal', populateCattleOptions);
