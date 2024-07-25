// Function to fetch and update the dehorn list
const updateDehorningList = async () => {
    console.log('Reached here deworming list fetch')

    try {
        const response = await fetch('/api/dehorning');
        const dehorns = await response.json();

        const dehornList = document.getElementById('dehornList');
        dehornList.innerHTML = ''; // Clear existing list

        dehorns.forEach(dehorn => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${new Date(dehorn.date).toLocaleDateString()}</td>
                <td>${dehorn.cattle_id}</td>
                <td>${dehorn.vet_name}</td>
                <td>${dehorn.dehorningMethod}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="deleteN_insemination(${N_insemination.id})">Delete</button>
                </td>
            `;

            dehornList.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching dehorn list:', error);
    }
};


// Function to delete a dehorn
const deleteDehorning = async (id) => {
    try {
        const response = await fetch(`/api/dehorning/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            // Update the dehorn list after deletion
            updateDehorningList();
        } else {
            console.error('Failed to delete dehorn:', await response.text());
        }
    } catch (error) {
        console.error('Error deleting dehorn:', error);
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
document.getElementById('cattleDehornButton').addEventListener('click', async () => {
    const vetName = document.getElementById('vetName').value;
    const dateOfdehorn = document.getElementById('dateOfDehorning').value;
    const cattleId = document.querySelector('input[name="cattleId"]:checked')?.value;
    const dehorningMethod = document.getElementById('dehorningMethod').value;
    const notes = document.getElementById('notes').value;

    if (!cattleId) {
        alert('Please select a cattle.');
        return;
    }

    const dehornData = {
        vet_name: vetName,
        date: dateOfdehorn,
        cattle_id: cattleId,
        dehorningMethod: dehorningMethod,
        notes: notes,
    };

    try {
        const response = await fetch('/api/dehorning', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dehornData)
        });

        if (response.ok) {
            // Close the modal
            const modalCloseButton = document.querySelector('#modalCattleDehorning .btn-close');
            if (modalCloseButton) {
                modalCloseButton.click(); // Simulate click on close button
            } else {
                console.error('Close button not found in modal');
            }

            // Update the dehorn list
            updateDehorningList();
        } else {
            console.error('Failed to add Dehorning:', await response.text());
        }
    } catch (error) {
        console.error('Error submitting Dehorning:', error);
    }
});

// Initial fetch to populate the dehorn list on page load
updateDehorningList();

// Populate cattle options when the modal is shown
const modal = document.getElementById('modalCattleDehorning');
modal.addEventListener('show.bs.modal', populateCattleOptions);
