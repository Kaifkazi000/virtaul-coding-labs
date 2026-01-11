# Quick Start Guide - Run Backend & Frontend

## 🚀 Step 1: Setup Environment Variables

Create a `.env` file in the `backend` folder:

```bash
cd backend
```

Create `.env` file with your Supabase credentials:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**How to get these:**
1. Go to your Supabase project dashboard
2. Click on "Settings" → "API"
3. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **service_role key** (not anon key) → `SUPABASE_SERVICE_ROLE_KEY`

---

## 🔧 Step 2: Install Dependencies

### Backend:
```bash
cd backend
npm install
```

### Frontend:
```bash
cd frontend/my-app
npm install
```

---

## ▶️ Step 3: Run Backend

Open a terminal in the `backend` folder:

```bash
cd backend
npm start
```

You should see:
```
Backend running on http://localhost:5000
```

**Keep this terminal open!**

---

## ▶️ Step 4: Run Frontend

Open a **NEW terminal** in the `frontend/my-app` folder:

```bash
cd frontend/my-app
npm run dev
```

You should see:
```
- ready started server on 0.0.0.0:3000
- Local: http://localhost:3000
```

**Keep this terminal open too!**

---

## 🌐 Step 5: Access the Application

Open your browser and go to:
```
http://localhost:3000
```

---

## ✅ Step 6: Quick Test Flow

### Test Teacher Flow:

1. **Create Teacher Account** (if not exists):
   - Go to Supabase Dashboard → Authentication → Users
   - Create a new user with email/password
   - Note: This user will be a teacher

2. **Login as Teacher**:
   - Go to `http://localhost:3000/auth/teacher`
   - Login with teacher credentials

3. **Create Subject Instance**:
   - Click "Add Subject"
   - Fill in:
     - Subject Name: "Java"
     - Subject Code: "JAVA"
     - Semester: 3
   - Click "Create"

4. **Add Practical**:
   - Click on the subject you created
   - Select PR-1
   - Fill in practical details
   - Click "Save PR-1"

5. **View Submissions** (after students submit):
   - Click "Review Submissions" tab
   - See all student submissions

### Test Student Flow:

1. **Create Student Account**:
   - Go to `http://localhost:3000/auth/student`
   - Click "Sign Up" (if available) or create via Supabase Dashboard
   - Make sure student has `semester` field set in `studentss` table

2. **Login as Student**:
   - Login with student credentials

3. **View Subjects**:
   - Should see subjects matching your semester
   - Click on a subject

4. **Open Practical**:
   - PR-1 should be unlocked
   - Click on PR-1

5. **Write & Execute Code**:
   - Write code in the editor
   - Click "Execute Code"
   - Should see execution result

6. **Submit Code**:
   - After successful execution, "Submit" button becomes enabled
   - Click "Submit"
   - Status should show "Pending"

7. **Check Status**:
   - Go back to practicals list
   - Should see status badge (Pending/Approved/Rejected)

---

## 🐛 Troubleshooting

### Backend Issues:

**Error: "Cannot find module"**
```bash
cd backend
npm install
```

**Error: "SUPABASE_URL is not defined"**
- Make sure `.env` file exists in `backend` folder
- Check `.env` file has correct variable names

**Port 5000 already in use:**
- Change port in `backend/index.js`:
  ```javascript
  app.listen(5001, () => {
    console.log("Backend running on http://localhost:5001");
  });
  ```
- Update frontend API calls to use port 5001

### Frontend Issues:

**Error: "Cannot find module"**
```bash
cd frontend/my-app
npm install
```

**CORS Error:**
- Make sure backend is running
- Check backend CORS config allows `http://localhost:3000`

**401 Unauthorized:**
- Check if token is stored in localStorage
- Open browser DevTools → Application → Local Storage
- Should see `student_token` or `teacher_token`

**No subjects showing:**
- Check student's `semester` in database matches subject instance `semester`
- Check `subject_instances.is_active = true`

---

## 📋 Testing Checklist

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can access `http://localhost:3000`
- [ ] Teacher can login
- [ ] Teacher can create subject instance
- [ ] Teacher can add practical
- [ ] Student can login
- [ ] Student sees subjects (matching semester)
- [ ] Student can open practical
- [ ] Student can execute code
- [ ] Student can submit code
- [ ] Teacher can see submissions
- [ ] Teacher can approve/reject
- [ ] Student sees updated status
- [ ] Next practical unlocks after approval

---

## 🎯 Common Issues & Solutions

### Issue: Student sees no subjects
**Solution:**
- Check `studentss.semester` matches `subject_instances.semester`
- Check `subject_instances.is_active = true`
- Check student is logged in with valid token

### Issue: Practicals not unlocking
**Solution:**
- Check previous practical has `submission_status = 'approved'`
- Check submission exists in `submissions` table
- Refresh the page

### Issue: Code execution fails
**Solution:**
- This is mock execution - it checks for basic keywords
- For Python: code should contain `print(`, `def `, or `import `
- For Java: code should contain `public class` or `System.out.println`
- For SQL: code should contain `SELECT` or `INSERT`

### Issue: Submission not showing for teacher
**Solution:**
- Check `subject_instance_id` matches
- Check teacher owns the subject instance
- Check submission exists in database

---

## 📞 Need Help?

1. Check browser console (F12) for errors
2. Check backend terminal for errors
3. Check network tab in DevTools for API calls
4. Verify database tables exist:
   - `studentss`
   - `subject_instances`
   - `practicals`
   - `submissions`

---

## 🎉 You're Ready!

Once both servers are running:
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:3000`

Start testing the complete flow! 🚀

