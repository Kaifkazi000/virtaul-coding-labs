# API Documentation - Virtual Coding Lab

## Base URL
```
http://localhost:5000/api
```

All protected endpoints require:
```
Authorization: Bearer <access_token>
```

---

## 🔐 Authentication APIs

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

## 📚 Subject Instance APIs

### Teacher: Create Subject Instance
```
POST /api/subject-instances
Headers: Authorization: Bearer <token>
Body: {
  "subject_name": "Java",
  "subject_code": "JAVA",
  "semester": 3
}
Response: { id, subject_name, subject_code, semester, teacher_id, ... }
```

### Teacher: Get Own Subject Instances
```
GET /api/subject-instances/teacher
Headers: Authorization: Bearer <token>
Response: [{ id, subject_name, subject_code, semester, ... }]
```

### Student: Get Auto-Enrolled Subject Instances
```
GET /api/subject-instances/student
Headers: Authorization: Bearer <token>
Response: [{ id, subject_name, subject_code, semester, ... }]
```
*Auto-enrolled based on student's semester matching subject_instance.semester*

---

## 📝 Practical APIs

### Teacher: Add Practical
```
POST /api/practicals
Headers: Authorization: Bearer <token>
Body: {
  "subject_instance_id": "uuid",
  "pr_no": 1,
  "title": "Loops",
  "description": "Basic loops",
  "task": "Write a loop program",
  "sample_code": "for(int i=0;i<5;i++){}",
  "theory": "Loop syntax",
  "language": "Java"
}
Response: { message: "Practical added successfully" }
```

### Teacher: Get Practicals for Subject Instance
```
GET /api/practicals/teacher/:subjectInstanceId
Headers: Authorization: Bearer <token>
Response: [{ id, pr_no, title, description, task, ... }]
```

### Student: Get Practical List
```
GET /api/practicals/student/:subjectInstanceId
Headers: Authorization: Bearer <token>
Response: [{ id, pr_no, title }]
```

### Student: Get Practical Detail
```
GET /api/practicals/:practicalId
Headers: Authorization: Bearer <token>
Response: { id, pr_no, title, description, task, sample_code, theory, language }
```

---

## 💻 Code Execution & Submission APIs

### Student: Execute Code (Before Submission)
```
POST /api/submissions/execute
Headers: Authorization: Bearer <token>
Body: {
  "code": "print('Hello World')",
  "language": "Python",
  "practical_id": "uuid"
}
Response: {
  "execution_status": "success" | "failed",
  "output": "Code executed successfully (mock)",
  "error": null
}
```
**Note**: Currently uses mock execution. Can be replaced with Judge0, Piston API, or similar.

### Student: Submit Code (After Successful Execution)
```
POST /api/submissions
Headers: Authorization: Bearer <token>
Body: {
  "code": "print('Hello World')",
  "language": "Python",
  "practical_id": "uuid",
  "execution_status": "success",
  "output": "Code executed successfully"
}
Response: {
  "message": "Submission created successfully",
  "submission": { id, student_id, practical_id, code, submission_status: "pending", ... }
}
```
**Rules**:
- Only allows submission if `execution_status === "success"`
- If submission already exists, it updates the existing one
- Submission status is set to "pending" (awaiting teacher review)

### Student: Get Own Submission for a Practical
```
GET /api/submissions/student/:practicalId
Headers: Authorization: Bearer <token>
Response: {
  "submission": { id, code, language, execution_status, submission_status, ... } | null
}
```

### Student: Get Progress for Subject Instance
```
GET /api/submissions/student/progress/:subjectInstanceId
Headers: Authorization: Bearer <token>
Response: {
  "total_submissions": 5,
  "approved": 3,
  "pending": 1,
  "rejected": 1,
  "submissions": [
    { pr_no: 1, submission_status: "approved", submitted_at: "..." },
    ...
  ]
}
```

---

## 👨‍🏫 Teacher Review APIs

### Teacher: Get All Submissions for Subject Instance
```
GET /api/submissions/teacher/:subjectInstanceId
Headers: Authorization: Bearer <token>
Response: {
  "submissions": [
    {
      id, code, language, execution_status, submission_status,
      student: { id, name, prn, roll },
      practical: { id, pr_no, title },
      submitted_at, reviewed_at, teacher_feedback
    },
    ...
  ]
}
```
**Note**: Only returns submissions for subject instances owned by the teacher.

### Teacher: Approve or Reject Submission
```
PATCH /api/submissions/:submissionId/review
Headers: Authorization: Bearer <token>
Body: {
  "action": "approve" | "reject",
  "feedback": "Good work! (optional)"
}
Response: {
  "message": "Submission approved successfully",
  "submission": { ...updated submission... }
}
```
**Rules**:
- Only teacher who owns the subject instance can review
- On approval, student can proceed to next practical
- Updates `submission_status`, `teacher_feedback`, `reviewed_at`, `reviewed_by`

---

## 🔄 Submission Status Flow

```
pending → approved ✅ (unlocks next practical)
pending → rejected ❌ (student can resubmit)
```

---

## 🛡️ Security & Authorization

1. **All protected endpoints** require valid JWT token in `Authorization` header
2. **Students** can only:
   - View their own submissions
   - Submit code for practicals they have access to (via semester auto-enrollment)
3. **Teachers** can only:
   - View submissions for their own subject instances
   - Review submissions for their own subject instances

---

## 📊 Database Schema

See `DATABASE_SCHEMA.md` for complete table structures and RLS policies.

---

## 🚀 Next Steps (Future Enhancements)

1. **Real Code Execution**: Replace mock execution with Judge0 API or Piston API
2. **Progress Tracking**: Add explicit "unlock" mechanism for next practicals
3. **File Uploads**: Support file-based submissions for certain practicals
4. **Code Comparison**: Compare student code with expected output
5. **Auto-grading**: Automatic grading for simple test cases
6. **Notifications**: Notify students when submissions are reviewed

