document.addEventListener('DOMContentLoaded', function() {
    const addCattleButton = document.getElementById('addCattleButton');

    // Function to get form data and send it to the backend
    // Function to handle form submission
    function addCattle() {
        const form = document.getElementById('cattleForm');
        const formData = new FormData(form);
    
        // Convert FormData to the format expected by the API
        const cattleData = {
            name: formData.get('name'),
            date_of_birth: formData.get('dateOfBirth'),
            breed: formData.get('breed'),
            father_breed: formData.get('fatherBreed'),
            mother_breed: formData.get('motherBreed'),
            method_bred: formData.get('methodBred'),
            admin_id: parseInt(formData.get('adminId'))
        };
    
        // Send data to backend API
        fetch('/cattle/post', {  // Ensure this endpoint matches your Flask-RESTful route
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(cattleData),
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => Promise.reject(err));
            }
            return response.json();
        })
        .then(data => {
            console.log('Success:', data);
            alert(`Cattle created successfully. Serial number: ${data.cattle}`);
            closeModalAndReload();
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('An error occurred while adding the cattle: ' + (error.message || 'Please try again.'));
        });
    }
    
    function closeModalAndReload() {
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalCattleRegistration'));
        modal.hide();
        
        // Reload the page after a short delay to ensure the modal is closed
        setTimeout(() => {
            window.location.reload();
        }, 300);
    }
    
    // Add event listener to the Add Cattle button
    document.addEventListener('DOMContentLoaded', function() {
        const addCattleButton = document.getElementById('addCattleButton');
        addCattleButton.addEventListener('click', addCattle);
    });

    function fetchCattleList() {
        fetch('/api/cattle')
        .then(response => response.json())
        .then(data => {
            const cattleList = document.getElementById('cattleList');
            cattleList.innerHTML = ''; // Clear existing content
    
            data.forEach((cattle, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><i class="bx bx-user bx-sm text-info me-3" data-serial="${cattle.serial_number}" data-bs-toggle="modal" data-bs-target="#modalCowProfile"></td>
                    <td>${cattle.serialNumber}</td>
                    <td>${cattle.name}</td>
                    <td>${cattle.breed}</td>
                    <td>${cattle.dateOfBirth}</td>
                    <td>
                        <button class="btn btn-danger btn-sm" onclick="deleteCattle(${cattle.id})">Delete</button>
                    </td>
                `;
                cattleList.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error fetching cattle list:', error);
        });
    }

    // addCattleButton.addEventListener('click', function() {
    //     // Get form values
    //     const name = document.getElementById('name').value;
    //     const dateOfBirth = document.getElementById('dateOfBirth').value;
    //     const breed = document.getElementById('breed').value;
    //     const fatherBreed = document.getElementById('fatherBreed').value;
    //     const motherBreed = document.getElementById('motherBreed').value;
    //     const methodBred = document.getElementById('methodBred').value;
    //     const adminId = document.getElementById('adminId').value;

    //     // Create an object with the form data
    //     const cattleData = {
    //         name: name,
    //         dateOfBirth: dateOfBirth,
    //         breed: breed,
    //         fatherBreed: fatherBreed,
    //         motherBreed: motherBreed,
    //         methodBred: methodBred,
    //         adminId: adminId
    //     };

    //     // Here you would typically send this data to a server
    //     // For this example, we'll just log it to the console
    //     console.log('Cattle Data:', cattleData);

    //     // You can add your API call here to save the data
    //     // For example:
    //     // saveCattleData(cattleData);

    //     // Clear the form
    //     document.getElementById('cattleForm').reset();

    //     // Close the modal
    //     const modal = bootstrap.Modal.getInstance(document.getElementById('modalCattleRegistration'));
    //     modal.hide();

    //     // Show a success message
    //     alert('Cattle added successfully!');

    //     // Reload the page
    //     window.location.reload();
    // });
});

// This function would handle the API call to save the data
    function saveCattleData(data) {
        fetch('', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            console.log('Success:', result);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }