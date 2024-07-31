document.addEventListener('DOMContentLoaded', function() {
    const milkProductionForm = document.getElementById('milkProduction');
    const milkList = document.getElementById('milkList');

    milkProductionForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the form from submitting the traditional way

        // Capture form data
        const serialNumber = document.getElementById('serialNumber').value;
        const milkLiters = document.getElementById('milkLiters').value;
        const date = document.getElementById('date').value;
        const breed = document.getElementById('breed').value;
        const workerId = document.getElementById('workerId').value;
        const givenToCalf = document.getElementById('givenToCalf').value;
        const consumedByStaff = document.getElementById('consumedByStaff').value;
        const spillage = document.getElementById('spillage').value;
        const spoiled = document.getElementById('spoiled').value;

        // Validate form data
        if (!serialNumber || !milkLiters || !workerId || !date || !breed) {
            alert('Please fill in all required fields.');
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
        const givenToCalfCell = document.createElement('td');
        const consumedByStaffCell = document.createElement('td');
        const spillageCell = document.createElement('td');
        const spoiledCell = document.createElement('td');
        const deleteCell = document.createElement('td');

        // Set cell content
        dateCell.textContent = new Date(date).toLocaleDateString();
        serialNumberCell.textContent = serialNumber;
        litersCell.textContent = milkLiters;
        breedCell.textContent = breed;
        workerCell.textContent = workerId;
        givenToCalfCell.textContent = givenToCalf || '0';
        consumedByStaffCell.textContent = consumedByStaff || '0';
        spillageCell.textContent = spillage || '0';
        spoiledCell.textContent = spoiled || '0';

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
        newRow.appendChild(givenToCalfCell);
        newRow.appendChild(consumedByStaffCell);
        newRow.appendChild(spillageCell);
        newRow.appendChild(spoiledCell);
        newRow.appendChild(deleteCell);

        // Append row to table
        milkList.appendChild(newRow);

        // Clear the form
        milkProductionForm.reset();
    });
});
