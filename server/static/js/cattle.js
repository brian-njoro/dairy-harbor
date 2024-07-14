
$(document).ready(function() {
    let cattleList = [];
    let serialNumber = 1;

    

    // Function to render the cattle list
    function renderCattleList() {
        $('#cattleList').empty();
        cattleList.forEach((cattle, index) => {
            $('#cattleList').append(`
                <tr>
                    ${index + 1}
                    <td><i class="bx bx-user bx-sm text-info me-3" data-serial="${cattle.serial_number}" data-bs-toggle="modal" data-bs-target="#modalCowProfile"></i></td>
                    <td>${cattle.serialNumber}</td>
                    <td>${cattle.name}</td>
                    <td>${cattle.breed}</td>
                    <td>${cattle.dateOfBirth}</td>
                    <td><button class="btn btn-danger delete-btn" data-index="${index}">Delete</button></td>
                </tr>
            `);
        });
    }

        // Display cattle data in the card section on click
    $(document).on('click', '.bx-user', function() {
        let serialNumber = $(this).data('serial');

        $.ajax({
            url: `/api/cattle/${serialNumber}`,
            method: 'GET',
            success: function(cattle) {
                $('#cowName').text(cattle.name);
                $('#cowBreed').text(cattle.breed);
                $('#dateOfBirth').text(cattle.date_of_birth);
                $('#cowStatus').text('Active');  // Assuming status is active for displayed cattle
                $('#delete').data('serial', cattle.serial_number);
            },
            error: function(error) {
                console.error("Error fetching cattle details:", error);
            }
        });
        
    }
);

    // Load cattle list from localStorage
    if (localStorage.getItem('cattleList')) {
        cattleList = JSON.parse(localStorage.getItem('cattleList'));
        serialNumber = cattleList.length + 1;
        renderCattleList();
    }

    // Function to load the entire page
    function loadPage() {
        fetchCattleList();
    }

    // Fetch cattle list on page load
    loadPage();

    // Add cattle button click event
    $('#addCattleButton').on('click', function() {
        // Get data from the form
        let cattle = {
            serialNumber: serialNumber,
            name: $('#name').val(),
            dateOfBirth: $('#dateOfBirth').val(),
            breed: $('#breed').val(),
            fatherBreed: $('#fatherBreed').val(),
            motherBreed: $('#motherBreed').val(),
            methodBred: $('#methodBred').val(),
            adminId: $('#adminId').val()
        };

        // Increment serial number for the next entry
        serialNumber++;

        // Save cattle data to the list
        cattleList.push(cattle);

        // Save the updated cattle list to localStorage
        localStorage.setItem('cattleList', JSON.stringify(cattleList));

        // Close the modal
        $('#modalCattleRegistration').modal('hide');

        // Reload the page to refresh the cattle list
        location.reload();
    });

    // Delete cattle button click event
    $(document).on('click', '.delete-btn', function() {
        let index = $(this).data('index');
        cattleList.splice(index, 1);

        // Save the updated cattle list to localStorage
        localStorage.setItem('cattleList', JSON.stringify(cattleList));

        // Re-render the cattle list
        renderCattleList();
    });
});