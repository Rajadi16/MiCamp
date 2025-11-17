# MiCamp - Smart Campus Utility Portal

**Where Campus Meets Technology**

MiCamp is an integrated smart campus portal designed for RNSIT (RNS Institute of Technology) that combines multiple essential services into one platform.

## 🎯 Features

- 🗺️ **Campus Map + Navigation** - Find classrooms, labs, and facilities easily
- 🎒 **Lost & Found System** - Post and search for lost items with photo matching
- 🚗 **Ride/Vehicle Pool** - Share rides with classmates
- 🍔 **Canteen Menu + Pre-Order** - View menu, pre-order food, skip queues
- 🤝 **Peer Help / Mentor System** - Get academic help from seniors and teachers
- 🚨 **Emergency SOS** - One-tap emergency alerts with live location

## 🛠️ Tech Stack

### Frontend
- HTML5, CSS3, JavaScript (Vanilla)
- Modern responsive design
- No build tools required
- Works on any web server

### Future Backend (Coming Soon)
- Node.js + Express
- PostgreSQL database
- RESTful API
- Real-time features with Socket.io

## 📁 Project Structure

```
MiCamp/
├── index.html              # Homepage
├── css/                    # All stylesheets
│   ├── style.css          # Main styles
│   ├── auth.css           # Authentication pages
│   ├── features.css       # Feature pages
│   ├── canteen.css        # Canteen page
│   └── sos.css            # SOS page
├── js/                     # All JavaScript
│   ├── main.js            # Main functionality
│   ├── auth.js            # Authentication
│   ├── canteen.js         # Canteen functionality
│   └── sos.js             # SOS functionality
├── pages/                  # All website pages
│   ├── login.html
│   ├── register.html
│   ├── campus-map.html
│   ├── lost-found.html
│   ├── canteen.html
│   ├── ride-pool.html
│   ├── peer-help.html
│   └── sos.html
└── README.md
```

## 🚀 Getting Started

### Quick Start (Local Testing)

#### Option 1: Using Python (Recommended)
```bash
# Navigate to project directory
cd MiCamp

# Start a simple HTTP server
python -m http.server 8000
```
Then open: http://localhost:8000

#### Option 2: Using Node.js
```bash
# Install http-server globally
npm install -g http-server

# Navigate to project
cd MiCamp

# Start server
http-server -p 8000
```
Then open: http://localhost:8000

#### Option 3: VS Code Live Server
1. Install "Live Server" extension
2. Right-click `index.html`
3. Click "Open with Live Server"

## 🌐 Hosting on College Website

### For Apache Server (Most Common)

1. **Upload to server:**
```bash
# Using FTP/SFTP, upload all files to:
/var/www/html/micamp/
# or
/public_html/micamp/
```

2. **Set correct permissions:**
```bash
chmod -R 755 /var/www/html/micamp
```

3. **Access website:**
```
http://your-college.ac.in/micamp/
```

### For cPanel Hosting

1. Login to cPanel
2. Open File Manager
3. Go to `public_html`
4. Upload entire MiCamp folder
5. Access at: `http://yourdomain.ac.in/micamp/`

### GitHub Pages (Free Hosting)

1. Push code to GitHub repository
2. Go to Settings > Pages
3. Select branch (main) and root folder
4. Live at: `https://username.github.io/micamp/`

### Netlify (Easiest - Recommended)

1. Go to [netlify.com](https://netlify.com)
2. Drag & drop MiCamp folder
3. Instant deployment with custom domain
4. Free SSL certificate included

## 📋 Deployment Checklist

✅ Upload all HTML files
✅ Upload `css/` folder with all stylesheets
✅ Upload `js/` folder with all scripts
✅ Upload `pages/` folder
✅ Verify `index.html` is in root
✅ Test all page links
✅ Check mobile responsiveness
✅ Test all features
✅ Update contact information

## 👥 Team

- Shashikanth Gidaganti (1RN23CS258)
- Pranathi D (1RN23CS145)
- Neethu B Krishna (1RN23CS131)
- Rajput Aditya Singh (1RN23CS163)

## 📝 License

MIT License - See LICENSE file for details

## 🔮 Future Enhancements

- AI chat assistant for student queries
- Payment system integration (UPI, cards)
- Mobile app with push notifications
- Face recognition security for SOS
- Advanced analytics dashboard

---

Built with ❤️ for RNSIT Community
