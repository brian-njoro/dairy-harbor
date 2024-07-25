// Function to fetch and update the pregnancy list
const updatepregnancyList = async () => {
    console.log('Reached here pregnancy list fetch')

    try {
        const response = await fetch('/api/pregnancy');
        const pregnancys = await response.json();

        const pregnancyList = document.getElementById('pregnancyList');
        pregnancyList.innerHTML = ''; // Clear existing list

        pregnancys.forEach(pregnancy => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${pregnancy.cattle_id}</td>
                <td>${new Date(pregnancy.dateOfDetection).toLocaleDateString()}</td>
                <td>${pregnancy.dateOfDelivery}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="deletepregnancy(${pregnancy.id})">Delete</button>
                </td>
            `;

            pregnancyList.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching pregnancy list:', error);
    }
};


// Function to delete a pregnancy
const deletepregnancy = async (id) => {
    try {
        const response = await fetch(`/api/pregnancy/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            // Update the pregnancy list after deletion
            updatepregnancyList();
        } else {
            console.error('Failed to delete pregnancy:', await response.text());
        }
    } catch (error) {
        console.error('Error deleting pregnancy:', error);
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
document.getElementById('cattlepregnancyButton').addEventListener('click', async () => {
    const dateOfDetection = document.getElementById('dateOfDetection').value;
    const cattleId = document.querySelector('input[name="cattleId"]:checked')?.value;
    const dateOfDelivery = document.getElementById('dateOfDelivery').value;
    const notes = document.getElementById('notes').value;

    if (!cattleId) {
        alert('Please select a cattle.');
        return;
    }

    const pregnancyData = {
        cattle_id: cattleId,
        dateOfDetection: dateOfDetection,
        dateOfDelivery: dateOfDelivery,
        notes: notes,
    };

    try {
        const response = await fetch('/api/pregnancy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(pregnancyData)
        });

        if (response.ok) {
            // Close the modal
            const modalCloseButton = document.querySelector('#modalCattlepregnancy .btn-close');
            if (modalCloseButton) {
                modalCloseButton.click(); // Simulate click on close button
            } else {
                console.error('Close button not found in modal');
            }

            // Update the pregnancy list
            updatepregnancyList();
        } else {
            console.error('Failed to add pregnancy:', await response.text());
        }
    } catch (error) {
        console.error('Error submitting pregnancy:', error);
    }
});

// Initial fetch to populate the pregnancy list on page load
updatepregnancyList();

// Populate cattle options when the modal is shown
const modal = document.getElementById('modalCattlepregnancy');
modal.addEventListener('show.bs.modal', populateCattleOptions);
