# CyberSafe Desk — Project Summary

> **"Security starts with awareness."**

---

## What is CyberSafe Desk?

CyberSafe Desk is an enterprise-grade **cybersecurity incident management and security awareness platform** built as a full-stack web application. It allows organisations to report, track, investigate, and resolve cybersecurity incidents in a structured, auditable workflow — all from a browser, with no installation required.

Built as an academic project for the **EduQual Level 3 Diploma in Cloud Cyber Security — Topic 9: Digital Infrastructure & Platforms**, the application demonstrates real-world cloud, SaaS, and security engineering principles using modern production-grade tools.

---

## Purpose & Problem It Solves

Most small and medium organisations lack a dedicated system to:
- Receive and track security incident reports from employees
- Assign incidents to analysts and manage investigation workflows
- Maintain a tamper-proof audit trail of all actions
- Educate staff on cybersecurity threats and best practices
- Visualise their overall security posture through live analytics

CyberSafe Desk solves all of these in a single, cohesive platform.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend Framework** | React 18 + TypeScript |
| **Build Tool** | Vite |
| **Styling** | Tailwind CSS + shadcn/ui (Radix UI primitives) |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Routing** | React Router v6 |
| **Backend / Database** | Supabase (PostgreSQL) |
| **Authentication** | Supabase Auth (JWT, email/password) |
| **File Storage** | Supabase Storage |
| **Hosting** | Vercel (CDN + CI/CD) |
| **Language** | TypeScript (strict) throughout |

---

## Architecture Overview

```
Browser (React SPA)
        │
        │  HTTPS  —  Supabase JS SDK (REST + WebSocket)
        ▼
Supabase Backend
   ├── PostgreSQL Database  (incidents, profiles, notes, logs, notifications)
   ├── Supabase Auth        (JWT sessions, email/password)
   └── Supabase Storage     (evidence file uploads)
        │
        └── Deployed on Vercel (global CDN, CI/CD from GitHub)
```

The app is a **single-page application (SPA)** — React handles all UI and routing in the browser. Supabase provides the entire backend as a managed cloud service.

---

## User Roles

The platform supports three distinct roles with different access levels:

| Role | Permissions |
|------|-------------|
| **Super Admin** | Full access — manage users, view all incidents, all audit logs, change roles |
| **Security Analyst** | View & update all incidents, add investigation notes, access audit logs |
| **Employee** | Report incidents, view only their own submissions, receive notifications |

Role-based access is enforced at two levels:
- **Frontend:** UI elements and routes are conditionally rendered per role
- **Database:** Supabase Row Level Security (RLS) policies enforce access at the data layer

---

## Pages & Features

### 1. Overview (Dashboard)
The main landing page after login. Shows:
- **4 KPI cards** — Total incidents, Open incidents, High severity count, Resolved count
- **Incident Trends chart** — 7-month line chart of reported vs resolved incidents
- **Severity Distribution** — Donut chart breakdown by severity level
- **Recent Incidents table** — Latest 6 incidents with quick-click navigation
- **Top Categories** — Bar chart of most common incident types
- **Security Feed** — Live audit log activity stream

### 2. Incidents List
Full paginated list of all incidents (filtered by role). Features:
- Search by title, reference ID, or description
- Filter by status, severity, and category
- Sort by date, severity, or status
- Click any row to open the full incident detail

### 3. Report Incident
A guided form for employees and analysts to submit new incidents. Fields:
- Title, description, category, severity, affected system
- Automatically generates a unique reference ID (e.g., `INC-LK4X2Y-A1B2`)
- Creates an audit log entry on submission

### 4. Incident Detail
Full detail view for a single incident. Includes:
- Complete incident metadata with editable status/severity/assignment (analysts only)
- Investigation notes thread with timestamps
- Audit trail specific to that incident
- Evidence file upload section

### 5. Investigation
Analyst workspace showing all active incidents requiring attention:
- Filtered views for unassigned, in-progress, and high-priority incidents
- Quick-assign and status-change actions

### 6. Analytics
Deep-dive analytics page with:
- Incident volume over time
- Category breakdown charts
- Average resolution time metrics
- Severity trend analysis
- Monthly comparison views

### 7. Awareness
Security awareness hub containing:
- Cybersecurity tips and best practices
- Threat awareness articles (phishing, ransomware, social engineering)
- Security quizzes and interactive learning content
- Resources for employees to self-educate

### 8. Knowledge Base
Searchable library of:
- Incident response playbooks
- Security policies and procedures
- How-to guides for common security scenarios
- Reference material for analysts

### 9. Team
User management page (admin only):
- View all registered users with their roles and departments
- Change user roles
- View user activity summary

### 10. Audit Logs
Tamper-proof append-only log of every action in the system:
- User logins and logouts
- Incident creation, updates, assignments, resolutions
- Note additions
- Role changes
- Filter by actor, action type, and date range

