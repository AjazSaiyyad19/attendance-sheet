
const menu = [
    {
        id: 1,
        name: "Paneer Tikka",
        category: "Starter",
        price: 220,
        desc: "Smoky paneer with Indian spices.",
        image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=700&q=80"
    },
    {
        id: 2,
        name: "Crispy Veg Bites",
        category: "Starter",
        price: 160,
        desc: "Crunchy snacks served with a tasty dip.",
        image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=700&q=80"
    },
    {
        id: 3,
        name: "Butter Paneer Masala",
        category: "Main",
        price: 280,
        desc: "Paneer cooked in creamy tomato gravy.",
        image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=700&q=80"
    },
    {
        id: 4,
        name: "Veg Biryani",
        category: "Main",
        price: 240,
        desc: "Aromatic rice with vegetables and spices.",
        image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=700&q=80"
    },
    {
        id: 5,
        name: "Margherita Pizza",
        category: "Main",
        price: 260,
        desc: "Classic pizza with tomato and cheese.",
        image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=700&q=80"
    },
    {
        id: 6,
        name: "Chocolate Brownie",
        category: "Dessert",
        price: 140,
        desc: "A delicious chocolate dessert.",
        image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=700&q=80"
    },
    {
        id: 7,
        name: "Gulab Jamun",
        category: "Dessert",
        price: 100,
        desc: "Soft traditional Indian sweet.",
        image: "https://images.unsplash.com/photo-1666190092159-4d6f8e5b4c1f?auto=format&fit=crop&w=700&q=80"
    },
    {
        id: 8,
        name: "Fresh Lime Soda",
        category: "Drink",
        price: 80,
        desc: "Refreshing lime drink.",
        image: "https://images.unsplash.com/photo-1513558161293-cdaf765edfd4?auto=format&fit=crop&w=700&q=80"
    }
];

let activeCategory = "All";

let cart = JSON.parse(localStorage.getItem("sgCart") || "{}");

const menuItems = document.getElementById("menuItems");

const cartModal = new bootstrap.Modal(
    document.getElementById("cartModal")
);

function money(amount) {
    return "₹" + amount;
}

// DISPLAY MENU

function displayMenu() {
    const search = document.getElementById("searchInput")
        .value.toLowerCase().trim();

    const filteredMenu = menu.filter(function(item) {
        const categoryMatch =
            activeCategory === "All" ||
            item.category === activeCategory;

        const searchMatch =
            item.name.toLowerCase().includes(search) ||
            item.desc.toLowerCase().includes(search);

        return categoryMatch && searchMatch;
    });

    menuItems.innerHTML = "";

    if (filteredMenu.length === 0) {
        menuItems.innerHTML =
            '<div class="col-12"><div class="empty-state">No food found.</div></div>';
        return;
    }

    filteredMenu.forEach(function(item) {
        menuItems.innerHTML += `
            <div class="col-sm-6 col-lg-3">
                <div class="food-card">
                    <img src="${item.image}"
                         alt="${item.name}"
                         loading="lazy"
                         onerror="this.onerror=null;this.src='https://placehold.co/600x400?text=Food'">

                    <div class="food-card-body">
                        <span class="badge text-bg-light">
                            ${item.category}
                        </span>

                        <h3 class="mt-2">${item.name}</h3>
                        <p>${item.desc}</p>

                        <div class="d-flex justify-content-between align-items-center">
                            <span class="price">${money(item.price)}</span>

                            <button class="btn btn-dark btn-sm"
                                    onclick="addToCart(${item.id})">
                                + Add
                            </button>
                        </div>
                    </div>
                </div>
            </div>`;
    });
}

// CATEGORY FILTER

document.getElementById("filters").addEventListener("click", function(event) {
    const button = event.target.closest("[data-category]");

    if (!button) return;

    activeCategory = button.dataset.category;

    document.querySelectorAll(".filter-btn").forEach(function(btn) {
        btn.classList.toggle("active", btn === button);
    });

    displayMenu();
});

// SEARCH FOOD

document.getElementById("searchInput").addEventListener("input", displayMenu);

// ADD TO CART

function addToCart(id) {
    cart[id] = (cart[id] || 0) + 1;

    saveCart();
    alert("Food added to cart!");
}

// SAVE CART

function saveCart() {
    localStorage.setItem("sgCart", JSON.stringify(cart));

    const count = Object.values(cart).reduce(function(total, qty) {
        return total + qty;
    }, 0);

    document.getElementById("cartCount").textContent = count;
}

// OPEN CART

document.getElementById("openCart").addEventListener("click", function() {
    displayCart();
    cartModal.show();
});

// DISPLAY CART ITEMS

function displayCart() {
    const cartItems = document.getElementById("cartItems");
    let total = 0;

    cartItems.innerHTML = "";

    const ids = Object.keys(cart).filter(function(id) {
        return cart[id] > 0;
    });

    if (ids.length === 0) {
        cartItems.innerHTML = '<p class="text-center">Your cart is empty.</p>';
    }

    ids.forEach(function(id) {
        const item = menu.find(function(food) {
            return food.id === Number(id);
        });

        if (!item) return;

        const quantity = cart[id];
        total += item.price * quantity;

        cartItems.innerHTML += `
            <div class="cart-row">
                <div>
                    <strong>${item.name}</strong>
                    <div>${money(item.price)} each</div>
                </div>

                <div class="cart-controls">
                    <button onclick="changeQuantity(${id}, -1)">−</button>
                    <span>${quantity}</span>
                    <button onclick="changeQuantity(${id}, 1)">+</button>
                </div>

                <strong>${money(item.price * quantity)}</strong>
            </div>`;
    });

    document.getElementById("cartTotal").textContent = money(total);
}

