// Authentication JavaScript

// Login Form Handler
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Simple validation (In production, this would connect to backend API)
        if (email && password) {
            // Simulate login
            const user = {
                email: email,
                name: email.split('@')[0],
                loginTime: new Date().toISOString()
            };

            localStorage.setItem('micamp_user', JSON.stringify(user));

            // Show success message
            showMessage('Login successful! Redirecting...', 'success');

            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } else {
            showMessage('Please fill in all fields', 'error');
        }
    });
}

// Register Form Handler
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const fullname = document.getElementById('fullname').value;
        const usn = document.getElementById('usn').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const department = document.getElementById('department').value;
        const year = document.getElementById('year').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const terms = document.querySelector('input[name="terms"]').checked;

        // Validation
        if (!fullname || !usn || !email || !phone || !department || !year || !password || !confirmPassword) {
            showMessage('Please fill in all required fields', 'error');
            return;
        }

        if (password !== confirmPassword) {
            showMessage('Passwords do not match', 'error');
            return;
        }

        if (password.length < 6) {
            showMessage('Password must be at least 6 characters', 'error');
            return;
        }

        if (!terms) {
            showMessage('Please agree to terms and conditions', 'error');
            return;
        }

        // Simulate registration
        const user = {
            fullname,
            usn,
            email,
            phone,
            department,
            year,
            registeredAt: new Date().toISOString()
        };

        localStorage.setItem('micamp_user', JSON.stringify(user));

        showMessage('Registration successful! Redirecting to login...', 'success');

        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
    });
}

// Show message function
function showMessage(message, type) {
    // Remove existing messages
    const existingMsg = document.querySelector('.form-message');
    if (existingMsg) {
        existingMsg.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `form-message ${type}`;
    messageDiv.textContent = message;

    const form = document.querySelector('.auth-form');
    form.insertBefore(messageDiv, form.firstChild);

    // Auto remove after 5 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}
