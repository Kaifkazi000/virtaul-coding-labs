# Enhanced API Documentation - Virtual Coding Lab

## Base URL
```
http://localhost:5000/api
```

All protected endpoints require:
```
Authorization: Bearer <access_token>
```

---

## 🔐 Authentication APIs (Unchanged)

### Student Login
```
POST /api/auth/student/login
Body: { email, password }
Response: { access_token, student: {...} }
```

### Teacher Login
```
POST /api/auth/teacher/login
Body: { email, password }
Response: { access_token, teacher: {...} }
```

---

## 💻 Code Execution & Auto-Submit APIs

### Execute Code and Auto-Submit
```
POST /api/execution/execute
Headers: Authorization: Bearer <token>
Body: {
  "code": "print('Hello World')",
  "language": "Python",
  "practical_id": "uuid"
}
Response: {
  "execution_status": "success" | "failed" | "timeout" | "error",
  "output": "Hello World",
  "error": null,
  "execution_time_ms": 50,
  "memory_used_kb": 1024,
  "submitted": true,
  "submission_id": "uuid"
}
```
**Behavior:**
- Executes code using Piston API (or custom Docker)
- If execution successful → automatically creates/updates submission
- Returns execution result + submission status

### Check Practical Unlock Status
```
GET /api/execution/unlock-status/:practicalId
Headers: Authorization: Bearer <token>
Response: {
  "is_unlocked": true,
  "reason": "Previous practical completed",
  "pr_no": 2,
  "is_enabled": false
}
```

---

## 📚 Subject Instance APIs (Unchanged)

### Teacher: Create Subject Instance
```
POST /api/subject-instances
Body: { subject_name, subject_code, semester }
```

### Teacher: Get Own Subject Instances
```
GET /api/subject-instances/teacher
```

### Student: Get Auto-Enrolled Subject Instances
```
GET /api/subject-instances/student
```

---

## 📝 Practical APIs (Enhanced)

### Teacher: Add Practical
```
POST /api/practicals
Body: {
  "subject_instance_id": "uuid",
  "pr_no": 1,
  "title": "Loops",
  "description": "...",
  "task": "...",
  "sample_code": "...",
  "theory": "...",
  "language": "Python"
}
```
**Note:** PR-1 is automatically enabled (`is_enabled = true`)

### Teacher: Enable/Disable Practical (Batch Unlock)
```
PATCH /api/practicals/:practicalId/enable
Body: {
  "enabled": true  // or false
}
Response: {
  "message": "Practical enabled successfully",
  "practical": { ... }
}
```
**Behavior:**
- When `enabled: true` → All students can access this practical immediately
- When `enabled: false` → Sequential unlock rules apply

### Teacher: Get Practicals for Subject Instance
```
GET /api/practicals/teacher/:subjectInstanceId
```

### Student: Get Practical List
```
GET /api/practicals/student/:subjectInstanceId
Response: [
  {
    "id": "uuid",
    "pr_no": 1,
    "title": "Loops",
    "is_enabled": true
  }
]
```

### Student: Get Practical Detail
```
GET /api/practicals/:practicalId
Response: {
  "id": "uuid",
  "pr_no": 1,
  "title": "Loops",
  "description": "...",
  "task": "...",
  "sample_code": "...",
  "theory": "...",
  "language": "Python",
  "is_enabled": true
}
```

---

## 👨‍🏫 Teacher Dashboard APIs

### Get Submitted/Not-Submitted Students for a Practical
```
GET /api/teacher-dashboard/practical/:practicalId/students
Response: {
  "practical": {
    "id": "uuid",
    "pr_no": 1,
    "title": "Loops",
    "subject_name": "Python",
    "semester": 3
  },
  "submitted": [
    {
      "student_id": "uuid",
      "name": "John Doe",
      "prn": "123456",
      "roll": "31",
      "email": "john@example.com",
      "execution_status": "success",
      "execution_time_ms": 50,
      "submitted_at": "2024-01-15T10:30:00Z",
      "submission_id": "uuid"
    }
  ],
  "not_submitted": [
    {
      "student_id": "uuid",
      "name": "Jane Smith",
      "prn": "123457",
      "roll": "32",
      "email": "jane@example.com"
    }
  ],
  "stats": {
    "total_students": 50,
    "submitted_count": 35,
    "not_submitted_count": 15,
    "submission_rate": "70.00"
  }
}
```

