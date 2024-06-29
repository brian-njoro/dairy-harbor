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
    // Your cattle-specific JavaScript code here
    fetchCattleList(); // Example: Fetching cattle list on cattle.html
    // Add event listeners or any other initialization needed for cattle.html
}


// Show initial content (Home)
showContent('homeContent');
