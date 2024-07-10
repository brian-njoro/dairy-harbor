document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('formAuthentication');

    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault(); // Prevent the form from submitting the traditional way

        const emailUsername = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Create the data object to send in the request
        const data = {
            username: emailUsername,
            password: password
        };

        try {
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                alert(result.message);
                // Redirect to home page or any other page on successful login
                window.location.href = '/home';
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while trying to log in.');
        }
    });
});
