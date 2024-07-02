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
        } else if (contentId === 'myWorkersContent') {
            fetch('/worker') // Fetching the HTML content for worker.html
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.text();
                })
                .then(html => {
                    targetContent.innerHTML = html;
                    targetContent.style.display = 'block';
                    // After fetching HTML, initialize JavaScript specific to worker.html
                    initWorkerPage();
                })
                .catch(error => console.error('Error fetching worker content:', error));
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

                row.innerHTML = `
                    <td>
                        <div class="nav-item navbar-dropdown dropdown-user dropdown>
                            <a class="nav-link dropdown-toggle hide-arrow" href="javascript:void(0);" data-bs-toggle="dropdown">
                                <div class="avatar avatar-online">
                                    <img src="${cattle.photo}" alt="Cattle Photo" class="w-px-40 h-auto rounded-circle" />
                                </div>
                            </a>
                            <ul class="dropdown-menu dropdown-menu-end">
                                <li>
                                    <a class="dropdown-item" href="#">
                                        <div class="d-flex">
                                            <div class="flex-shrink-0 me-3">
                                                <div class="avatar avatar-online">
                                                    <img src="${cattle.photo}" alt="Profile Photo" class="w-px-40 h-auto rounded-circle" />
                                                </div>
                                            </div>
                                            <div class="flex-grow-1">
                                                <span class="fw-medium d-block">${cattle.name}</span>
                                                <small class="text-muted">${cattle.serial_number}</small>
                                            </div>
                                        </div>
                                    </a>
                                </li>
                                <li>
                                    <div class="dropdown-divider"></div>
                                </li>
                                <li>
                                    <a class="dropdown-item" href="#">
                                        <i class="bx bx-user me-2"></i>
                                        <span class="align-middle">${cattle.name}</span>
                                    </a>
                                </li>
                                <li>
                                    <a class="dropdown-item" href="#">
                                        <i class="bx bx-cog me-2"></i>
                                        <span class="align-middle">Edit</span>
                                    </a>
                                </li>
                                <li>
                                    <a class="dropdown-item" href="#">
                                        <span class="d-flex align-items-center align-middle">
                                            <i class="flex-shrink-0 bx bx-credit-card me-2"></i>
                                            <span class="flex-grow-1 align-middle ms-1">Billing</span>
                                            <span class="flex-shrink-0 badge badge-center rounded-pill bg-danger w-px-20 h-px-20">4</span>
                                        </span>
                                    </a>
                                </li>
                                <li>
                                    <div class="dropdown-divider"></div>
                                </li>
                                <li>
                                    <a class="dropdown-item" href="javascript:void(0);">
                                        <i class="bx bx-power-off me-2"></i>
                                        <span class="align-middle">Delete</span>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </td>
                    <td>${cattle.name}</td>
                    <td>${cattle.serial_number}</td>
                    <td>${cattle.date_of_birth}</td>
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
