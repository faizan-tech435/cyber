# CyberSafe Desk

> **Security starts with awareness.**

A premium, enterprise-grade cybersecurity incident management and awareness platform built as an EduQual Level 3 Diploma in Cloud Cyber Security project — Topic 9: Digital Infrastructure & Platforms.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USER'S BROWSER                        │
│              (Chrome / Firefox / Safari / Edge)              │
└──────────────────────────┬──────────────────────────────────┘
                           │  HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              VITE + REACT FRONTEND  (SaaS Layer)             │
│                                                             │
│  React 18 . TypeScript . Tailwind CSS . shadcn/ui           │
│  Recharts . Lucide React . React Router v6                  │
│                                                             │
│  Pages: Overview | Incidents | Report | Investigation       │
│         Analytics | Awareness | Knowledge Base              │
│         Team | Audit Logs | Settings | Demo Workflow        │
└──────────────────────────┬──────────────────────────────────┘
                           │  Supabase JS SDK (REST + WebSocket)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   SUPABASE  (Backend-as-a-Service)          │
│                                                             │
│  +-----------------+  +--------------+  +---------------+    │
│  |  PostgreSQL DB  |  |  Supabase    |  |   Supabase    |    │
│  |                 |  |    Auth      |  |   Storage     |    │
│  |  profiles       |  |              |  |               |    │
│  |  incidents      |  |  JWT tokens  |  |  Evidence     |    │
│  |  incident_notes |  |  Email/pass  |  |  file uploads |    │
│  |  audit_logs     |  |  Sessions    |  |               |    │
│  |  notifications  |  |              |  |               |    │
│  |                 |  |              |  |               |    │
│  |  Row Level      |  |  Role-based  |  |  Bucket       |    │
│  |  Security (RLS) |  |  access ctrl |  |  policies     |    │
│  +-----------------+  +--------------+  +---------------+    │
└─────────────────────────────────────────────────────────────┘
                           │  Deployed via
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                       VERCEL  (CDN + Hosting)                │
│         Global edge network . HTTPS . CI/CD from GitHub      │
└─────────────────────────────────────────────────────────────┘
```

### Cloud & SaaS Concepts

| Concept | How CyberSafe Desk demonstrates it |
|---------|-------------------------------------|
| **Compute** | Frontend hosted on Vercel edge network; backend logic in Supabase |
| **Storage** | PostgreSQL for structured data; Supabase Storage for evidence files |
| **Networking** | HTTPS for all traffic; REST API between frontend and Supabase |
| **SaaS** | Users access via browser, no installation, multi-tenant ready |
| **Authentication** | Supabase Auth with JWT, email/password, session management |
| **Scalability** | Supabase auto-scales PostgreSQL; Vercel auto-scales frontend |
| **Vendor Lock-in** | Supabase uses standard PostgreSQL — can migrate to any PG host |
| **API Integration** | Settings page documents Slack/Email/PagerDuty webhook setup |        
