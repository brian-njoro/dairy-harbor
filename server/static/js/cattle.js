

// Function to delete a single cattle// Function to fetch cattle list and populate the UI
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
                    const photoCell = document.createElement('td');
                    const photo = document.createElement('img');
                    photo.src = cattle.photo; // Assuming cattle.photo contains the URL to the photo
                    photo.alt = `Photo of ${cattle.name}`;
                    photo.classList.add('img-thumbnail', 'rounded-circle');
                    photo.style.width = '50px';
                    photo.style.height = '50px';
                    photoCell.appendChild(photo);

                    // Create a delete button for each row
                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Delete';
                    deleteButton.classList.add('btn', 'btn-danger', 'btn-sm', 'rounded');
                    deleteButton.onclick = function() {
                        deleteCattle(cattle.serial_number);
                    };

                    const deleteCell = document.createElement('td');
                    deleteCell.appendChild(deleteButton);

                    row.appendChild(photoCell);
                    row.appendChild(serialNumberCell);
                    row.appendChild(nameCell);
                    row.appendChild(breedCell);
                    row.appendChild(birthDateCell);
                    row.appendChild(deleteCell);
                    cattleList.appendChild(row);
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
            photo: document.getElementById('photo').value,
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

    function loadPhotos() {
        $.ajax({
            url: 'load_photos.php', // PHP script to fetch photos from server
            type: 'GET',
            success: function(response) {
                var photos = JSON.parse(response); // Assuming server returns JSON array of photo URLs
                
                // Clear existing table content
                $('#photoTable').empty();
                
                // Iterate through each photo URL and create table rows
                photos.forEach(function(photoUrl) {
                    var row = '<tr><td><img src="' + photoUrl + '" style="max-width: 200px; max-height: 200px;"></td></tr>';
                    $('#photoTable').append(row);
                });
            },
            error: function(xhr, status, error) {
                console.error("Error loading photos: " + xhr.responseText);
            }
        });
    }
    
    function uploadImage() {
        var formData = new FormData();
        var file = document.getElementById("photo").files[0];
        formData.append("photo", file);
    
        $.ajax({
            url: 'upload.php', // PHP script to handle file upload
            type: 'POST',
            data: formData,
            contentType: false,
            processData: false,
            success: function(response) {
                // Handle successful upload
                $('#uploadStatus').html(response);
    
                // Reload photos after successful upload
                loadPhotos();
            },
            error: function(xhr, status, error) {
                // Handle upload error
                console.error(xhr.responseText);
                $('#uploadStatus').html("Error uploading file: " + xhr.responseText);
            }
        });
    }
    
    // Call loadPhotos() initially to load existing photos when the page loads
    $(document).ready(function() {
        loadPhotos();
    });
    

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