// Canteen Page JavaScript

let cart = [];

// Category filter functionality
document.addEventListener('DOMContentLoaded', () => {
    const categoryTabs = document.querySelectorAll('.category-tab');
    const menuItems = document.querySelectorAll('.menu-item');

    categoryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const category = tab.getAttribute('data-category');

            // Update active tab
            categoryTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Filter items
            menuItems.forEach(item => {
                if (category === 'all' || item.getAttribute('data-category') === category) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
});

// Add to cart function
function addToCart(itemName, price) {
    const existingItem = cart.find(item => item.name === itemName);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            name: itemName,
            price: price,
            quantity: 1
        });
    }

    updateCartDisplay();
    showNotification(`${itemName} added to cart!`, 'success');
}

// Update cart display
function updateCartDisplay() {
    const cartCount = document.getElementById('cartCount');
    const cartTotal = document.getElementById('cartTotal');

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    cartCount.textContent = totalItems;
    cartTotal.textContent = totalPrice;

    // Update modal
    updateCartModal();
}

// Update cart modal
function updateCartModal() {
    const cartItemsDiv = document.getElementById('cartItems');
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const gst = (subtotal * 0.05).toFixed(0);
    const total = subtotal + parseInt(gst);

    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
    } else {
        cartItemsDiv.innerHTML = cart.map((item, index) => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>₹${item.price} each</p>
                </div>
                <div class="cart-item-controls">
                    <button class="qty-btn" onclick="decreaseQuantity(${index})">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" onclick="increaseQuantity(${index})">+</button>
                    <span style="margin-left: 1rem; font-weight: 600;">₹${item.price * item.quantity}</span>
                </div>
            </div>
        `).join('');
    }

    document.getElementById('modalSubtotal').textContent = subtotal;
    document.getElementById('modalGst').textContent = gst;
    document.getElementById('modalTotal').textContent = total;
}

// Increase quantity
function increaseQuantity(index) {
    cart[index].quantity++;
    updateCartDisplay();
}

// Decrease quantity
function decreaseQuantity(index) {
    if (cart[index].quantity > 1) {
        cart[index].quantity--;
    } else {
        cart.splice(index, 1);
    }
    updateCartDisplay();
}

// Checkout function
function checkout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    const pickupTime = document.querySelector('.pickup-time-input').value;

    if (!pickupTime) {
        alert('Please enter pickup time');
        return;
    }

    // Simulate order placement
    const orderDetails = {
        items: cart,
        pickupTime: pickupTime,
        total: document.getElementById('modalTotal').textContent,
        orderTime: new Date().toLocaleString()
    };

    console.log('Order placed:', orderDetails);

    alert(`Order placed successfully! \\n\\nTotal: ₹${orderDetails.total}\\nPickup Time: ${pickupTime}\\n\\nYou will receive a notification when your order is ready.`);

    // Clear cart
    cart = [];
    updateCartDisplay();
    document.getElementById('cartModal').style.display = 'none';
    document.querySelector('.pickup-time-input').value = '';
    document.querySelector('.special-instructions').value = '';
}

// Notification function
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? 'var(--success-color)' : 'var(--danger-color)'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        z-index: 10000;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}
