// Function to fetch and update the A_insemination list
const updateAinseminationList = async () => {
    console.log('Reached here artificial insemination list fetch');

    try {
        const response = await fetch('/api/artificial_insemination');
        const A_inseminations = await response.json();

        const A_inseminationList = document.getElementById('AInseminationList');
        A_inseminationList.innerHTML = ''; // Clear existing list

        A_inseminations.forEach(A_insemination => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${new Date(A_insemination.insemination_date).toLocaleDateString()}</td>
                <td>${A_insemination.cattle_id}</td>
                <td>${A_insemination.vet_name}</td>
                <td>${A_insemination.semen_breed}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="deleteAinsemination(${A_insemination.id})">Delete</button>
                </td>
            `;

            A_inseminationList.appendChild(row);
        });
    } catch (error) {
        console.log('Error fetching A_insemination list:', error);
    }
};


// Function to delete a A_insemination
const deleteAinsemination = async (id) => {
    try {
        const response = await fetch(`/api/artificial_insemination/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            // Update the A_insemination list after deletion
            updateAinseminationList();
        } else {
            console.error('Failed to delete A_insemination:', await response.text());
        }
    } catch (error) {
        console.error('Error deleting A_insemination:', error);
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
        console.log('Reached here checkbox');

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
document.getElementById('CattleAInseminationButton').addEventListener('click', async () => {
    const vetName = document.getElementById('vetName').value;
    const dateOfAinsemination = document.getElementById('dateOfInsemination').value;
    const selectedCattleCheckboxes = document.querySelectorAll('input[name="cattleId"]:checked');
    const semen_breed = document.getElementById('semen_breed').value;
    const sexed = document.getElementById('sexed').value;
    const notes = document.getElementById('notes').value;
    const cost = document.getElementById('cost').value;




    if (selectedCattleCheckboxes.length === 0) {
        alert('Please select at least one cattle.');
        return;
    }

    const AinseminationPromises = Array.from(selectedCattleCheckboxes).map(checkbox => {
        const cattleId = checkbox.value;

        const AinseminationData = {
            vet_name: vetName,
            insemination_date: dateOfAinsemination,
            cattle_id: cattleId,
            semen_breed: semen_breed,
            sexed: sexed,
            notes: notes,
        };

        return fetch('/api/artificial_insemination', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(AinseminationData)
        });
    });

    try {
        const responses = await Promise.all(AinseminationPromises);

        let allSuccessful = true;
        for (const response of responses) {
            if (!response.ok) {
                allSuccessful = false;
                console.error('Failed to add artificial insemination:', await response.text());
            }
        }

        if (allSuccessful) {
            // Close the modal
            const modalCloseButton = document.querySelector('#modalCattleInsemination .btn-close');
            if (modalCloseButton) {
                modalCloseButton.click(); // Simulate click on close button
                console.log("Insemination data sent successfully!");
            } else {
                console.error('Close button not found in modal');
            }

            // Update the A_insemination list
            updateAinseminationList();
        } else {
            console.error('Some inseminations failed.');
        }
    } catch (error) {
        console.error('Error submitting artificial insemination:', error);
    }
});

// Initial fetch to populate the A_insemination list on page load
updateAinseminationList();

// Populate cattle options when the modal is shown
const modal = document.getElementById('modalCattleInsemination');
modal.addEventListener('show.bs.modal', populateCattleOptions);

