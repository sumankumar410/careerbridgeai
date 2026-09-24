# 🚀 CareerBridgeAI - Production Deployment & Configuration Guide

Yeh guide CareerBridgeAI ko local environment aur production (Vercel + Render + MongoDB Atlas) par successfully deploy karne ke liye banayi gayi hai.

---

## 📌 1. Email OTP: Real Gmail Inbox me kaise receive karein?

Pehle `.env` me email credentials blank the, isliye real email dispatch nahi ho pa raha tha.

### Option A: Instant Testing (Bina kisi setup ke)
Humne frontend par **Live Verification Banner** aur **"⚡ Click to Auto-fill OTP"** button enable kar diya hai.
- Aap koi bhi email daalenge, screen par hi OTP aa jayega aur ek click me autofill hokar register/login ho jayega.

### Option B: Real Gmail Inbox me OTP mangwane ke liye (1 Minute Setup)
Agar aap chahte hain ki OTP sach me aapke Gmail inbox par aaye:
1. Google Account me jayein: [https://myaccount.google.com/security](https://myaccount.google.com/security)
2. **2-Step Verification** on karein (agar off hai).
3. Search bar me type karein **"App passwords"** ya is link par jayein: [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
4. App name me likhein: `CareerBridgeAI` aur **Create** par click karein.
5. Google aapko ek **16-letter password** dega (jaise `abcd efgh ijkl mnop`).
6. `server/.env` aur root `.env` me yeh fill karein:
   ```env
   EMAIL_SERVICE=gmail
   EMAIL_USER=your_real_email@gmail.com
   EMAIL_PASSWORD=abcd efgh ijkl mnop
   ```
7. Server restart karein (`node server.js`). Ab har OTP seedhe aapke Gmail inbox me deliver hoga!

---

## 📌 2. Database Storage: Data permanently store ho raha hai ya nahi?

### Kya problem thi?
- `.env` me `MONGO_URI` blank tha, jis wajah se backend data ko RAM (temporary memory) me store kar raha tha. Server restart hote hi data gayab ho jata tha.

### Solution implement ho chuka hai:
- Humne backend ko aapke computer par chal rahe **Local MongoDB (`mongodb://127.0.0.1:27017/careerbridgeai`)** se permanently jod diya hai.
- Ab saare:
  - Users (`users`)
  - Student Profiles (`studentprofiles`)
  - Jobs (`jobs`)
  - Job Applications (`applications`)
  - OTPs (`otps`)
  - Placement Drives (`placementdrives`)
  permanent disk par save ho rahe hain.
- **MongoDB Compass** open karein aur `mongodb://localhost:27017` connect karein. Aapko `careerbridgeai` database ke andar saara data live dikhega!

---

## 📌 3. Production Deployment Guide (Vercel + Render)

### Step 1: Free MongoDB Atlas Database (Cloud DB)
1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) par free account banayein.
2. Free M0 Cluster create karein.
3. **Database Access** me jakar ek Database User banayein (username + password note karein).
4. **Network Access** me jakar **Add IP Address** -> **Allow Access from Anywhere (`0.0.0.0/0`)** select karein.
5. **Connect** -> **Drivers** par click karein aur Connection String copy karein:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/careerbridgeai?retryWrites=true&w=majority
   ```

---

### Step 2: Backend Deployment on Render (Free)
1. [Render.com](https://render.com) par login karein.
2. **New +** -> **Web Service** click karein aur apna GitHub repository select karein.
3. Settings configure karein:
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. **Environment Variables** add karein:
   - `PORT`: `5000`
   - `MONGO_URI`: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/careerbridgeai?retryWrites=true&w=majority`
   - `JWT_SECRET`: `careerbridgeai_super_secret_jwt_key_2026_cse_btech`
   - `CLIENT_URL`: `https://your-frontend-domain.vercel.app` (Vercel deploy hone ke baad update karein)
   - `EMAIL_SERVICE`: `gmail`
   - `EMAIL_USER`: `your_email@gmail.com`
   - `EMAIL_PASSWORD`: `your_app_password`
5. **Deploy Web Service** par click karein.
6. Render aapko ek live backend URL dega (jaise `https://careerbridgeai-api.onrender.com`).

---

### Step 3: Frontend Deployment on Vercel (Free)
1. [Vercel.com](https://vercel.com) par login karein.
2. **Add New...** -> **Project** click karein aur repository select karein.
3. Settings configure karein:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. **Environment Variables** add karein:
   - `VITE_API_URL`: `https://careerbridgeai-api.onrender.com` (Render backend URL jo Step 2 me mila)
5. **Deploy** par click karein.
6. Deployment complete hone ke baad Vercel aapko ek URL dega (jaise `https://careerbridgeai.vercel.app`).
7. Render backend ke `CLIENT_URL` me yeh Vercel URL update kar dein.

---

## 📌 4. Key Deployment Features Added
- ✅ **SPA Routing Fix**: `vercel.json` and `_redirects` added taaki deep pages refresh karne par 404 na aaye.
- ✅ **CORS Auto-Handled**: Backend sabhi Vercel aur frontend origins ko securely allow karta hai.
- ✅ **Dynamic API Endpoint**: Frontend local development me `/api` proxy use karega aur Vercel par deployed backend URL.
- ✅ **Auto-Seeded Accounts**: Empty DB aane par demo accounts (`student@careerbridge.com`, `recruiter@careerbridge.com`, password `password123`) automatically create ho jayenge.
- ✅ **Health Check**: `GET /api/health` available for pinging/uptime monitoring.
