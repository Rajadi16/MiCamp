# MiCamp Deployment Guide

## Backend Deployment on Render

### Step 1: Create a Render Account
1. Go to [https://render.com](https://render.com)
2. Sign up using your GitHub account (recommended) or email
3. Verify your email

### Step 2: Connect Your GitHub Repository
1. Push your MiCamp project to GitHub (if not already done)
2. In Render dashboard, click **"New +"** button
3. Select **"Web Service"**
4. Click **"Connect GitHub"** and authorize Render
5. Find and select your **MiCamp** repository

### Step 3: Configure the Backend Service
Render will auto-detect your `render.yaml` file, but if it doesn't, manually configure:

**Basic Settings:**
- **Name:** `micamp-backend` (or any name you prefer)
- **Region:** Singapore (or closest to your users)
- **Branch:** `main`
- **Root Directory:** Leave empty (we handle it in build command)
- **Environment:** `Node`
- **Build Command:** `cd backend && npm install && npm run build`
- **Start Command:** `cd backend && npm start`
- **Plan:** Free

**Environment Variables:**
Click **"Advanced"** and add these environment variables:

| Key | Value |
|-----|-------|
| `PORT` | `10000` |
| `NODE_ENV` | `production` |
| `CLIENT_ORIGIN` | `https://your-vercel-app.vercel.app` (update after frontend deployment) |
| `CAMPUS_CENTER_LAT` | `12.923492` |
| `CAMPUS_CENTER_LNG` | `77.499733` |

### Step 4: Deploy
1. Click **"Create Web Service"**
2. Render will start building and deploying your backend
3. Wait 5-10 minutes for the first deploy
4. Once deployed, you'll get a URL like: `https://micamp-backend.onrender.com`

### Step 5: Update Frontend API URL
After backend is deployed, you need to update your frontend to use the Render backend URL:

1. In your frontend JavaScript files, find API calls like:
   ```javascript
   const API_URL = 'http://localhost:4000';
   ```

2. Change to your Render URL:
   ```javascript
   const API_URL = 'https://micamp-backend.onrender.com';
   ```

3. Update these files:
   - `js/campus-map.js`
   - `js/ridepool.js`
   - `js/ridepool-integration.js`
   - Any other files making API calls

---

## Frontend Deployment on Vercel

### Step 1: Create a Vercel Account
1. Go to [https://vercel.com](https://vercel.com)
2. Sign up using your GitHub account
3. Install Vercel for GitHub

### Step 2: Deploy Frontend
1. Push your code to GitHub
2. In Vercel dashboard, click **"Add New Project"**
3. Import your **MiCamp** repository
4. Configure:
   - **Framework Preset:** Other
   - **Root Directory:** `./` (root)
   - **Build Command:** Leave empty (static site)
   - **Output Directory:** Leave empty
5. Click **"Deploy"**

### Step 3: Update Backend CORS
After frontend is deployed on Vercel:
1. Copy your Vercel URL (e.g., `https://micamp.vercel.app`)
2. Go back to Render dashboard
3. Find your backend service
4. Go to **Environment** tab
5. Update `CLIENT_ORIGIN` to your Vercel URL
6. Click **"Save Changes"**
7. Backend will auto-redeploy

---

## Important Notes

### Free Tier Limitations
- **Render Free Tier:**
  - Backend spins down after 15 minutes of inactivity
  - First request after spin-down takes 30-60 seconds (cold start)
  - 750 hours/month free (enough for one service)

### Cold Start Solution
If you want to keep the backend warm, you can:
1. Use a service like [UptimeRobot](https://uptimerobot.com) to ping your backend every 10 minutes
2. Add this URL to monitor: `https://micamp-backend.onrender.com/health`

### Troubleshooting
- **Build fails:** Check Render logs for errors
- **CORS errors:** Ensure `CLIENT_ORIGIN` matches your Vercel URL exactly
- **API not working:** Check backend logs in Render dashboard

---

## Quick Checklist

- [ ] Backend deployed on Render
- [ ] Frontend deployed on Vercel
- [ ] Updated `CLIENT_ORIGIN` in Render with Vercel URL
- [ ] Updated API URLs in frontend JS files
- [ ] Tested all features in production

---

## Your URLs (Fill these in after deployment)

**Backend URL (Render):** `https://______________________.onrender.com`

**Frontend URL (Vercel):** `https://______________________.vercel.app`
