let btn = document.querySelector('#btn');
let sidebar = document.querySelector('.sidebar');
let menuLinks = document.querySelectorAll('.menu-link');

btn.addEventListener('click', toggleSidebar);

function toggleSidebar() {
    sidebar.classList.toggle('active');
}

// Add event listener to each menu link
menuLinks.forEach(link => {
    link.addEventListener('click', function(event) {
        event.preventDefault();  // Prevent default link behavior
        let targetContent = this.getAttribute('data-target');
        showContent(targetContent);
        if (sidebar.classList.contains('active')) {
            toggleSidebar();
        }
    });
});

function showContent(contentId) {
    // Hide all content sections
    let contents = document.querySelectorAll('.container > div');
    contents.forEach(content => {
        content.style.display = 'none';
    });

    // Show the selected content section
    let targetContent = document.getElementById(contentId);
    if (targetContent) {
        if (contentId === 'myCattleContent') {
            fetch('/cattle') // Fetching the HTML content for cattle.html
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.text();
                })
                .then(html => {
                    targetContent.innerHTML = html;
                    targetContent.style.display = 'block';
                    // After fetching HTML, initialize JavaScript specific to cattle.html
                    initCattlePage();
                })
                .catch(error => console.error('Error fetching cattle content:', error));
        } else {
            targetContent.style.display = 'block';
        }
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

// Function to fetch cattle list and populate the UI
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

                // Create cell for edit button
                const editCell = document.createElement('td');
                const editButton = document.createElement('button');
                editButton.textContent = 'Edit';
                editButton.classList.add('btn', 'btn-primary', 'btn-sm');
                editButton.addEventListener('click', () => editCattle(cattle.serial_number));
                editCell.appendChild(editButton);

                // Create cell for delete button
                const deleteCell = document.createElement('td');
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.classList.add('btn', 'btn-danger', 'btn-sm');
                deleteButton.addEventListener('click', () => deleteCattle(cattle.serial_number));
                deleteCell.appendChild(deleteButton);

                // Append cells to row
                row.appendChild(nameCell);
                row.appendChild(serialNumberCell);
                row.appendChild(editCell);
                row.appendChild(deleteCell);

                // Append row to cattleList
                cattleList.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error fetching cattle list:', error);
        });
}

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
        const modalCloseButton = document.querySelector('#modalCattleRegistration .btn-close');
        if (modalCloseButton) {
            modalCloseButton.click(); // Simulate click on close button
        } else {
            console.error('Close button not found in modal');
        }
        // Clear input fields
        clearFormFields();
        // Refresh cattle list after adding new cattle
        fetchCattleList();
    })
    .catch(error => {
        console.error('Error adding cattle:', error);
    });
}

// Function to clear input fields
function clearFormFields() {
    document.getElementById('name').value = '';
    document.getElementById('dateOfBirth').value = '';
    document.getElementById('photo').value = '';
    document.getElementById('breed').value = '';
    document.getElementById('fatherBreed').value = '';
    document.getElementById('motherBreed').value = '';
    document.getElementById('methodBred').value = '';
    document.getElementById('adminId').value = '';
}


// Show initial content (Home)
showContent('homeContent');
