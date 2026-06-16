# FitNex AI - Offline Development Repository

Welcome to FitNex AI! This repository contains the full-stack codebase optimized for offline, local development. 
The application features a React (Vite) frontend and a Python (FastAPI) backend using an SQLite database and MediaPipe for local AI pose analysis.

## 🚀 Quick Setup Guide

### 1. Backend Setup (FastAPI & AI)
The backend handles authentication, the database, and the AI pose landmarker analysis.

1. Navigate to the backend directory:
   ```bash
   cd python_services
   ```
2. Set up your environment variables by copying the example file:
   ```bash
   cp .env.example .env
   ```
3. Open `python_services/.env` and ensure your database is set to SQLite (this removes the need for an external Supabase connection):
   ```env
   DATABASE_URL=sqlite+aiosqlite:///./fitnex.db
   ```
4. Install the Python dependencies (we recommend creating a virtual environment first):
   ```bash
   pip install -r requirements.txt
   ```
5. Start the server:
   ```bash
   uvicorn main:app --reload
   ```
   *(Note: The first time you run this, a `fitnex.db` SQLite file will be automatically created in the folder containing all your tables).*

### 2. Frontend Setup (React/Vite)
The frontend contains the UI and directly uses the FastAPI backend.

1. Open a new terminal in the root folder (where `package.json` is).
2. Copy the frontend environment variables:
   ```bash
   cp .env.example .env
   ```
3. Ensure `VITE_AI_URL` points to your local FastAPI server:
   ```env
   VITE_AI_URL=http://localhost:8000
   ```
4. Install Node modules:
   ```bash
   npm install
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

### 3. Authentication & OTP (Important for Offline Mode)
Since this offline version does not connect to external SMTP servers (like Gmail), **it will not actually send emails**. 
When you register a new account or request a password reset, the application intercepts the email and **prints the OTP code directly in your backend terminal** (the one running `uvicorn`).
Simply look at the terminal logs to grab your 6-digit code!

### 4. Contributing
Please make sure not to commit any `.env`, `.db` (SQLite), or `node_modules` folders. The `.gitignore` is already set up to exclude these files automatically.
