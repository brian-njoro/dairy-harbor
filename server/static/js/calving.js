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
                <td>${new Date(calving.date).toLocaleDateString()}</td>
                <td>${calving.cattle_id}</td>
                <td>${calving.vet_name}</td>
                <td>${calving.drugUsed}</td>
                <td>${calving.calvingMethod}</td>
                <td>${calving.disease}</td>
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
document.getElementById('cattleCalvingButton').addEventListener('click', async () => {
    const calfId = document.getElementById('calfId').value;
    const dateOfCalving = document.getElementById('dateOfCalving').value;
    const cattleId = document.querySelector('input[name="cattleId"]:checked')?.value;
    const outcome = document.getElementById('outcome').value;
    const assistedBy = document.getElementById('assistedBy').value;
    const notes = document.getElementById('notes').value;

    if (!cattleId) {
        alert('Please select a cattle.');
        return;
    }

    const calvingData = {
        calfId: calfId,
        dateOfCalving: dateOfCalving,
        cattle_id: cattleId,
        assistedBy: assistedBy,
        notes: notes,
    };

    try {
        const response = await fetch('/api/calving', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(calvingData)
        });

        if (response.ok) {
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
            console.error('Failed to add calving:', await response.text());
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
