document.addEventListener('DOMContentLoaded', function() {
    const addCattleButton = document.getElementById('addCattleButton');
    
    addCattleButton.addEventListener('click', function() {
        // Get form values
        const name = document.getElementById('name').value;
        const dateOfBirth = document.getElementById('dateOfBirth').value;
        const breed = document.getElementById('breed').value;
        const fatherBreed = document.getElementById('fatherBreed').value;
        const motherBreed = document.getElementById('motherBreed').value;
        const methodBred = document.getElementById('methodBred').value;
        const adminId = document.getElementById('adminId').value;

        // Create an object with the form data
        const cattleData = {
            name: name,
            dateOfBirth: dateOfBirth,
            breed: breed,
            fatherBreed: fatherBreed,
            motherBreed: motherBreed,
            methodBred: methodBred,
            adminId: adminId
        };

        // Here you would typically send this data to a server
        // For this example, we'll just log it to the console
        console.log('Cattle Data:', cattleData);

        // You can add your API call here to save the data
        // For example:
        // saveCattleData(cattleData);

        // Clear the form
        document.getElementById('cattleForm').reset();

        // Close the modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalCattleRegistration'));
        modal.hide();

        // Show a success message
        alert('Cattle added successfully!');

        // Reload the page
        window.location.reload();
    });
});

// This function would handle the API call to save the data
    function saveCattleData(data) {
        fetch('your-api-endpoint', {
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