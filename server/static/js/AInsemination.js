// Function to fetch and update the A_insemination list
const updateAinseminationList = async () => {
    console.log('Reached here artificial insemination list fetch')

    try {
        const response = await fetch('/api/artificial_insemination');
        const A_inseminations = await response.json();

        const A_inseminationList = document.getElementById('AInseminationList');
        A_inseminationList.innerHTML = ''; // Clear existing list

        A_inseminations.forEach(A_insemination => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${new Date(A_insemination.date).toLocaleDateString()}</td>
                <td>${A_insemination.cattle_id}</td>
                <td>${A_insemination.vet_name}</td>
                <td>${A_insemination.donorBreed}</td>
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
document.getElementById('CattleAInseminationButton').addEventListener('click', async () => {
    const vetName = document.getElementById('vetName').value;
    const dateOfAinsemination = document.getElementById('dateOfInsemination').value;
    const cattleId = document.querySelector('input[name="cattleId"]:checked')?.value;
    const donorBreed = document.getElementById('donorBreed').value;
    const sexed =document.getElementById('sexed').value;
    const notes = document.getElementById('notes').value;

    if (!cattleId) {
        alert('Please select a cattle.');
        return;
    }

    const AinseminationData = {
        vet_name: vetName,
        insemination_date: dateOfAinsemination,
        cattle_id: cattleId,
        semen_breed: donorBreed,
        sexed:sexed,
        notes: notes,
    };

    try {
        const response = await fetch('/api/artificial_insemination', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(AinseminationData)
        });

        if (response.ok) {
            // Close the modal
            const modalCloseButton = document.querySelector('#modalCattleInsemination .btn-close');
            if (modalCloseButton) {
                modalCloseButton.click(); // Simulate click on close button
            } else {
                console.error('Close button not found in modal');
            }

            // Update the A_insemination list
            updateAinseminationList();
        } else {
            console.error('Failed to add artificial insemination:', await response.text());
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
