// Function to fetch and update the death list
const updatedeathList = async () => {
    console.log('Reached here death list fetch')

    try {
        const response = await fetch('/api/death');
        const deaths = await response.json();

        const deathList = document.getElementById('deathList');
        deathList.innerHTML = ''; // Clear existing list

        deaths.forEach(death => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${death.cattle_id}</td>
                <td>${new Date(death.dateOfdeath).toLocaleDateString()}</td>
                <td>
                <td>${death.CauseOfDeath}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="deletedeath(${death.id})">Delete</button>
                </td>
            `;

            deathList.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching death list:', error);
    }
};


// Function to delete a death
const deletedeath = async (id) => {
    try {
        const response = await fetch(`/api/death/${id}`, {
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
document.getElementById('cattleDeathButton').addEventListener('click', async () => {
    const dateOfDeath = document.getElementById('dateOfDeath').value;
    const cattleId = document.querySelector('input[name="cattleId"]:checked')?.value;
    const CauseOfDeath = document.getElementById('CauseOfDeath').value;
    const notes = document.getElementById('notes').value;

    if (!cattleId) {
        alert('Please select a cattle.');
        return;
    }

    const deathData = {
        cattle_id: cattleId,
        dateOfDeath: dateOfDeath,
        CauseOfDeath:CauseOfDeath,
        notes: notes,
    };

    try {
        const response = await fetch('/api/death', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(deathData)
        });

        if (response.ok) {
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
            console.error('Failed to add death:', await response.text());
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
