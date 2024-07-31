// Function to fetch and update the vaccination list
<<<<<<< HEAD
const updateVaccinationList = async () => {
    console.log('Reached here vaccination list fetch')
=======
// Function to fetch and update the vaccination list
const updatevaccinationList = async () => {
    console.log('Reached here vaccination list fetch');
>>>>>>> origin/main

    try {
        const response = await fetch('/api/vaccination');
        const data = await response.json();

        console.log('Response data:', data); // Log the response data

        // Access the vaccinations array within the response object
        const vaccinations = data.vaccinations;

<<<<<<< HEAD
            row.innerHTML = `
                <td>${new Date(vaccination.date).toLocaleDateString()}</td>
                <td>${Array.isArray(vaccination.cattle_id) ? vaccination.cattle_id.join(', ') : vaccination.cattle_id}</td>
                <td>${vaccination.vet_name}</td>
                <td>${vaccination.drug}</td>
                <td>${vaccination.disease}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="deleteVaccination(${vaccination.id})">Delete</button>
                </td>
            `;
=======
        // Check if vaccinations is an array
        if (Array.isArray(vaccinations)) {
            const vaccinationList = document.getElementById('vaccinationList');
            vaccinationList.innerHTML = ''; // Clear existing list
>>>>>>> origin/main

            vaccinations.forEach(vaccination => {
                const row = document.createElement('tr');

                row.innerHTML = `
                    <td>${new Date(vaccination.date).toLocaleDateString()}</td>
                    <td>${vaccination.vet_name}</td>
                    <td>${vaccination.method}</td>
                    <td>${vaccination.drug}</td>
                    <td>${vaccination.disease}</td>
                    <td>
                        <button class="btn btn-danger btn-sm" onclick="deletevaccination(${vaccination.id})">Delete</button>
                    </td>
                `;

                vaccinationList.appendChild(row);
            });
        } else {
            console.error('Error: The vaccinations property is not an array:', vaccinations);
        }
    } catch (error) {
        console.error('Error fetching vaccination list:', error);
    }
};

<<<<<<< HEAD
// Function to delete a Vaccination
const deleteVaccination = async (id) => {
=======


// Function to delete a vaccination
const deletevaccination = async (id) => {
>>>>>>> origin/main
    try {
        const response = await fetch(`/api/vaccination/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            // Update the Vaccination list after deletion
            updateVaccinationList();
        } else {
            console.error('Failed to delete Vaccination:', await response.text());
        }
    } catch (error) {
        console.error('Error deleting Vaccination:', error);
    }
};


// Function to handle "Select All" checkbox
const handleSelectAll = (selectAllCheckbox) => {
    const cattleCheckboxes = document.querySelectorAll('input[name="cattleId"]');
    cattleCheckboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });
};

// Function to fetch and populate cattle checkboxes in the modal
const populateCattleOptions = async () => {
    try {
        const response = await fetch('/api/cattle/get'); // Adjust endpoint if needed
        const cattleList = await response.json();
        console.log('Reached here checkbox')

        const cattleCheckboxesContainer = document.getElementById('cattleRadioButtons');
        cattleCheckboxesContainer.innerHTML = ''; // Clear existing options

        // Add "Select All" checkbox
        const selectAllCheckbox = document.createElement('div');
        selectAllCheckbox.classList.add('form-check');
        selectAllCheckbox.innerHTML = `
            <input class="form-check-input" type="checkbox" id="selectAllCattle">
            <label class="form-check-label" for="selectAllCattle">
                Select All
            </label>
        `;
        cattleCheckboxesContainer.appendChild(selectAllCheckbox);

        // Add event listener to "Select All" checkbox
        selectAllCheckbox.querySelector('input').addEventListener('change', (e) => handleSelectAll(e.target));

        if (cattleList.length === 0) {
            cattleCheckboxesContainer.innerHTML += '<p>No cattle available.</p>';
            return;
        }

        cattleList.forEach(cattle => {
            const checkbox = document.createElement('div');
            checkbox.classList.add('form-check');
            checkbox.innerHTML = `
                <input class="form-check-input" type="checkbox" name="cattleId" id="cattle-${cattle.serial_number}" value="${cattle.serial_number}">
                <label class="form-check-label" for="cattle-${cattle.serial_number}">
                    ${cattle.serial_number} - ${cattle.name}  <!-- Adjust based on available cattle fields -->
                </label>
            `;
            cattleCheckboxesContainer.appendChild(checkbox);
        });
    } catch (error) {
        console.error('Error fetching cattle data:', error);
    }
};

// Event listener for the submit button
document.getElementById('CattleVaccinationButton').addEventListener('click', async () => {
    const dateOfVaccination = document.getElementById('dateOfvaccination').value;
    const vetName = document.getElementById('vetName').value;
<<<<<<< HEAD
    const selectedCattleCheckboxes = document.querySelectorAll('input[name="cattleId"]:checked');
    const vaccineName = document.getElementById('vaccineName').value;
    const dose = document.getElementById('dose').value;
=======
    const method = document.getElementById('method').value;
    const cattleId = document.querySelector('input[name="cattleId"]:checked')?.value;
    const drug = document.getElementById('drug').value;
    const disease = document.getElementById('disease').value;
>>>>>>> origin/main
    const notes = document.getElementById('notes').value;
    const cost = document.getElementById('cost').value;


    if (selectedCattleCheckboxes.length === 0) {
        alert('Please select at least one cattle.');
        return;
    }

<<<<<<< HEAD
    const vaccinationPromises = Array.from(selectedCattleCheckboxes).map(checkbox => {
        const cattleId = checkbox.value;
=======
    const vaccinationData = {
        date: dateOfvaccination,
        vet_name: vetName,
        cattle_id: cattleId,
        drug: drug,
        method:method,
        drug: drug,
        disease: disease,
        notes: notes,
        cost: cost
    };
>>>>>>> origin/main

        const vaccinationData = {
            date: dateOfVaccination,
            vet_name: vetName,
            cattle_id: cattleId,
            drug: vaccineName,
            disease: dose,
            notes: notes,
        };

        return fetch('/api/vaccination', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(vaccinationData)
        });
    });

    try {
        const responses = await Promise.all(vaccinationPromises);

        let allSuccessful = true;
        for (const response of responses) {
            if (!response.ok) {
                allSuccessful = false;
                console.error('Failed to add vaccination:', await response.text());
            }
        }

        if (allSuccessful) {
            // Close the modal
            const modalCloseButton = document.querySelector('#modalCattleVaccination .btn-close');
            if (modalCloseButton) {
                modalCloseButton.click(); // Simulate click on close button
            } else {
                console.error('Close button not found in modal');
            }

            // Update the vaccination list
            updateVaccinationList();
        } else {
            console.error('Some vaccinations failed.');
        }
    } catch (error) {
        console.error('Error submitting vaccination:', error);
    }
});

// Initial fetch to populate the vaccination list on page load
updateVaccinationList();

// Populate cattle options when the modal is shown
const modal = document.getElementById('modalCattleVaccination');
modal.addEventListener('show.bs.modal', populateCattleOptions);
