// Function to fetch and update the miscarriage list
const updatemiscarriageList = async () => {
    console.log('Reached here miscarriage list fetch')

    try {
        const response = await fetch('/api/miscarriage');
        const miscarriages = await response.json();

        const miscarriageList = document.getElementById('miscarriageList');
        miscarriageList.innerHTML = ''; // Clear existing list

        miscarriages.forEach(miscarriage => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${miscarriage.cattle_id}</td>
                <td>${new Date(miscarriage.dateOfMiscarriage).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="deletemiscarriage(${miscarriage.id})">Delete</button>
                </td>
            `;

            miscarriageList.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching miscarriage list:', error);
    }
};


// Function to delete a miscarriage
const deletemiscarriage = async (id) => {
    try {
        const response = await fetch(`/api/miscarriage/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            // Update the miscarriage list after deletion
            updatemiscarriageList();
        } else {
            console.error('Failed to delete miscarriage:', await response.text());
        }
    } catch (error) {
        console.error('Error deleting miscarriage:', error);
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
document.getElementById('cattleMiscarriageButton').addEventListener('click', async () => {
    const vetName = document.getElementById('vetName').value;
    const dateOfMiscarriage = document.getElementById('dateOfMiscarriage').value;
    const cattleId = document.querySelector('input[name="cattleId"]:checked')?.value;
    const notes = document.getElementById('notes').value;

    if (!cattleId) {
        alert('Please select a cattle.');
        return;
    }

    const miscarriageData = {
        cattle_id: cattleId,
        dateOfMiscarriage: dateOfMiscarriage,
        notes: notes,
    };

    try {
        const response = await fetch('/api/miscarriage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(miscarriageData)
        });

        if (response.ok) {
            // Close the modal
            const modalCloseButton = document.querySelector('#modalMiscarriagedCattle .btn-close');
            if (modalCloseButton) {
                modalCloseButton.click(); // Simulate click on close button
            } else {
                console.error('Close button not found in modal');
            }

            // Update the miscarriage list
            updatemiscarriageList();
        } else {
            console.error('Failed to add miscarriage:', await response.text());
        }
    } catch (error) {
        console.error('Error submitting miscarriage:', error);
    }
});

// Initial fetch to populate the miscarriage list on page load
updatemiscarriageList();

// Populate cattle options when the modal is shown
const modal = document.getElementById('modalMiscarriagedCattle');
modal.addEventListener('show.bs.modal', populateCattleOptions);
