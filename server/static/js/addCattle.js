document.addEventListener('DOMContentLoaded', function() {
    function fetchCattleList() {
    console.log('Fetching cattle list...');

    fetch('/cattle/get')
        .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
        })
        .then(data => {
        const cattleList = document.getElementById('cattleList');
        cattleList.innerHTML = ''; // Clear existing list items

        data.forEach(cattle => {
            const row = document.createElement('tr');
            const nameCell = document.createElement('td');
            nameCell.textContent = cattle.name;
            const serialNumberCell = document.createElement('td');
            serialNumberCell.textContent = cattle.serial_number;
            const breedCell = document.createElement('td');
            breedCell.textContent = cattle.breed;
            const birthDateCell = document.createElement('td');
            birthDateCell.textContent = cattle.date_of_birth;

            // Create an img element for the photo
            // const photoCell = document.createElement('td');
            // const photo = document.createElement('img');
            // photo.src = cattle.photo; // Use the URL from the server
            // photo.alt = `Photo of ${cattle.name}`;
            // photo.classList.add('img-thumbnail', 'rounded-circle');
            // photo.style.width = '50px';
            // photo.style.height = '50px';
            // photoCell.appendChild(photo);

            // Create a delete button for each row
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.classList.add('btn', 'btn-danger', 'btn-sm', 'rounded');
            deleteButton.onclick = function() {
            deleteCattle(cattle.serial_number);
            };

            const profileButton = document.createElement('pButton');
            profileButton.innerHTML = `<i class='bx bxs-user bx-sm text-info' data-bs-toggle="modal" data-bs-target="#modalCowProfile" data-serial-number="serialNumber"></i>`;
            const profileCell = document.createElement('td');
            profileCell.appendChild(profileButton);

            const deleteCell = document.createElement('td');
            deleteCell.appendChild(deleteButton);
            
            row.appendChild(profileCell);
            row.appendChild(serialNumberCell);
            row.appendChild(nameCell);
            row.appendChild(breedCell);
            row.appendChild(birthDateCell);
            //row.appendChild(photoCell);
            row.appendChild(deleteCell);
            cattleList.appendChild(row);

            console.log('Cattle list fetched successfully!');
        });

        })
        .catch(error => {
        console.error('Error fetching cattle list:', error);
        });
    }

    // Function to add new cattle
    function addCattle() {
        console.log('Adding cattle ...');
        const formData = {
            name: document.getElementById('name').value,
            date_of_birth: document.getElementById('dateOfBirth').value,
            breed: document.getElementById('breed').value,
            father_breed: document.getElementById('fatherBreed').value,
            mother_breed: document.getElementById('motherBreed').value,
            method_bred: document.getElementById('methodBred').value,
            admin_id: parseInt(document.getElementById('adminId').value)
        };

        fetch('/cattle/post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Cattle added successfully:', data);
            // Close the modal after adding cattle
            const modalElement = document.getElementById('modalCattleRegistration');
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) {
                modal.hide();
            }
            // Reload the page after adding new cattle
            location.reload();
        })
        .catch(error => {
            console.error('Error adding cattle:', error);
        });
    }

    // Function to delete a single cattle
    function deleteCattle(serial_number) {
    console.log(`Deleting cattle with serial_number: ${serial_number}...`);

    fetch(`/cattle/${serial_number}`, {
        method: 'DELETE',
        headers: {
        'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log(`Cattle with serial_number ${serial_number} deleted successfully:`, data);
        // Refresh cattle list after deleting the cattle
        fetchCattleList();
    })
    .catch(error => {
        console.error(`Error deleting cattle with serial_number ${serial_number}:`, error);
    });
    }

    // Fetch cattle list initially
    fetchCattleList();

    // Add event listener to "Add Cattle" button
    const addCattleButton = document.getElementById('addCattleButton');
    if (addCattleButton) {
    addCattleButton.addEventListener('click', function() {
        addCattle();
    });
    }
});


document.addEventListener('DOMContentLoaded', () => {
    // Add event listener to all profile icons
    document.querySelectorAll('[data-bs-toggle="modal"][data-bs-target="#modalCowProfile"]').forEach(icon => {
        icon.addEventListener('click', function() {
            const serialNumber = this.getAttribute('data-serial-number');
            renderCowProfile(serialNumber);
        });
    });
});

function renderCowProfile(serialNumber) {
    fetch(`/cattle/get/${serialNumber}`)
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => Promise.reject(err));
        }
        return response.json();
    })
    .then(cow => {
        document.getElementById('serialNumber').textContent = cow.serial_number;
        document.getElementById('cowName').textContent = cow.name;
        document.getElementById('dateOfBirth').textContent = cow.date_of_birth;
        document.getElementById('cowBreed').textContent = cow.breed;
        document.getElementById('fatherBreed').textContent = cow.father_breed;
        document.getElementById('motherBreed').textContent = cow.mother_breed;// Assuming 'status' field exists

        // Update cow history table
        renderCowHistory(cow.history); // Assuming 'history' field contains an array of cow's historical data
    })
    .catch(error => {
        console.error('Error fetching cow details:', error);
        alert('An error occurred while fetching the cow details: ' + (error.message || 'Please try again.'));
    });
}

function renderCowHistory(history) {
    const tableBody = document.getElementById('cattleHistory');
    tableBody.innerHTML = ''; // Clear previous history

    if (history && history.length > 0) {
        history.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.serial_number}</td>
                <td>${item.name}</td>
                <td>${item.breed}</td>
                <td>${item.date_of_birth}</td>
            `;
            tableBody.appendChild(row);
        });
    } else {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="5" class="text-center">No history available</td>
        `;
        tableBody.appendChild(row);
    }
}



// Function to add new cattle
    // function addCattle() {
    // console.log('Adding cattle ...');
    // const form = document.getElementById('cattleForm');
    // const formData = new FormData(form);

    //     fetch('/cattle/post', {
    //         method: 'POST',
    //         body: formData
    //     })
    //     .then(response => {
    //         if (!response.ok) {
    //         throw new Error(`HTTP error! Status: ${response.status}`);
    //         }
    //         return response.json();
    //     })
    //     .then(data => {
    //         console.log('Cattle added successfully:', data);
    //         // Close the modal after adding cattle
    //         const modalElement = document.getElementById('modalCattleRegistration');
    //         const modal = bootstrap.Modal.getInstance(modalElement);
    //         if (modal) {
    //         modal.hide();
    //         }
    //         // Reload the page after adding new cattle
    //         location.reload();
    //     })
    //     .catch(error => {
    //         console.error('Error adding cattle:', error);
    //     });
    // }