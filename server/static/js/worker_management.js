document.addEventListener('DOMContentLoaded', function() {
    const registerWorkerButton = document.getElementById('registerWorkerButton');

    registerWorkerButton.addEventListener('click', function() {
        // Collect form data
        const workerName = document.getElementById('workerName').value;
        const workerEmail = document.getElementById('workerEmail').value;
        const workerPassword = document.getElementById('workerPassword').value;
        const workerPhoneNumber = document.getElementById('workerPhoneNumber').value;
        const workerAddress = document.getElementById('workerAddress').value;
        const workerRole = document.getElementById('workerRole').value;

        // Create the request payload
        const payload = {
            name: workerName,
            email_address: workerEmail,
            password: workerPassword,
            phone_number: workerPhoneNumber,
            address: workerAddress,
            role: workerRole,
            farmer_id: farmerId // Include farmer_id in the payload
        };

        // Send the registration request
        fetch('/signup/worker', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })
        .then(response => {
            return response.json();
        })
        .then(data => {
            const successMessageElement = document.getElementById('successMessage');
            if (data.message) {
                if (data.message === 'Worker registered successfully') {
                    // Clear the form fields
                    document.getElementById('workerForm').reset();
                    
                    // Close the modal
                    const modalCloseButton = document.querySelector('#modalWorkerRegistration .btn-close');
                    if (modalCloseButton) {
                        modalCloseButton.click(); // Simulate click on close button
                    }
                    
                    // Display success message
                    if (successMessageElement) {
                        successMessageElement.textContent = 'Registration successful!';
                        successMessageElement.style.color = 'green';
                        successMessageElement.style.display = 'block'; // Ensure it's visible
                        setTimeout(() => {
                            successMessageElement.style.display = 'none'; // Hide the message after 2 seconds
                        }, 3000); // Adjust timeout as needed
                    }
                } else {
                    // Display error message
                    if (successMessageElement) {
                        successMessageElement.textContent = data.message;
                        successMessageElement.style.color = 'red'; // Set error message color
                        successMessageElement.style.display = 'block'; // Ensure it's visible
                        setTimeout(() => {
                            successMessageElement.style.display = 'none'; // Hide the message after 2 seconds
                        }, 2000); // Adjust timeout as needed
                    }
                }
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
});
