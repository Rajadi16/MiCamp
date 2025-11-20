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

### Backend
- Node.js + Express
- TypeScript
- RESTful APIs + Server-Sent Events for live updates
- In-memory storage (switchable to DB later)

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
│   ├── sos.js             # SOS functionality
│   └── campus-map.js      # Live campus map + tracking
├── backend/                # Node.js + Express backend
│   ├── src/               # TypeScript source
│   ├── env.example        # Sample environment variables
│   └── package.json
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

### Prerequisites
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **Python** (v3.7 or higher) - [Download here](https://python.org/)

### Quick Start - Easiest Method! 🎯

#### Option 1: Start Everything with One Command
**Windows:**
```bash
start-all.bat
```
This automatically starts both backend and frontend servers!

#### Option 2: Start Separately
**Terminal 1 - Start Backend:**
```bash
start-backend.bat
# Or manually:
cd backend
npm install
npm run dev
```

**Terminal 2 - Start Frontend:**
```bash
start-frontend.bat
# Or manually:
python -m http.server 8080
```

Then open: **http://localhost:8080** in your browser

### Manual Setup (Step-by-Step)

#### 1️⃣ Backend Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment variables:**
   - Copy `env.example` to `.env`
   - The default `.env` is already configured for local development
   ```env
   PORT=4000
   CLIENT_ORIGIN=http://localhost:8080
   CAMPUS_CENTER_LAT=12.923492
   CAMPUS_CENTER_LNG=77.499733
   ```

3. **Start the backend server:**
   ```bash
   npm run dev          # Development mode (auto-restart on changes)
   # OR
   npm run build        # Build for production
   npm start            # Run production build
   ```

   Backend will run on: **http://localhost:4000**

#### 2️⃣ Frontend Setup

**Option A: Using Python (Recommended)**
```bash
cd MiCamp
python -m http.server 8080
```

**Option B: Using Node.js**
```bash
npm install -g http-server
cd MiCamp
http-server -p 8080
```

**Option C: VS Code Live Server**
1. Install "Live Server" extension
2. Right-click `index.html`
3. Click "Open with Live Server"

Frontend will run on: **http://localhost:8080**

### 🔗 API Configuration

The frontend automatically connects to the backend via [js/config.js](js/config.js):
- **Development:** Uses `http://localhost:4000`
- **Production:** Uses your deployed backend URL (update after deployment)

To change the backend URL, edit [js/config.js](js/config.js):
```javascript
window.MICAMP_API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:4000'                          // Local development
  : 'https://your-backend.onrender.com';             // Production
```

### 📡 Available API Endpoints

- `GET /health` - Health check endpoint
- `GET /api/map/locations` - Get all campus locations
- `POST /api/map/admin/locations` - Add new location (admin)
- `GET /api/rides/nearby` - Get nearby rides
- `POST /api/rides` - Create new ride
- `POST /api/live-location` - Update live location
- `GET /api/live-location/stream` - SSE stream for live updates

## 🌐 Deployment

### 🚀 Recommended: Render (Backend) + Vercel (Frontend)

This is the **easiest and FREE** way to deploy your full-stack application!

#### Backend Deployment on Render

1. **Push your code to GitHub**
2. **Sign up at [render.com](https://render.com)** with GitHub
3. **Create a new Web Service**
4. **Connect your MiCamp repository**
5. **Configure:**
   - Build Command: `cd backend && npm install && npm run build`
   - Start Command: `cd backend && npm start`
   - Add environment variables (see [RENDER_QUICK_START.md](RENDER_QUICK_START.md))
6. **Deploy!** Your backend will be live at `https://your-app.onrender.com`

📖 **Detailed Guide:** See [RENDER_QUICK_START.md](RENDER_QUICK_START.md)

#### Frontend Deployment on Vercel

1. **Sign up at [vercel.com](https://vercel.com)** with GitHub
2. **Import your MiCamp repository**
3. **Deploy!** Your frontend will be live at `https://your-app.vercel.app`
4. **Update API URL:** Edit [js/config.js](js/config.js) with your Render backend URL

📖 **Complete Deployment Guide:** See [DEPLOYMENT.md](DEPLOYMENT.md)

### Alternative Hosting Options

#### GitHub Pages (Frontend Only - Free)

1. Push code to GitHub repository
2. Go to Settings > Pages
3. Select branch (main) and root folder
4. Live at: `https://username.github.io/micamp/`

⚠️ Note: GitHub Pages only hosts static files (frontend). You'll need separate backend hosting.

#### Netlify (Frontend Only - Free)

1. Go to [netlify.com](https://netlify.com)
2. Drag & drop MiCamp folder or connect GitHub
3. Instant deployment with custom domain
4. Free SSL certificate included

#### College Server (Apache/cPanel)

**For Apache Server:**
```bash
# Upload via FTP/SFTP to:
/var/www/html/micamp/

# Set permissions:
chmod -R 755 /var/www/html/micamp
```

**For cPanel:**
1. Login to cPanel
2. File Manager → `public_html`
3. Upload MiCamp folder
4. Access at: `http://yourdomain.ac.in/micamp/`

⚠️ Backend requires Node.js support on the server.

## 📋 Deployment Checklist

### Backend (Render)
- [ ] Backend deployed to Render
- [ ] Environment variables configured
- [ ] Backend health check passing (`/health`)
- [ ] Note your backend URL

### Frontend (Vercel)
- [ ] Update [js/config.js](js/config.js) with production backend URL
- [ ] Frontend deployed to Vercel
- [ ] All pages loading correctly
- [ ] Test all features (map, rides, canteen, etc.)

### Final Steps
- [ ] Update `CLIENT_ORIGIN` in Render with Vercel URL
- [ ] Test API calls from frontend
- [ ] Check mobile responsiveness
- [ ] Verify all features work in production
- [ ] Update contact information if needed

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
- Persistent storage for live location history

---

Built with ❤️ for RNSIT Community