// CHANGE QUANTITY

function changeQuantity(id, change) {
    cart[id] = (cart[id] || 0) + change;

    if (cart[id] <= 0) {
        delete cart[id];
    }

    saveCart();
    displayCart();
}

// DEMO ORDER

document.getElementById("checkoutBtn").addEventListener("click", function() {
    if (Object.keys(cart).length === 0) {
        alert("Please add food to your cart first.");
        return;
    }

    cart = {};
    saveCart();
    displayCart();
    cartModal.hide();

    alert("Demo order placed successfully! No payment was taken.");
});

// SET MINIMUM BOOKING DATE

const bookingDate = document.getElementById("bookingDate");
const today = new Date();

bookingDate.min =
    today.getFullYear() + "-" +
    String(today.getMonth() + 1).padStart(2, "0") + "-" +
    String(today.getDate()).padStart(2, "0");

// GET SAVED BOOKINGS

function getBookings() {
    return JSON.parse(localStorage.getItem("sgBookings") || "[]");
}

// DISPLAY BOOKINGS

function displayBookings() {
    const bookings = getBookings();
    const bookingList = document.getElementById("bookingList");

    bookingList.innerHTML = "";

    if (bookings.length === 0) {
        bookingList.textContent = "No bookings yet.";
        return;
    }

    bookings.forEach(function(booking) {
        bookingList.innerHTML += `
            <div class="booking-record">
                <div>
                    <strong>${booking.name}</strong>
                    <small>${booking.date} • ${booking.time}</small>
                    <small>${booking.guests} guest(s) • ${booking.occasion}</small>
                    <small>Booking ID: ${booking.id}</small>
                </div>

                <button class="btn btn-outline-danger btn-sm"
                        onclick="deleteBooking('${booking.id}')">
                    Delete
                </button>
            </div>`;
    });
}

// BOOK TABLE

document.getElementById("bookingForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const phone = document.getElementById("guestPhone").value.trim();

    if (!/^[0-9]{10}$/.test(phone)) {
        document.getElementById("bookingMessage").textContent =
            "Enter a valid 10-digit phone number.";
        return;
    }

    const booking = {
        id: "SG" + Date.now().toString().slice(-6),
        name: document.getElementById("guestName").value.trim(),
        phone: phone,
        date: bookingDate.value,
        time: document.getElementById("bookingTime").value,
        guests: document.getElementById("guests").value,
        occasion: document.getElementById("occasion").value,
        request: document.getElementById("specialRequest").value.trim()
    };

    const bookings = getBookings();

    bookings.unshift(booking);

    localStorage.setItem("sgBookings", JSON.stringify(bookings));

    displayBookings();
    this.reset();

    document.getElementById("bookingMessage").textContent =
        "Demo booking saved successfully!";
});

// DELETE ONE BOOKING

function deleteBooking(id) {
    const bookings = getBookings().filter(function(booking) {
        return booking.id !== id;
    });

    localStorage.setItem("sgBookings", JSON.stringify(bookings));
    displayBookings();
}

// CLEAR ALL BOOKINGS

document.getElementById("clearBookings").addEventListener("click", function() {
    if (confirm("Do you want to clear all bookings?")) {
        localStorage.removeItem("sgBookings");
        displayBookings();

        document.getElementById("bookingMessage").textContent =
            "All bookings cleared.";
    }
});

// GOOGLE MAPS DIRECTIONS

document.getElementById("directionsBtn").addEventListener("click", function() {
    const message = document.getElementById("locationMessage");

    if (!navigator.geolocation) {
        message.textContent = "Location is not supported by this browser.";
        return;
    }

    message.textContent = "Getting your location...";

    navigator.geolocation.getCurrentPosition(
        function(position) {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            const destination = encodeURIComponent(
                "FC Road, Pune, Maharashtra, India"
            );

            const url =
                "https://www.google.com/maps/dir/?api=1" +
                "&origin=" + latitude + "," + longitude +
                "&destination=" + destination +
                "&travelmode=driving";

            message.textContent =
                "Google Maps opened. Check the route and estimated travel time there.";

            window.open(url, "_blank", "noopener");
        },

        function() {
            message.textContent =
                "Location unavailable. Please allow location permission or use View Map.";
        }
    );
});

// CUSTOMER FEEDBACK

document.getElementById("feedbackForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const name = document.getElementById("feedbackName").value.trim();
    const rating = document.getElementById("rating").value;
    const feedback = document.getElementById("feedbackText").value.trim();

    const allFeedback = JSON.parse(
        localStorage.getItem("sgFeedback") || "[]"
    );

    allFeedback.push({
        name: name,
        rating: rating,
        feedback: feedback
    });

    localStorage.setItem("sgFeedback", JSON.stringify(allFeedback));

    document.getElementById("feedbackMessage").textContent =
        "Thank you for your feedback!";

    this.reset();
});

// INITIALIZE WEBSITE

displayMenu();
saveCart();
displayBookings();
