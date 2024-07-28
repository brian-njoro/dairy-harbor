document.addEventListener('DOMContentLoaded', () => {
    console.log('Document is ready');

    // Fetch cattle list when the page is loaded
    fetchCattleList();

    // Add event listener for the "Add Cattle" button
    const addCattleButton = document.getElementById('addCattleButton');
    if (addCattleButton) {
        addCattleButton.addEventListener('click', addCattle);
    } else {
        console.error('Add Cattle button not found');
    }
});

function fetchCattleList() {
    console.log('Fetching cattle list...');
    fetch('/api/cattle/get')
        .then(response => {
            console.log('Received response from /api/cattle/get');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                console.error('Error fetching cattle list:', data.error);
                return;
            }

            console.log('Received data:', data);
            const cattleList = document.getElementById('cattleList');
            cattleList.innerHTML = ''; // Clear existing list items

            data.forEach((cattle, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><button type="button" class="btn btn-info" data-bs-toggle="modal" data-bs-target="#modalCowProfile">
                        <i class="bi bi-person-square fs-4"></i>
                    </button></td>
                    <td>${cattle.serial_number}</td>
                    <td>${cattle.name}</td>
                    <td>${cattle.breed}</td>
                    <td>${cattle.status}</td>
                    <td>${cattle.date_of_birth}</td>
                    <td>
                        <button type="button" class="btn btn-info shadow-md" data-bs-toggle="modal" data-bs-target="#editCowModal" id='cattleProfile'>
                        Edit
                    </button></td>
                    <td><button class="btn btn-danger btn-sm" onclick="deleteCattle(${cattle.serial_number})">Delete</button></td>
                `;
                cattleList.appendChild(row);
            });

            // Update cattle count
            updateCattleCount(data.length);
        })
        .catch(error => {
            console.error('Error fetching cattle list:', error);
        });
}

function deleteCattle(serialNumber) {
if (!serialNumber) {
    console.error('Invalid cattle serial number:', serialNumber);
    return;
}

console.log(`Deleting cattle with serial number ${serialNumber}`);
fetch(`/api/cattle/delete/${serialNumber}`, {
    method: 'DELETE',
})
.then(response => {
    console.log('Received response from DELETE /api/cattle/delete');
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    console.log(`Cattle with serial number ${serialNumber} deleted successfully.`);
    // Refresh cattle list after deletion
    fetchCattleList();
})
.catch(error => {
    console.error(`Error deleting cattle with serial number ${serialNumber}:`, error);
});
}

// Function to handle photo upload
function uploadPhoto(photoFile) {
const formData = new FormData();
formData.append('photo', photoFile);

return fetch('/api/cattle/upload-photo', {
    method: 'POST',
    body: formData
})
.then(response => response.json())
.then(data => data.photo_url);
}

// Function to handle cattle addition
function addCattle() {
console.log('Add Cattle button clicked');

const name = document.getElementById('cattleName').value;
const dateOfBirth = document.getElementById('dateOfBirth').value;
const breed = document.getElementById('breed').value;
const status = document.getElementById('status').value;
const fatherBreed = document.getElementById('fatherBreed').value;
const motherBreed = document.getElementById('motherBreed').value;
const methodBred = document.getElementById('methodBred').value;
const gender = document.getElementById('gender').value;
const photoFile = document.getElementById('photoFile').files[0]; // Get the file object

// Get the farmer ID from the hidden input field
const farmerId = document.getElementById('farmerId') ? document.getElementById('farmerId').value : null;

// Prepare the form data object
const formData = {
    name: name,
    date_of_birth: dateOfBirth,
    breed: breed,
    father_breed: fatherBreed,
    mother_breed: motherBreed,
    method_bred: methodBred,
    status: status,
    gender: gender,
    farmer_id: farmerId
};

console.log('Form Data before photo upload:', formData);

if (photoFile) {
    uploadPhoto(photoFile)
        .then(photoUrl => {
            console.log('Photo URL received:', photoUrl);

            // Add photo URL to the form data
            formData.photo = photoUrl;

            // Post cattle data
            return fetch('/api/cattle/post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Cattle added successfully:', data);
            // Close the modal
            const modalCloseButton = document.querySelector('#modalCattleRegistration .btn-close');
            if (modalCloseButton) {
                modalCloseButton.click(); // Simulate click on close button
            } else {
                console.error('Close button not found in modal');
            }
            // Clear input fields
            clearFormFields();
            // Refresh cattle list
            fetchCattleList();
        })
        .catch(error => {
            console.error('Error adding cattle:', error);
        });
} else {
    // If no photo is selected, continue without uploading
    console.log('No photo selected');
    formData.photo = null; // Explicitly set photo to null if no photo is provided

    // Post cattle data
    fetch('/api/cattle/post', {
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
        // Close the modal
        const modalCloseButton = document.querySelector('#modalCattleRegistration .btn-close');
        if (modalCloseButton) {
            modalCloseButton.click(); // Simulate click on close button
        } else {
            console.error('Close button not found in modal');
        }
        // Clear input fields
        clearFormFields();
        // Refresh cattle list
        fetchCattleList();
    })
    .catch(error => {
        console.error('Error adding cattle:', error);
    });
}
}
// Helper function to clear form fields
function clearFormFields() {
document.getElementById('name').value = '';
document.getElementById('dateOfBirth').value = '';
document.getElementById('breed').value = '';
document.getElementById('status').value = '';
document.getElementById('fatherBreed').value = '';
document.getElementById('motherBreed').value = '';
document.getElementById('methodBred').value = '';
document.getElementById('gender').value = '';
document.getElementById('photoFile').value = ''; // Clear the file input
}

function updateCattleCount(count) {
const totalCowsSpan = document.getElementById('totalCows');
if (totalCowsSpan) {
    totalCowsSpan.textContent = count;
} else {
    console.error('Total Cows span not found');
}
}s