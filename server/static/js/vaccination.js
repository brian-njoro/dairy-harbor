// Function to fetch and update the vaccination list
const updatevaccinationList = async () => {
    console.log('Reached here vaccination list fetch')

    try {
        const response = await fetch('/api/vaccination');
        const vaccinations = await response.json();

        const vaccinationList = document.getElementById('vaccinationList');
        vaccinationList.innerHTML = ''; // Clear existing list

        vaccinations.forEach(vaccination => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${new Date(vaccination.date).toLocaleDateString()}</td>
                <td>${vaccination.cattle_id}</td>
                <td>${vaccination.vet_name}</td>
                <td>${vaccination.method_of_administration}</td>
                <td>${vaccination.drug_used}</td>
                <td>${vaccination.disease}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="deletevaccination(${vaccination.id})">Delete</button>
                </td>
            `;

            vaccinationList.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching vaccination list:', error);
    }
};


// Function to delete a vaccination
const deletevaccination = async (id) => {
    try {
        const response = await fetch(`/api/vaccination/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            // Update the vaccination list after deletion
            updatevaccinationList();
        } else {
            console.error('Failed to delete vaccination:', await response.text());
        }
    } catch (error) {
        console.error('Error deleting vaccination:', error);
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
document.getElementById('CattleVaccinationButton').addEventListener('click', async () => {
    const dateOfvaccination = document.getElementById('dateOfvaccination').value;
    const vetName = document.getElementById('vetName').value;
    const method = document.getElementById('method').value;
    const cattleId = document.querySelector('input[name="cattleId"]:checked')?.value;
    const vaccineName = document.getElementById('vaccineName').value;
    const dose = document.getElementById('dose').value;
    const notes = document.getElementById('notes').value;

    if (!cattleId) {
        alert('Please select a cattle.');
        return;
    }

    const vaccinationData = {
        date: dateOfvaccination,
        vet_name: vetName,
        cattle_id: cattleId,
        method:method,
        drug: vaccineName,
        disease: dose,
        notes: notes,
    };

    try {
        const response = await fetch('/api/vaccination', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(vaccinationData)
        });

        if (response.ok) {
            // Close the modal
            const modalCloseButton = document.querySelector('#modalCattleVaccination .btn-close');
            if (modalCloseButton) {
                modalCloseButton.click(); // Simulate click on close button
            } else {
                console.error('Close button not found in modal');
            }

            // Update the vaccination list
            updatevaccinationList();
        } else {
            console.error('Failed to add vaccination:', await response.text());
        }
    } catch (error) {
        console.error('Error submitting vaccination:', error);
    }
});

// Initial fetch to populate the vaccination list on page load
updatevaccinationList();

// Populate cattle options when the modal is shown
const modal = document.getElementById('modalCattleVaccination');
modal.addEventListener('show.bs.modal', populateCattleOptions);
