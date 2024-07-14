// Function to toggle the sidebar visibility
function toggleSidebar() {
    const layoutContainer = document.querySelector('.layout-container');
    if (layoutContainer) {
        layoutContainer.classList.toggle('layout-menu-collapsed');
    }
}

// Function to simulate the click on the x icon
function simulateXIconClick() {
    const xIconLink = document.querySelector('.layout-menu-toggle.menu-link');
    if (xIconLink) {
        xIconLink.click();
    }
}

// Add event listener to each menu link
document.querySelectorAll('.menu-link[data-target]').forEach(link => {
    link.addEventListener('click', function(event) {
        event.preventDefault();  // Prevent default link behavior
        const targetId = this.getAttribute('data-target');
        if (targetId) {
            showContent(targetId);
        }
        simulateXIconClick(); // Simulate the click on the x icon to collapse the sidebar
    });
});

// Function to show the specified content and hide others
function showContent(contentId) {
    // Hide all content sections except the target
    let contents = document.querySelectorAll('.main-content > div');
    contents.forEach(content => {
        if (content.id === contentId) {
            content.style.display = 'block';
            
           
        } else {
            content.style.display = 'none';
        }
    });



    // Special handling for dynamic content loading
    if (contentId === 'myCattleContent') {
        console.log('LOOOOOOAAADING THE CATTLE CONTENT')
        fetch('/cattle') // Fetching the HTML content for cattle.html
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.text();
            })
            .then(html => {
                const cattleContentDiv = document.getElementById('myCattleContent');
                cattleContentDiv.innerHTML = html;
                cattleContentDiv.style.display = 'block';
                // Initialize JavaScript specific to cattle.html if needed
                initCattlePage();
            })
            .catch(error => console.error('Error fetching cattle content:', error));
    } else if (contentId === 'myWorkersContent') {
        fetch('/worker') // Fetching the HTML content for worker.html
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.text();
            })
            .then(html => {
                const workerContentDiv = document.getElementById('myWorkersContent');
                workerContentDiv.innerHTML = html;
                workerContentDiv.style.display = 'block';
                // Initialize JavaScript specific to worker.html if needed
                initWorkerPage();
            })
            .catch(error => console.error('Error fetching worker content:', error));
    }
}

// Function to initialize cattle.html specific JavaScript
function initCattlePage() {
    console.log('Initializing cattle page...');
    // Fetch cattle list initially
    fetchCattleList();

    // Add event listener to "Add Cattle" button
    const addCattleButton = document.getElementById('addCattleButton');
    if (addCattleButton) {
        addCattleButton.addEventListener('click', function() {
            console.log('Add Cattle button clicked');
            addCattle();
        });
    } else {
        console.error('Add Cattle button not found');
    }
}

// Function to initialize worker.html specific JavaScript
function initWorkerPage() {
    console.log('Initializing worker page...');
    // Add any worker page-specific initialization here
}

// Function to fetch cattle list and populate the UI
function fetchCattleList() {
    console.log('Fetching cattle list...');
    fetch('/cattle/get')
        .then(response => {
            console.log('Received response from /cattle/get');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Received data:', data);
            const cattleList = document.getElementById('cattleList');
            cattleList.innerHTML = ''; // Clear existing list items

            data.forEach((cattle, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${cattle.serial_number}</td>
                    <td>${cattle.name}</td>
                    <td>${cattle.breed}</td>
                    <td>${cattle.date_of_birth}</td>
                    <td><button class="btn btn-danger btn-sm" onclick="deleteCattle('${cattle.serial_number}')">Delete</button></td>
                `;
                cattleList.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error fetching cattle list:', error);
        });
}
document.addEventListener('DOMContentLoaded', fetchCattleList);

// Function to handle editing a cattle record
function editCattle(serialNumber) {
    // Implement edit functionality here
    console.log(`Editing cattle with serial number ${serialNumber}`);
    // Example: Redirect to edit page or open a modal for editing
}

// Function to handle deleting a cattle record
function deleteCattle(serialNumber) {
    console.log(`Deleting cattle with serial number ${serialNumber}`);
    fetch(`/cattle/${serialNumber}`, {
        method: 'DELETE',
    })
    .then(response => {
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

// Function to add new cattle
document.getElementById('addCattleButton').addEventListener('click', addCattle);

function addCattle() {
    console.log('Add Cattle button clicked');
    
    const name = document.getElementById('name').value;
    const dateOfBirth = document.getElementById('dateOfBirth').value;
    const breed = document.getElementById('breed').value;
    const fatherBreed = document.getElementById('fatherBreed').value;
    const motherBreed = document.getElementById('motherBreed').value;
    const methodBred = document.getElementById('methodBred').value;
    const adminId = document.getElementById('adminId').value;
    
    console.log('Form Data:', { name, dateOfBirth, breed, fatherBreed, motherBreed, methodBred, adminId });

    const formData = {
        name: name,
        date_of_birth: dateOfBirth,
        breed: breed,
        father_breed: fatherBreed,
        mother_breed: motherBreed,
        method_bred: methodBred,
        admin_id: adminId
    };

    fetch('/cattle/post', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        console.log('Fetch response received');
        if (!response.ok) {
            console.error(`HTTP error! Status: ${response.status}`);
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Cattle added successfully:', data);
        // Close the modal after adding cattle
        const modalCloseButton = document.querySelector('#modalCattleRegistration .btn-close');
        if (modalCloseButton) {
            console.log('Closing modal...');
            modalCloseButton.click(); // Simulate click on close button
        } else {
            console.error('Close button not found in modal');
        }
        // Clear input fields
        clearFormFields();
        // Optionally update cattle list or handle success
        // fetchCattleList();
    })
    .catch(error => {
        console.error('Error adding cattle:', error);
    });
}

function clearFormFields() {
    console.log('Clearing form fields');
    document.getElementById('name').value = '';
    document.getElementById('dateOfBirth').value = '';
    document.getElementById('breed').value = '';
    document.getElementById('fatherBreed').value = '';
    document.getElementById('motherBreed').value = '';
    document.getElementById('methodBred').value = '';
    document.getElementById('adminId').value = '';
}




// Show initial content (Home)
showContent('homeContent');
