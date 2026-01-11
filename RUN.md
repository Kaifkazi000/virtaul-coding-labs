# 🚀 How to Run Backend & Frontend

## Prerequisites

1. **Node.js** installed (v16 or higher)
2. **Supabase** project set up with database schema
3. **Environment variables** configured

---

## ⚙️ Step 1: Setup Environment Variables

### Create `.env` file in `backend` folder:

**Windows (PowerShell):**
```powershell
cd backend
New-Item -Path .env -ItemType File
```

**Or manually create `backend/.env` with:**
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Get your Supabase credentials:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Settings → API
4. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **service_role** key (scroll down, NOT the anon key) → `SUPABASE_SERVICE_ROLE_KEY`

---

## 📦 Step 2: Install Dependencies

### Backend:
```powershell
cd backend
npm install
```

### Frontend:
```powershell
cd frontend\my-app
npm install
```

---

## ▶️ Step 3: Run Backend Server

**Open Terminal 1:**
```powershell
cd backend
npm start
```

**Expected output:**
```
Backend running on http://localhost:5000
```

✅ **Keep this terminal open!**

---

## ▶️ Step 4: Run Frontend Server

**Open Terminal 2 (NEW terminal):**
```powershell
cd frontend\my-app
npm run dev
```

**Expected output:**
```
- ready started server on 0.0.0.0:3000
- Local: http://localhost:3000
```

✅ **Keep this terminal open too!**

---

## 🌐 Step 5: Open Application

Open your browser and go to:
```
http://localhost:3000
```

---

## ✅ Quick Test

### 1. Test Backend is Running:
Open browser and go to:
```
http://localhost:5000
```
(Should show nothing or error - that's OK, backend is running)

### 2. Test Frontend:
Go to:
```
http://localhost:3000
```
Should see the home page.

### 3. Test Teacher Login:
- Go to: `http://localhost:3000/auth/teacher`
- Login with teacher credentials
- Should see teacher dashboard

### 4. Test Student Login:
- Go to: `http://localhost:3000/auth/student`
- Login with student credentials
- Should see student dashboard with subjects

---

## 🐛 Troubleshooting

### Backend won't start:

**Error: "SUPABASE_URL is not defined"**
- Check `.env` file exists in `backend` folder
- Check variable names are exactly: `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- No spaces around `=`

**Error: "Cannot find module"**
```powershell
cd backend
npm install
```

**Port 5000 already in use:**
- Change port in `backend/index.js` (line 40) to `5001`
- Update frontend API URLs if needed

### Frontend won't start:

**Error: "Cannot find module"**
```powershell
cd frontend\my-app
npm install
```

**Error: "Port 3000 already in use"**
- Next.js will automatically use port 3001
- Or stop the other process using port 3000

### CORS Errors:
- Make sure backend is running on port 5000
- Check `backend/index.js` CORS config allows `http://localhost:3000`

### 401 Unauthorized:
- Check browser DevTools → Application → Local Storage
- Should see `student_token` or `teacher_token`
- If missing, login again

---

## 📋 Testing Checklist

Once both servers are running:

- [ ] Backend shows "Backend running on http://localhost:5000"
- [ ] Frontend shows "ready started server"
- [ ] Can access http://localhost:3000
- [ ] Teacher can login
- [ ] Student can login
- [ ] Teacher can create subject instance
- [ ] Student sees subjects (matching semester)
- [ ] Student can execute and submit code
- [ ] Teacher can review submissions

---

## 🎯 All Set!

You now have:
- ✅ Backend running on `http://localhost:5000`
- ✅ Frontend running on `http://localhost:3000`

Start testing! 🚀

