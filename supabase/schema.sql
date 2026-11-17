-- ================================================================
-- CyberSafe Desk — Supabase PostgreSQL Schema
-- Ye poora SQL copy karo aur Supabase SQL Editor mein paste karo
-- ================================================================

-- UUID extension enable karo
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- STEP 1: ENUMS (Custom Data Types)
-- ================================================================

CREATE TYPE incident_severity AS ENUM ('low', 'medium', 'high', 'critical');

CREATE TYPE incident_status AS ENUM (
  'submitted',
  'under_review',
  'investigating',
  'resolved',
  'closed'
);

CREATE TYPE incident_category AS ENUM (
  'phishing_email',
  'suspicious_link',
  'unauthorized_access',
  'malware',
  'data_exposure',
  'account_compromise',
  'other'
);

CREATE TYPE user_role AS ENUM (
  'super_admin',
  'security_analyst',
  'employee'
);

-- ================================================================
-- STEP 2: TABLES
-- ================================================================

-- PROFILES TABLE
-- Har registered user ka profile yahan store hota hai
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT NOT NULL,
  role        user_role NOT NULL DEFAULT 'employee',
  department  TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- INCIDENTS TABLE
-- Sare reported incidents yahan store hote hain
CREATE TABLE incidents (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference_id       TEXT NOT NULL UNIQUE,
  title              TEXT NOT NULL,
  description        TEXT NOT NULL,
  category           incident_category NOT NULL DEFAULT 'other',
  severity           incident_severity NOT NULL DEFAULT 'medium',
  status             incident_status NOT NULL DEFAULT 'submitted',
  affected_system    TEXT,
  reporter_id        UUID NOT NULL REFERENCES profiles(id),
  assigned_to        UUID REFERENCES profiles(id),
  resolution_summary TEXT,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX incidents_reporter_idx   ON incidents(reporter_id);
CREATE INDEX incidents_assigned_idx   ON incidents(assigned_to);
CREATE INDEX incidents_status_idx     ON incidents(status);
CREATE INDEX incidents_severity_idx   ON incidents(severity);
CREATE INDEX incidents_created_at_idx ON incidents(created_at DESC);

-- INCIDENT NOTES TABLE
-- Investigation notes/comments on each incident
CREATE TABLE incident_notes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  author_id   UUID NOT NULL REFERENCES profiles(id),
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX notes_incident_idx ON incident_notes(incident_id);

-- INCIDENT EVIDENCE TABLE
-- Evidence files attached to incidents (uploaded to Supabase Storage)
CREATE TABLE incident_evidence (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  file_name   TEXT NOT NULL,
  file_url    TEXT,
  file_type   TEXT,
  file_size   BIGINT,
  uploaded_by UUID NOT NULL REFERENCES profiles(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX evidence_incident_idx ON incident_evidence(incident_id);

ALTER TABLE incident_evidence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "evidence_select"
  ON incident_evidence FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "evidence_insert"
  ON incident_evidence FOR INSERT
  WITH CHECK (uploaded_by = auth.uid());

-- AUDIT LOGS TABLE
-- Append-only log of all actions (cannot be updated or deleted)
CREATE TABLE audit_logs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id      UUID NOT NULL REFERENCES profiles(id),
  action        TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id   UUID,
  details       JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX audit_logs_actor_idx   ON audit_logs(actor_id);
CREATE INDEX audit_logs_created_idx ON audit_logs(created_at DESC);

-- Audit logs ko update/delete hone se rokna
CREATE OR REPLACE RULE no_update_audit AS ON UPDATE TO audit_logs DO INSTEAD NOTHING;
CREATE OR REPLACE RULE no_delete_audit AS ON DELETE TO audit_logs DO INSTEAD NOTHING;

-- NOTIFICATIONS TABLE
-- In-app notifications for each user
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT 'info',
  read        BOOLEAN DEFAULT FALSE,
  incident_id UUID REFERENCES incidents(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX notifications_user_idx ON notifications(user_id);

-- ================================================================
-- STEP 3: TRIGGERS
-- ================================================================

-- Trigger 1: Jab koi sign up kare, automatically profile bane
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'employee'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Trigger 2: updated_at automatically update ho
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER incidents_updated_at
  BEFORE UPDATE ON incidents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- STEP 4: ROW LEVEL SECURITY (RLS)
-- Database level pe access control
-- ================================================================

ALTER TABLE profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents      ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications  ENABLE ROW LEVEL SECURITY;

-- ---- PROFILES policies ----
-- Koi bhi logged-in user sab profiles dekh sakta hai (names/emails ke liye)
CREATE POLICY "profiles_select_all"
  ON profiles FOR SELECT
  USING (true);

-- User sirf apna profile update kar sakta hai
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Profile insert sirf apne liye
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ---- INCIDENTS policies ----
-- Employee: sirf apne incidents dekhe
-- Analyst/Admin: sab incidents dekhe
CREATE POLICY "incidents_select"
  ON incidents FOR SELECT
  USING (
    reporter_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('security_analyst', 'super_admin')
    )
  );

-- Koi bhi logged-in user incident report kar sakta hai
CREATE POLICY "incidents_insert"
  ON incidents FOR INSERT
  WITH CHECK (reporter_id = auth.uid());

-- Sirf analysts/admins update kar sakte hain
CREATE POLICY "incidents_update"
  ON incidents FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('security_analyst', 'super_admin')
    )
  );

-- ---- INCIDENT NOTES policies ----
-- Logged-in user sab notes dekh sakta hai
CREATE POLICY "notes_select"
  ON incident_notes FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Sirf analysts/admins notes add kar sakte hain
CREATE POLICY "notes_insert"
  ON incident_notes FOR INSERT
  WITH CHECK (
    author_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('security_analyst', 'super_admin')
    )
  );

-- ---- AUDIT LOGS policies ----
-- Koi bhi log insert kar sakta hai
CREATE POLICY "audit_insert"
  ON audit_logs FOR INSERT
  WITH CHECK (actor_id = auth.uid());

-- Sirf analysts/admins logs dekh sakte hain
CREATE POLICY "audit_select"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('security_analyst', 'super_admin')
    )
  );

-- ---- NOTIFICATIONS policies ----
-- User sirf apni notifications dekhe
CREATE POLICY "notif_select"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "notif_insert"
  ON notifications FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "notif_update"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

-- ================================================================
-- Schema complete! 
-- Ab "Run" button dabao
-- ================================================================
