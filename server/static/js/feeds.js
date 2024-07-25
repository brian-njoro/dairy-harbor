                //THIS FILE HAS TO BE REVIEWED AGAIN 
                //Some sections are not relevant such as cattle Id and cattle functions


// Function to fetch and update the feed list
const updatefeedList = async () => {
    console.log('Reached here feed list fetch')

    try {
        const response = await fetch('/api/feed');
        const feeds = await response.json();

        const feedList = document.getElementById('feedList');
        feedList.innerHTML = ''; // Clear existing list

        feeds.forEach(feed => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${feed.name}</td>
                <td>${new Date(feed.purchase_date).toLocaleDateString()}</td>
                <td>${feed.quantity}</td>
                <td>${feed.price}</td>
                <td>${feed.total_cost}</td>
                <td><button class="btn btn-btn btn-sm btn-info shadow-sm" data-bs-toggle="modal" data-bs-target="#editFeedModal" onclick="deletefeed(${feed.id})">Delete</button></td>
                <td><button class="btn btn-danger btn-sm" onclick="deletefeed(${feed.id})">Delete</button></td>
            `;

            feedList.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching feed list:', error);
    }
};

// Function to delete a feed
const deletefeed = async (id) => {
    try {
        const response = await fetch(`/api/feed/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            // Update the feed list after deletion
            updatefeedList();
        } else {
            console.error('Failed to delete feed:', await response.text());
        }
    } catch (error) {
        console.error('Error deleting feed:', error);
    }
};

// Function to fetch and populate cattle radio buttons in the modal
//I DON'T THINK THIS PART IS NEEDED HERE
const populateCattleOptions = async () => {
    try {
        const response = await fetch('/api/cattle/get'); // Adjust endpoint if needed
        const cattleList = await response.json();
        console.log('Reached here radiobutton')

        const cattleRadioButtonsContainer = document.getElementById('cattleRadioButtons');
        cattleRadioButtonsContainer.innerHTML = ''; // Clear existing options

        if (cattleList.length === 0) {
            cattleRadioButtonsContainer.innerHTML = '<p>No cattle available.</p>';
            return;
        }

        cattleList.forEach(cattle => {
            const radioButton = document.createElement('div');
            radioButton.classList.add('form-check');
            radioButton.innerHTML = `
                <input class="form-check-input" type="radio" name="cattleId" id="cattle-${cattle.serial_number}" value="${cattle.serial_number}" required>
                <label class="form-check-label" for="cattle-${cattle.serial_number}">
                    ${cattle.serial_number} - ${cattle.name}  <!-- Adjust based on available cattle fields -->
                </label>
            `;
            cattleRadioButtonsContainer.appendChild(radioButton);
        });
    } catch (error) {
        console.error('Error fetching cattle data:', error);
    }
};

// Event listener for the submit button
document.getElementById('addFeedButton').addEventListener('click', async () => {
    const price = document.getElementById('price').value;
    const worker_id = document.getElementById('worker_id').value;
    const quantity = document.getElementById('quantity').value;
    const agent = document.getElementById('agent').value;
    const name = document.getElementById('name').value;
    const purchase_date = document.getElementById('purchase_date').value;
    

    const feedData = {
        name: name,
        purchase_date: purchase_date,
        agent:agent,
        quantity:quantity,
        price: price,
        worker_id:worker_id,
    };

    try {
        const response = await fetch('/api/feed', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(feedData)
        });

        if (response.ok) {
            // Close the modal
            const modalCloseButton = document.querySelector('#modalFeeds .btn-close');
            if (modalCloseButton) {
                modalCloseButton.click(); // Simulate click on close button
            } else {
                console.error('Close button not found in modal');
            }

            // Update the feed list
            updatefeedList();
        } else {
            console.error('Failed to add feed:', await response.text());
        }
    } catch (error) {
        console.error('Error submitting feed:', error);
    }
});

// Initial fetch to populate the feed list on page load
updatefeedList();

// Populate cattle options when the modal is shown
const modal = document.getElementById('modalFeeds');
modal.addEventListener('show.bs.modal', populateCattleOptions);
