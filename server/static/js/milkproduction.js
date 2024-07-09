document.addEventListener('DOMContentLoaded', function() {
    const milkProductionForm = document.querySelector('milkProduction');
    const milkList = document.getElementById('milkList');

    milkProductionForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the form from submitting the traditional way

        // Capture form data
        const serialNumber = document.getElementById('serialNumber').value;
        const milkLiters = document.getElementById('milkLiters').value;
        const Date = document.getElementById('date').value;
        const breed = document.getElementById('breed').value;
        const workerId = document.getElementById('workerId').value;

        // Validate form data
        if (!serialNumber || !milkLiters || !workerId || !Date || !breed) {
            alert('Please fill in all fields.');
            return;
        }

        // Create a new table row
        const newRow = document.createElement('tr');

        // Create table cells
        const dateCell = document.createElement('td');
        const serialNumberCell = document.createElement('td');
        const litersCell = document.createElement('td');
        const breedCell = document.createElement('td');
        const workerCell = document.createElement('td');
        const deleteCell = document.createElement('td');

        // Set cell content
        const currentDate = new Date().toLocaleDateString();
        dateCell.textContent = currentDate;
        serialNumberCell.textContent = serialNumber;
        litersCell.textContent = milkLiters;
        breedCell.textContent = breed;
        workerCell.textContent = workerId;

        // Create delete button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'btn btn-danger btn-sm';
        deleteButton.addEventListener('click', function() {
            milkList.removeChild(newRow);
        });

        deleteCell.appendChild(deleteButton);

        // Append cells to row
        newRow.appendChild(dateCell);
        newRow.appendChild(serialNumberCell);
        newRow.appendChild(litersCell);
        newRow.appendChild(breedCell);
        newRow.appendChild(workerCell);
        newRow.appendChild(deleteCell);

        // Append row to table
        milkList.appendChild(newRow);

        // Clear the form
        milkProductionForm.reset();
    });
});
