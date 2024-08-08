document.addEventListener('DOMContentLoaded', function () {
    const feedsListElement = document.getElementById('feedsList');
    const addFeedButton = document.getElementById('addFeedButton');
    const updateFeedButton = document.getElementById('updateFeedButton');

    // Fetch and display all feed records
    function fetchFeeds() {
        fetch('/api/feed')
            .then(response => response.json())
            .then(data => {
                feedsListElement.innerHTML = '';
                data.forEach(feed => {
                    feedsListElement.innerHTML += `
                        <tr>
                            <td>${feed.purchase_date}</td>
                            <td>${feed.name}</td>
                            <td>${feed.agent}</td>
                            <td>${feed.quantity}</td>
                            <td>${feed.price}</td>
                            <td><button class="btn btn-info btn-sm" onclick="editFeed(${feed.id})">Edit</button></td>
                            <td><button class="btn btn-danger btn-sm" onclick="deleteFeed(${feed.id})">Delete</button></td>
                        </tr>`;
                });
            })
            .catch(error => console.error('Error fetching feeds:', error));
    }

    // Add new feed record
    addFeedButton.addEventListener('click', function () {
        const feedData = {
            purchase_date: document.getElementById('purchaseDate').value,
            name: document.getElementById('feedName').value,
            agent: document.getElementById('agent').value,
            quantity: document.getElementById('quantity').value,
            price: document.getElementById('price').value
        };

        fetch('/api/feed', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(feedData)
        })
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    alert(data.message);
                } else {
                    fetchFeeds();
                    closeModal('#modalFeeds');
                }
            })
            .catch(error => console.error('Error adding feed:', error));
    });

    // Edit feed
    window.editFeed = function (id) {
        fetch(`/api/feed/${id}`)
            .then(response => response.json())
            .then(feed => {
                document.getElementById('editFeedId').value = feed.id;
                document.getElementById('editModalPurchaseDate').value = feed.purchase_date;
                document.getElementById('editModalName').value = feed.name;
                document.getElementById('editModalAgent').value = feed.agent;
                document.getElementById('editModalQuantity').value = feed.quantity;
                document.getElementById('editModalPrice').value = feed.price;
                new bootstrap.Modal(document.getElementById('editFeedModal')).show();
            })
            .catch(error => console.error('Error fetching feed:', error));
    };

    // Update feed
    updateFeedButton.addEventListener('click', function () {
        const id = document.getElementById('editFeedId').value;
        const feedData = {
            purchase_date: document.getElementById('editModalPurchaseDate').value,
            name: document.getElementById('editModalName').value,
            agent: document.getElementById('editModalAgent').value,
            quantity: document.getElementById('editModalQuantity').value,
            price: document.getElementById('editModalPrice').value
        };

        fetch(`/api/feed/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(feedData)
        })
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    alert(data.message);
                } else {
                    fetchFeeds();
                    closeModal('#editFeedModal');
                }
            })
            .catch(error => console.error('Error updating feed:', error));
    });

    // Delete feed
    window.deleteFeed = function (id) {
        if (confirm('Are you sure you want to delete this feed record?')) {
            fetch(`/api/feed/${id}`, {
                method: 'DELETE'
            })
                .then(response => response.json())
                .then(data => {
                    alert(data.message);
                    fetchFeeds();
                })
                .catch(error => console.error('Error deleting feed:', error));
        }
    };

    // Close modal function
    function closeModal(modalSelector) {
        const modalCloseButton = document.querySelector(`${modalSelector} .btn-close`);
        if (modalCloseButton) {
            modalCloseButton.click();
        } else {
            console.error('Close button not found in modal');
        }
    }

    // Initialize feeds list
    fetchFeeds();
});
