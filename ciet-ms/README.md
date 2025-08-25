# CIEt Caregivers Sponsorship Management System (Starter Monorepo)

This is a runnable starter project scaffold with three apps:
- **backend/** — Node.js + Express API
- **web/** — React + Vite web client
- **mobile/** — Expo (React Native) mobile app

> NOTE: This is a minimal educational scaffold with in-memory storage. Replace with a real DB (e.g., PostgreSQL) before production.


## 1) Prerequisites
- Node.js 18+ and npm
- (Optional) Expo CLI for mobile: `npm i -g expo`

## 2) Quickstart (3 terminals)

### A) Backend
```bash
cd backend
npm install
npm run dev
```
Server runs on `http://localhost:4000`

### B) Web (React)
```bash
cd web
npm install
npm run dev
```
App runs on Vite dev server (shown in terminal, usually `http://localhost:5173`).

### C) Mobile (Expo)
```bash
cd mobile
npm install
npm start
```
- Press `a` for Android emulator, `i` for iOS (on macOS), or scan the QR in Expo Go.

## 3) API Overview
Base URL: `http://localhost:4000/api`

- **Projects**
  - `POST /projects` — create project
  - `GET /projects` — list
  - `PATCH /projects/:id/status` — activate/deactivate
- **Caregivers**
  - `POST /caregivers` — create caregiver
  - `GET /caregivers` — list
- **Funds**
  - `POST /funds` — allocate fund to caregiver
  - `GET /funds` — list
- **Activities**
  - `POST /activities` — submit caregiver activity + evidence url(s)
  - `GET /activities` — list

## 4) Roles & Auth (stubbed)
- Head Office (admin), Project Director (project super admin), Employee.
- This starter uses a simple `x-user-role` header for demo. Replace with real auth (JWT).

## 5) Next Steps
- Replace in-memory arrays with a database.
- Add proper auth (login, JWT), RBAC, input validation.
- Add file storage (e.g., S3) for evidence/photo uploads.
- Harden CI/CD, tests, and deploy scripts.
