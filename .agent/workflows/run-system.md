---
description: How to run the complete Virtual Coding Lab system
---

To run the entire system, you need to start both the backend and the frontend separately.

## 1. Prerequisites
Ensure you have Node.js and npm installed. You also need to have your Supabase environment variables configured in the `.env` files.

## 2. Start the Backend
Open a terminal in the root directory and run:

```bash
cd backend
npm install
npm start
```

This will start the Express server on its configured port (usually 5000).

## 3. Start the Frontend
Open another terminal in the root directory and run:

// turbo
```bash
cd frontend/my-app
npm install
npm run dev
```

This will start the Next.js development server (usually on http://localhost:3000).

## 4. Database Setup
The system uses Supabase. Ensure your database schema is up-to-date with the tables mentioned in the implementation plans (studentss, practicals, submissions, etc.).
