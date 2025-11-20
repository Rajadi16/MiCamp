# 🚀 Render Deployment - Quick Start

## What is Render?
Render is a cloud platform that makes deploying web apps super easy. It's like Heroku but with a better free tier!

---

## 📋 Prerequisites
- GitHub account
- Your MiCamp project pushed to GitHub
- Render account (free)

---

## 🎯 Step-by-Step Guide

### 1️⃣ Sign Up on Render
1. Go to **https://render.com**
2. Click **"Get Started"**
3. Sign up with **GitHub** (easiest way)
4. Authorize Render to access your GitHub

### 2️⃣ Create a New Web Service
1. Click **"New +"** button (top right)
2. Select **"Web Service"**
3. Click **"Connect GitHub"** if not already connected
4. Find your **"MiCamp"** repository in the list
5. Click **"Connect"**

### 3️⃣ Configure Your Service

**Name:** `micamp-backend` (or any name you like)

**Region:** Choose closest to you:
- Singapore
- Oregon (US West)
- Frankfurt (Europe)

**Branch:** `main`

**Root Directory:** Leave empty

**Runtime:** `Node`

**Build Command:**
```
cd backend && npm install && npm run build
```

**Start Command:**
```
cd backend && npm start
```

**Instance Type:** `Free`

### 4️⃣ Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Add these one by one:

| Key | Value |
|-----|-------|
| `PORT` | `10000` |
| `NODE_ENV` | `production` |
| `CLIENT_ORIGIN` | `http://localhost:5500` (temporary, will update later) |
| `CAMPUS_CENTER_LAT` | `12.923492` |
| `CAMPUS_CENTER_LNG` | `77.499733` |

### 5️⃣ Deploy!
1. Click **"Create Web Service"**
2. Wait 5-10 minutes for first deployment
3. Watch the logs - you'll see:
   - Installing dependencies
   - Building TypeScript
   - Starting server
4. Once done, you'll see "Live" with a green dot ✅

### 6️⃣ Get Your Backend URL
After deployment, copy your URL. It looks like:
```
https://micamp-backend-xxxx.onrender.com
```

---

## 🔧 Update Frontend to Use Render Backend

### Option A: For Testing (Quick)
Open [js/config.js](js/config.js) and replace:
```javascript
: 'https://your-backend.onrender.com';  // Production
```
With your actual Render URL:
```javascript
: 'https://micamp-backend-xxxx.onrender.com';  // Production
```

### Option B: For Production (After Vercel)
1. Deploy frontend to Vercel first
2. Update `CLIENT_ORIGIN` in Render to your Vercel URL
3. Update [js/config.js](js/config.js) with Render backend URL

---

## ✅ Testing Your Backend

Open this URL in your browser (replace with yours):
```
https://micamp-backend-xxxx.onrender.com/health
```

You should see:
```json
{"status":"ok","time":"2025-11-20T..."}
```

---

## ⚠️ Important Notes

### Free Tier Limitations
- **Spins down after 15 minutes** of no traffic
- First request after spin-down takes **30-60 seconds** (cold start)
- **750 hours/month** free (enough for 1 service running 24/7)

### Keeping Backend Warm (Optional)
Use **UptimeRobot** (free) to ping your backend every 10 minutes:
1. Sign up at https://uptimerobot.com
2. Add new monitor
3. Monitor URL: `https://your-backend.onrender.com/health`
4. Interval: 10 minutes

---

## 🐛 Troubleshooting

### Build Failed
- Check **Logs** tab in Render dashboard
- Make sure `backend/package.json` exists
- Verify all dependencies are in package.json

### CORS Errors
- Update `CLIENT_ORIGIN` in Render environment variables
- Must match your frontend URL exactly (with https://)
- Redeploy after changing

### Backend Not Responding
- First request takes 30-60s (cold start on free tier)
- Check if backend is "Live" (green dot)
- View **Logs** for errors

### API Returns 404
- Verify you're using correct URL format:
  - ✅ `https://backend.onrender.com/api/map/locations`
  - ❌ `https://backend.onrender.com/map/locations`

---

## 🎉 Next Steps

1. ✅ Backend deployed on Render
2. ⬜ Deploy frontend to Vercel (see DEPLOYMENT.md)
3. ⬜ Update `CLIENT_ORIGIN` in Render with Vercel URL
4. ⬜ Update `js/config.js` with production URLs
5. ⬜ Test everything in production!

---

## 📝 Your URLs

Fill these in after deployment:

**Backend (Render):**
```
https://___________________________________.onrender.com
```

**Frontend (Vercel):**
```
https://___________________________________.vercel.app
```

---

## 💡 Pro Tips

1. **Monitor your logs** - Render dashboard → Logs tab
2. **Check health endpoint** regularly
3. **Redeploy from dashboard** if anything breaks
4. **Auto-deploy enabled** - pushes to GitHub auto-deploy
5. **Free HTTPS** included automatically!

---

Need help? Check the full [DEPLOYMENT.md](DEPLOYMENT.md) guide!
