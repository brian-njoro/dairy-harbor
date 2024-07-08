document.addEventListener('DOMContentLoaded', () => {
    let btn = document.querySelector('.layout-menu-toggle a'); // Update the selector to match the HTML code
    let sidebar = document.querySelector('.sidebar');
    let menuLinks = document.querySelectorAll('.menu-link');

    btn.onclick = function() {
        sidebar.classList.toggle('active');
    }

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
            targetContent.style.display = 'block';
        }
    }

    // Show initial content (Home)
    showContent('homeContent');
});
