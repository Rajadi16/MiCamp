// API Configuration
// For local development: uses localhost:4000
// For production: update MICAMP_API_BASE_URL to your Render backend URL

window.MICAMP_API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:4000'  // Development
  : 'https://your-backend.onrender.com';  // Production - UPDATE THIS after deploying to Render

// After deploying backend to Render, replace 'your-backend.onrender.com'
// with your actual Render URL (e.g., 'micamp-backend.onrender.com')
