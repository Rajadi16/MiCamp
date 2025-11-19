// Admin Authentication System for MiCamp
// Handles admin login, role verification, and session management

// Hardcoded admin credentials (In production, this should be in a secure backend)
const ADMIN_CREDENTIALS = {
    email: 'admin@rnsit.ac.in',
    password: 'admin@micamp2024',
    fullname: 'MiCamp Administrator',
    role: 'admin'
};

// Admin Login Handler
document.addEventListener('DOMContentLoaded', function() {
    const adminLoginForm = document.getElementById('admin-login-form');

    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', handleAdminLogin);
    }

    // Check if admin is already logged in
    checkAdminSession();
});

// Handle Admin Login
function handleAdminLogin(e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    // Validate credentials
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
        // Create admin session
        const adminSession = {
            email: ADMIN_CREDENTIALS.email,
            fullname: ADMIN_CREDENTIALS.fullname,
            role: 'admin',
            loginTime: new Date().toISOString()
        };

        // Store in localStorage
        localStorage.setItem('micamp_admin', JSON.stringify(adminSession));

        // Show success message
        showNotification('Admin login successful! Redirecting...', 'success');

        // Redirect to admin dashboard
        setTimeout(() => {
            window.location.href = 'admin-dashboard.html';
        }, 1000);
    } else {
        showNotification('Invalid admin credentials. Access denied.', 'error');
    }
}

// Check if admin is logged in
function checkAdminSession() {
    const adminData = localStorage.getItem('micamp_admin');

    // If on admin page but not logged in, redirect to login
    const isAdminPage = window.location.pathname.includes('/admin/') &&
                       !window.location.pathname.includes('admin-login.html');

    if (isAdminPage && !adminData) {
        window.location.href = 'admin-login.html';
        return false;
    }

    return adminData ? JSON.parse(adminData) : null;
}

// Get current admin session
function getAdminSession() {
    const adminData = localStorage.getItem('micamp_admin');
    return adminData ? JSON.parse(adminData) : null;
}

// Admin Logout
function adminLogout() {
    localStorage.removeItem('micamp_admin');
    showNotification('Logged out successfully', 'success');
    setTimeout(() => {
        window.location.href = 'admin-login.html';
    }, 1000);
}

// Check if user has admin role
function isAdmin() {
    const admin = getAdminSession();
    return admin && admin.role === 'admin';
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Update admin navbar with username
function updateAdminNavbar() {
    const admin = getAdminSession();
    if (admin) {
        const adminNameElement = document.getElementById('admin-name');
        if (adminNameElement) {
            adminNameElement.textContent = admin.fullname;
        }
    }
}
