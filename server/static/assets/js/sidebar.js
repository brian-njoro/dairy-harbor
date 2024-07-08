// Function to toggle the sidebar visibility
function toggleSidebar() {
    const layoutMenu = document.getElementById('layout-menu');
    layoutMenu.classList.toggle('collapsed');
}

// Function to show the specified content and hide others
function showContent(targetId) {
    // Hide all content divs
    const contentDivs = document.querySelectorAll('.main-content > div');
    contentDivs.forEach(div => {
        div.style.display = 'none';
    });

    // Show the target content div
    const targetDiv = document.getElementById(targetId);
    if (targetDiv) {
        targetDiv.style.display = 'block';
    }
}

// Add event listeners to the sidebar links
document.querySelectorAll('.menu-link').forEach(link => {
    link.addEventListener('click', function(event) {
        const targetId = event.target.getAttribute('data-target');
        if (targetId) {
            showContent(targetId);
        }
    });
});
