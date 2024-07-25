                //THIS FILE HAS TO BE REVIEWED AGAIN 
                //Some sections are not relevant such as cattle Id and cattle functions


// Function to fetch and update the medicine list
const updatemedicineList = async () => {
    console.log('Reached here medicine list fetch')

    try {
        const response = await fetch('/api/medicine');
        const medicines = await response.json();

        const medicineList = document.getElementById('medicineList');
        medicineList.innerHTML = ''; // Clear existing list

        medicines.forEach(medicine => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${medicine.name}</td>
                <td>${new Date(medicine.purchase_date).toLocaleDateString()}</td>
                <td>${medicine.quantity}</td>
                <td>${medicine.price}</td>
                <td>${medicine.total_cost}</td>
                <td>
                    <button class="btn btn-btn btn-sm btn-info shadow-sm" data-bs-toggle="modal" data-bs-target="#editMedicineModal" onclick="deletemedicine(${medicine.id})">Delete</button>
                </td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="deletemedicine(${medicine.id})">Delete</button>
                </td>
            `;

            medicineList.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching medicine list:', error);
    }
};

// Function to delete a medicine
const deletemedicine = async (id) => {
    try {
        const response = await fetch(`/api/medicine/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            // Update the medicine list after deletion
            updatemedicineList();
        } else {
            console.error('Failed to delete medicine:', await response.text());
        }
    } catch (error) {
        console.error('Error deleting medicine:', error);
    }
};

// Function to fetch and populate cattle radio buttons in the modal
//I DON'T THINK THIS PART IS NEEDED HERE
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
document.getElementById('addMedicineButton').addEventListener('click', async () => {
    const purchase_date = document.getElementById('purchase_date').value;
    const name = document.getElementById('name').value;
    const agent = document.getElementById('agent').value;
    const quantity = document.getElementById('quantity').value;
    const price = document.getElementById('price').value;
    const worker_id = document.getElementById('worker_id').value;

    const medicineData = {
        purchase_date: purchase_date,
        name: name,
        agent:agent,
        quantity:quantity,
        price: price,
        worker_id:worker_id,
    };

    try {
        const response = await fetch('/api/medicine', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(medicineData)
        });

        if (response.ok) {
            // Close the modal
            const modalCloseButton = document.querySelector('#modalMedicine .btn-close');
            if (modalCloseButton) {
                modalCloseButton.click(); // Simulate click on close button
            } else {
                console.error('Close button not found in modal');
            }

            // Update the medicine list
            updatemedicineList();
        } else {
            console.error('Failed to add medicine:', await response.text());
        }
    } catch (error) {
        console.error('Error submitting medicine:', error);
    }
});

// Initial fetch to populate the medicine list on page load
updatemedicineList();

// Populate cattle options when the modal is shown
const modal = document.getElementById('modalMedicine');
modal.addEventListener('show.bs.modal', populateCattleOptions);

function updateProfile(formData, photoUrl = null) {
    console.log('updateProfile function called');
    const userId = "{{ current_user.id }}";
    const profileData = {
        name: formData.get('name'),
        purchase_date: formData.get('purchase_date'),
        quantity: formData.get('quantity'),
        price: formData.get('price'),
        agent: formData.get('agent'),
        agent: formData.get('agent'),
        worker_id: formData.get('worker_id'),
        current_password: formData.get('current_password')
    };


    fetch(`/api/profile/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(profileData),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Profile updated successfully') {
            console.log('Profile updated successfully');
            showMessage('Profile updated successfully', 'success');
            // Optionally close the modal
            $('#editProfileModal').modal('hide');
            // Simulate click on close button
            const modalCloseButton = document.querySelector('#editProfileModal .btn-close');
            if (modalCloseButton) {
                console.log('Closing modal...');
                modalCloseButton.click(); // Simulate click on close button
            } else {
                console.error('Close button not found in modal');
            }
            fetchAndFillProfileData();
            // Reload the page
            window.location.reload();
        } else {
            showMessage('Error updating profile: ' + data.message, 'danger');
            console.error('Error updating profile:', data.message);
        }
    })
    .catch(error => {
        showMessage('Error updating profile: ' + error.message, 'danger');
        console.error('Error updating profile:', error);
    });
}