### 11. Settings
Platform configuration page covering:
- Profile settings (name, department, avatar)
- Notification preferences
- Webhook integration documentation (Slack, PagerDuty, Email)
- Security settings (MFA guidance, session management)

### 12. Demo Workflow
Interactive guided tour of the platform for demonstrations:
- Step-by-step walkthrough of the incident lifecycle
- Pre-loaded with fictional demo data
- Shows the full flow from report → investigation → resolution

---

## Database Schema

Five core tables in PostgreSQL:

| Table | Purpose |
|-------|---------|
| `profiles` | Stores user profiles, roles, and departments (linked to Supabase Auth) |
| `incidents` | All reported security incidents with full metadata |
| `incident_notes` | Investigation notes and comments on incidents |
| `audit_logs` | Append-only immutable log of all system actions |
| `notifications` | Per-user in-app notification inbox |

Custom PostgreSQL enums enforce valid values for `severity`, `status`, `category`, and `role`. Triggers automatically create a `profiles` record when a new user signs up, and update `updated_at` timestamps on record changes.

---

## Security Features

| Feature | Implementation |
|---------|---------------|
| **Authentication** | Supabase Auth — JWT tokens, email/password, auto session refresh |
| **Row Level Security** | PostgreSQL RLS policies on all 5 tables |
| **Role-based Access Control** | UI + database layer enforcement |
| **Audit Trail** | Immutable append-only audit_logs table (UPDATE/DELETE blocked by DB rules) |
| **Credential Safety** | `.env` file gitignored — credentials never in source code |
| **Input Validation** | TypeScript strict types + form validation throughout |
| **HTTPS** | Enforced by Vercel and Supabase on all traffic |

---

## Demo Mode

The app includes a full **offline demo mode** that works without a Supabase connection. It uses pre-loaded fictional data with three demo accounts:

| Email | Role | Password |
|-------|------|---------|
| `admin@cybersafe.demo` | Super Admin | *(any)* |
| `analyst@cybersafe.demo` | Security Analyst | *(any)* |
| `employee@cybersafe.demo` | Employee | *(any)* |

Demo data includes 12 fictional incidents, 5 investigation notes, 10 audit log entries, and 4 notifications — all clearly labelled `[DEMO]` to distinguish from real data.

---

## Project Setup

### Requirements
- Node.js 18+
- A Supabase project (free tier works)

### Steps

1. **Clone the repo**
   ```bash
   git clone https://github.com/faizan-tech435/cyber.git
   cd cyber
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
   ```

4. **Set up the database**
   - Open Supabase → SQL Editor
   - Paste and run the contents of `supabase/schema.sql`

5. **Run the app**
   ```bash
   npm run dev
   ```

The app also runs fully in demo mode without Supabase — just leave the `.env` blank.

---

## Cloud & SaaS Concepts Demonstrated

| Concept | How the project demonstrates it |
|---------|--------------------------------|
| **SaaS delivery** | Accessed via browser — no installation, multi-tenant ready |
| **Cloud compute** | Frontend on Vercel edge network; backend logic in Supabase |
| **Cloud storage** | PostgreSQL for structured data; Supabase Storage for evidence files |
| **Authentication as a service** | Supabase Auth handles JWT, sessions, and password management |
| **Scalability** | Supabase auto-scales PostgreSQL; Vercel auto-scales CDN delivery |
| **API integration** | REST API between React frontend and Supabase backend |
| **Vendor portability** | Supabase uses standard PostgreSQL — schema can migrate to any PG host |
| **Security by default** | RLS, HTTPS, JWT, audit logging, credential isolation |

---

## File Structure

```
cybersafe-desk/
├── src/
│   ├── pages/          # 14 page components (one per route)
│   ├── components/
│   │   ├── layout/     # AppLayout, Sidebar, TopNav
│   │   ├── shared/     # Reusable badges, avatars, spinners
│   │   └── ui/         # shadcn/ui component library
│   ├── contexts/       # AuthContext, IncidentContext (global state)
│   ├── data/           # demoData.ts (fictional demo records)
│   ├── lib/            # supabase.ts client, utils.ts helpers
│   └── types/          # TypeScript types and Supabase DB types
├── supabase/
│   ├── schema.sql      # Complete PostgreSQL schema with RLS
│   └── seed.sql        # Optional seed data
├── public/             # Static assets
├── .env.example        # Environment variable template
└── PROJECT_SUMMARY.md  # This file
```

---

## Academic Context

**Course:** EduQual Level 3 Diploma in Cloud Cyber Security  
**Topic:** 9 — Digital Infrastructure & Platforms  
**Goal:** Demonstrate understanding of cloud-hosted, SaaS-delivered platforms with real security engineering practices including authentication, access control, audit logging, and data protection.

---

*All demo incidents and user data are entirely fictional and created for demonstration purposes only. No real people, organisations, or security events are represented.*
