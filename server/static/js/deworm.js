// Function to fetch and update the deworm list
const updateDewormingList = async () => {
    console.log('Reached here at deworming list fetch')

    try {
        const response = await fetch('/api/deworming');
        const deworms = await response.json();

        const dewormList = document.getElementById('dewormList');
        dewormList.innerHTML = ''; // Clear existing list

        deworms.forEach(deworm => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${new Date(deworm.date).toLocaleDateString()}</td>
                <td>${deworm.cattle_id}</td>
                <td>${deworm.vet_name}</td>
                <td>${deworm.drug_used}</td>
                <td>${deworm.method_of_administration}</td>
                <td>${deworm.disease}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="deleteDeworming(${deworm.id})">Delete</button>
                </td>
            `;

            dewormList.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching deworm list:', error);
    }
};


// Function to delete a deworm
const deleteDeworming = async (id) => {
    try {
        const response = await fetch(`/api/deworming/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            // Update the deworm list after deletion
            updateDewormingList();
        } else {
            console.error('Failed to delete deworm:', await response.text());
        }
    } catch (error) {
        console.error('Error deleting deworm:', error);
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
document.getElementById('cattleDewormButton').addEventListener('click', async () => {
    const vetName = document.getElementById('vetName').value;
    const dateOfdeworm = document.getElementById('dateOfDeworming').value;
    const cattleId = document.querySelector('input[name="cattleId"]:checked')?.value;
    const drugUsed = document.getElementById('drugUsed').value;
    const DewormingMethod = document.getElementById('DewormingMethod').value;
    const disease = document.getElementById('disease').value;
    const notes = document.getElementById('notes').value;

    if (!cattleId) {
        alert('Please select a cattle.');
        return;
    }

    const dewormData = {
        vet_name: vetName,
        date: dateOfdeworm,
        cattle_id: cattleId,
        drug_used: drugUsed,
        method_of_administration: DewormingMethod,
        disease: disease,
        notes: notes,
    };

    try {
        const response = await fetch('/api/deworming', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dewormData)
        });

        if (response.ok) {
            // Close the modal
            const modalCloseButton = document.querySelector('#modalCattleDeworming .btn-close');
            if (modalCloseButton) {
                modalCloseButton.click(); // Simulate click on close button
            } else {
                console.error('Close button not found in modal');
            }

            // Update the deworm list
            updateDewormingList();
        } else {
            console.error('Failed to add Deworming:', await response.text());
        }
    } catch (error) {
        console.error('Error submitting Deworming:', error);
    }
});

// Initial fetch to populate the deworm list on page load
updateDewormingList();

// Populate cattle options when the modal is shown
const modal = document.getElementById('modalCattleDeworming');
modal.addEventListener('show.bs.modal', populateCattleOptions);
