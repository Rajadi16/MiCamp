# MiCamp Admin Panel Setup Guide

## 🎉 Admin Panel Successfully Created!

A complete admin interface has been added to MiCamp with full management controls for all features.

---

## 📁 Files Created

### Admin Pages (pages/admin/)
- ✅ `admin-login.html` - Admin authentication portal
- ✅ `admin-dashboard.html` - Overview dashboard with analytics
- ✅ `admin-users.html` - User management
- ✅ `admin-lost-found.html` - Lost & Found item management
- ✅ `admin-sos.html` - Emergency SOS alerts viewer
- ✅ `admin-rides.html` - Ride pool management
- ✅ `admin-peer-help.html` - Peer help moderation
- ✅ `admin-canteen.html` - Canteen orders & menu management
- ✅ `admin-campus-map.html` - **Campus map with Google Maps integration**

### Admin Assets
- ✅ `css/admin.css` - Admin panel styling
- ✅ `js/admin-auth.js` - Admin authentication system

---

## 🔐 Admin Login Credentials

**Access URL:** `pages/admin/admin-login.html`

**Default Credentials:**
- **Email:** `admin@rnsit.ac.in`
- **Password:** `admin@micamp2024`

⚠️ **IMPORTANT:** Change these credentials before deploying to production!

---

## 🗺️ Google Maps Setup (REQUIRED)

The Campus Map feature requires a Google Maps API key.

### Step 1: Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Maps JavaScript API**
4. Go to **Credentials** → **Create Credentials** → **API Key**
5. Copy your API key

### Step 2: Add API Key to Campus Map

Open `pages/admin/admin-campus-map.html` and find this line at the bottom:

```html
<script async defer src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap"></script>
```

Replace `YOUR_API_KEY` with your actual Google Maps API key:

```html
<script async defer src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBXXXXXXXXXXXXXXXXXXXXX&callback=initMap"></script>
```

### Default Campus Location
The map is centered on **RNS Institute of Technology**:
- **Latitude:** 13.0152
- **Longitude:** 77.5683

---

## 🎯 Admin Features Overview

### 1. **Dashboard** 📊
- Real-time statistics for all features
- User count, active items, alerts
- Recent activity feed
- Quick action buttons

### 2. **User Management** 👥
- View all registered students
- Filter by department
- Search by name, USN, or email
- Delete user accounts

### 3. **Lost & Found Management** 🎒
- View all lost and found items
- Filter by category and status
- Mark items as claimed
- Delete old/resolved items
- View detailed item information

### 4. **SOS Emergency Alerts** 🚨
- **Real-time alert monitoring**
- View student location on Google Maps
- Acknowledge and resolve alerts
- Direct call links to students
- Admin notes for each alert
- Auto-refresh every 30 seconds

### 5. **Campus Map Management** 🗺️ ⭐ **PREMIUM FEATURE**
- **Interactive Google Maps integration**
- **Click to add new locations** on campus
- Categorize locations (Academic, Department, Amenity, Sports, etc.)
- **Drag markers** to adjust position
- Color-coded markers by category
- Satellite/Road view toggle
- Export locations as JSON
- Pre-loaded with RNSIT campus locations

### 6. **Ride Pool Management** 🚗
- View all ride offers
- Filter by status (active/completed/cancelled)
- Delete expired rides
- Monitor ride sharing activity

### 7. **Peer Help Moderation** 🤝
- View all academic questions
- Filter by subject
- Delete spam/inappropriate content
- Monitor answer activity

### 8. **Canteen Management** 🍔
- View all orders in real-time
- Track today's revenue
- Mark orders as completed
- Menu items management

---

## 🚀 How to Use Admin Panel

### Access the Admin Panel

1. Open `pages/admin/admin-login.html` in your browser
2. Login with credentials:
   - Email: `admin@rnsit.ac.in`
   - Password: `admin@micamp2024`
3. You'll be redirected to the admin dashboard

### Adding Campus Locations (Map Feature)

1. Go to **Campus Map** in sidebar
2. Click **"Add New Location"** button
3. Click anywhere on the map to place a marker
4. Fill in location details:
   - Name (e.g., "Main Block")
   - Category (Academic, Department, etc.)
   - Description
5. Drag the marker to fine-tune position
6. Click **"Save Location"**

