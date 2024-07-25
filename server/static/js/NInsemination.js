// Function to fetch and update the N_insemination list
const updateNinseminationList = async () => {
    console.log('Reached here natural Insemination list fetch')

    try {
        const response = await fetch('/api/natural_insemination');
        const N_inseminations = await response.json();

        const N_inseminationList = document.getElementById('NInseminationList');
        N_inseminationList.innerHTML = ''; // Clear existing list

        N_inseminations.forEach(N_insemination => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${new Date(N_insemination.date).toLocaleDateString()}</td>
                <td>${N_insemination.cattle_id}</td>
                <td>${N_insemination.vet_name}</td>
                <td>${N_insemination.donorBreed}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="deleteNinsemination(${N_insemination.id})">Delete</button>
                </td>
            `;

            N_inseminationList.appendChild(row);
        });
    } catch (error) {
        console.log('Error fetching Natural insemination list:', error);
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
        console.log('Error fetching cattle data:', error);
    }
};

// Event listener for the submit button
document.getElementById('CattleNInseminationButton').addEventListener('click', async () => {
    const dateOfNinsemination = document.getElementById('dateOfInsemination').value;
    const cattleId = document.querySelector('input[name="cattleId"]:checked')?.value;
    const donorBreed = document.getElementById('donorBreed').value;
    const fatherId = document.getElementById('fatherId').value;
    const notes = document.getElementById('notes').value;

    if (!cattleId) {
        alert('Please select a cattle.');
        return;
    }

    const N_inseminationData = {
        cattle_id: cattleId,
        father_breed: donorBreed,
        father_id:fatherId,
        date: dateOfNinsemination,
        notes: notes,
    };

    try {
        const response = await fetch('/api/natural_insemination', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(N_inseminationData)
        });

        if (response.ok) {
            // Close the modal
            const modalCloseButton = document.querySelector('#modalCattleNInsemination .btn-close');
            if (modalCloseButton) {
                modalCloseButton.click(); // Simulate click on close button
            } else {
                console.error('Close button not found in modal');
            }

            // Update the N_insemination list
            updateNinseminationList();
        } else {
            console.error('Failed to add Natural insemination:', await response.text());
        }
    } catch (error) {
        console.error('Error submitting Natural insemination:', error);
    }
});

// Initial fetch to populate the N_insemination list on page load
updateNinseminationList();

// Populate cattle options when the modal is shown
const modal = document.getElementById('modalCattleNInsemination');
modal.addEventListener('show.bs.modal', populateCattleOptions);