### Get Student Submission Detail
```
GET /api/teacher-dashboard/submission/:submissionId
Response: {
  "submission": {
    "id": "uuid",
    "code": "print('Hello')",
    "language": "Python",
    "execution_status": "success",
    "execution_output": "Hello",
    "execution_error": null,
    "execution_time_ms": 50,
    "memory_used_kb": 1024,
    "submitted_at": "2024-01-15T10:30:00Z"
  },
  "student": {
    "id": "uuid",
    "name": "John Doe",
    "prn": "123456",
    "roll": "31",
    "email": "john@example.com",
    "semester": 3
  },
  "practical": {
    "id": "uuid",
    "pr_no": 1,
    "title": "Loops",
    "language": "Python"
  }
}
```

### Get All Practicals with Stats for Subject Instance
```
GET /api/teacher-dashboard/subject-instance/:subjectInstanceId/practicals
Response: {
  "subject_instance": {
    "id": "uuid",
    "subject_name": "Python",
    "semester": 3
  },
  "practicals": [
    {
      "id": "uuid",
      "pr_no": 1,
      "title": "Loops",
      "is_enabled": true,
      "total_students": 50,
      "submitted_count": 45,
      "not_submitted_count": 5,
      "submission_rate": "90.00"
    }
  ]
}
```

---

## 📄 PDF Export APIs

### Download Practical Report PDF
```
GET /api/pdf/practical/:practicalId
Headers: Authorization: Bearer <token>
Response: PDF file download
```
**Content:**
- College name
- Subject + semester info
- Teacher name
- Practical details
- Submitted students list
- Not submitted students list
- Statistics

### Download Subject Instance Report PDF
```
GET /api/pdf/subject-instance/:subjectInstanceId
Headers: Authorization: Bearer <token>
Response: PDF file download
```
**Content:**
- College name
- Subject + semester info
- Teacher name
- All practicals with submission stats
- Overall statistics

---

## 🔄 Unlock Logic Flow

### Sequential Unlock (Normal)
1. PR-1: Always unlocked
2. PR-2: Unlocked if PR-1 has `execution_status = 'success'`
3. PR-3: Unlocked if PR-2 has `execution_status = 'success'`
4. ... and so on

### Batch Unlock (Teacher Control)
1. Teacher sets `is_enabled = true` for PR-X
2. All students can access PR-X immediately
3. Previous practical completion NOT required

### Combined Logic
- If `practical.is_enabled = true` → Always unlocked
- Else → Check sequential unlock rules

---

## 🛡️ Security & Limits

### Code Execution Limits
- **Time Limit**: 5 seconds
- **Memory Limit**: 128 MB
- **Network Access**: Disabled
- **File System**: Read-only (sample files only)
- **Max Output**: 1 MB

### Supported Languages
- Python (3.10.0)
- Java (15.0.2)
- C++ (10.2.0)
- C / OS (10.2.0)
- SQL (Custom handler)
- OLAP (Mock execution)

---

## 📊 Data Flow

### Student Submission Flow:
1. Student writes code
2. Student clicks "Execute"
3. Code sent to execution API
4. If successful → Auto-submitted
5. Submission stored in database
6. Next practical unlocks (if sequential)

### Teacher Monitoring Flow:
1. Teacher views practical list
2. Teacher clicks on a practical
3. System shows submitted/not-submitted students
4. Teacher can view individual submission details
5. Teacher can download PDF reports

---

## 🚀 Next Steps

1. **Install Dependencies:**
   ```bash
   cd backend
   npm install axios pdfkit
   ```

2. **Setup Piston API (Optional):**
   - Default uses public Piston API
   - For production, setup own Piston instance

3. **Run Database Migration:**
   - See `ENHANCED_DATABASE_SCHEMA.md`
   - Add `is_enabled` fields to practicals
   - Update submissions table

4. **Test Execution:**
   - Test Python execution
   - Test Java execution
   - Verify auto-submit works

5. **Test Teacher Dashboard:**
   - Enable/disable practicals
   - View submission lists
   - Download PDFs

---

All APIs are ready for integration! 🎉