The location will be:
- Saved to localStorage
- Displayed with color-coded marker
- Available to all students viewing the campus map

### Managing SOS Alerts

1. Go to **SOS Alerts** in sidebar
2. View all emergency alerts (auto-refreshes every 30 seconds)
3. Click **"View"** to see:
   - Student details
   - Contact number (click to call)
   - **Location on Google Maps**
   - Time of alert
4. Click **"Acknowledge"** to mark as seen
5. Click **"Resolve"** when emergency is handled

### Managing Lost & Found

1. Go to **Lost & Found** in sidebar
2. Use filters to find specific items
3. Click **"View"** for full details
4. Click **"Claimed"** when item is returned
5. Click **"Delete"** to remove old items

---

## 🎨 Admin Panel Features

### Responsive Design
- Works on desktop, tablet, and mobile
- Collapsible sidebar on mobile
- Touch-friendly buttons

### Real-time Updates
- Data stored in localStorage
- Auto-refresh on SOS alerts page
- Instant updates across all pages

### Security Features
- Session-based authentication
- Protected routes (auto-redirect if not logged in)
- Admin role verification

### UI/UX Features
- Dark mode theme
- Gradient accents (purple-pink)
- Toast notifications
- Modal dialogs
- Data tables with search/filter
- Stats cards with icons
- Badge indicators
- Empty states

---

## 📊 Data Structure

All data is stored in localStorage with these keys:

```javascript
micamp_admin              // Admin session
micamp_users              // Registered students
micamp_lost_found         // Lost & found items
micamp_sos_alerts         // Emergency alerts
micamp_rides              // Ride pool offers
micamp_questions          // Peer help questions
micamp_orders             // Canteen orders
micamp_campus_locations   // Campus map locations
```

---

## 🔒 Security Notes

### Before Production:

1. **Change admin credentials** in `js/admin-auth.js`
2. **Add backend authentication** - Don't rely on localStorage only
3. **Implement password hashing** (bcrypt)
4. **Add HTTPS** for secure connections
5. **Rate limiting** on login attempts
6. **Session timeouts**
7. **Restrict Google Maps API key** to your domain

---

## 🌐 Integration with Main App

### Linking Admin Panel from Main Site

Add this link to your main navigation:

```html
<a href="pages/admin/admin-login.html" style="color: #6366f1;">Admin</a>
```

### User-Facing Campus Map

To show the campus map to students, update `pages/campus-map.html` with the Google Maps integration from the admin version.

---

## 📱 Mobile Responsiveness

All admin pages are fully responsive:
- ✅ Touch-friendly buttons
- ✅ Collapsible sidebar
- ✅ Responsive tables
- ✅ Mobile-optimized forms
- ✅ Swipeable modals

---

## 🎯 Next Steps

### Required Before Deployment:

1. ✅ **Get Google Maps API Key** and add to campus map
2. ⚠️ **Change admin credentials**
3. ⚠️ **Add backend API** (Node.js + PostgreSQL recommended)
4. ⚠️ **Implement real database** instead of localStorage
5. ⚠️ **Add user authentication** with JWT tokens
6. ⚠️ **Deploy to production** (Vercel for frontend)

### Optional Enhancements:

- Add email notifications for SOS alerts
- Export data as CSV/PDF
- Add charts and graphs to dashboard
- Push notifications for emergency alerts
- Image upload for lost & found items
- Real-time chat support

---

## 🆘 Troubleshooting

### Map Not Loading?
- Check if Google Maps API key is added
- Verify Maps JavaScript API is enabled in Google Cloud
- Check browser console for errors

### Can't Login?
- Verify you're using correct credentials
- Clear localStorage and try again
- Check browser console for errors

### Data Not Saving?
- Check if localStorage is enabled in browser
- Verify you're not in incognito mode
- Check localStorage size limits

---

## 📞 Support

For issues or questions:
1. Check browser console for errors
2. Verify all files are uploaded correctly
3. Ensure Google Maps API key is configured

---

## 🎉 You're All Set!

Your MiCamp admin panel is ready to use!

**Start by:**
1. Getting a Google Maps API key
2. Logging into the admin panel
3. Adding campus locations on the map
4. Exploring all admin features

**Happy Managing! 🚀**
