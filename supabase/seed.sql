-- =============================================================
-- CyberSafe Desk — Demo Seed Data
-- =============================================================
-- ALL DATA IS ENTIRELY FICTIONAL.
-- No real people, organisations, or security incidents are
-- represented. This seed file is for demonstration purposes only.
--
-- *** IMPORTANT SETUP INSTRUCTIONS ***
-- Before running this file, you must:
-- 1. Create 3 auth users in Supabase dashboard:
--    Authentication → Users → Add user
--    - admin@cybersafe.demo    (set any password, e.g. Demo@Admin2026)
--    - analyst@cybersafe.demo  (set any password, e.g. Demo@Analyst2026)
--    - employee@cybersafe.demo (set any password, e.g. Demo@Employee2026)
-- 2. Copy the UUID that Supabase generates for each user
-- 3. Find and replace the placeholder UUIDs below:
--    00000000-0000-0000-0000-000000000001 → admin user UUID
--    00000000-0000-0000-0000-000000000002 → analyst user UUID
--    00000000-0000-0000-0000-000000000003 → employee user UUID
--    00000000-0000-0000-0000-000000000004 → riya.patel user UUID
--    00000000-0000-0000-0000-000000000005 → taylor.kim user UUID
-- 4. Then run this file in the Supabase SQL Editor
--
-- Run this AFTER schema.sql.
-- =============================================================

-- =============================================================
-- 1. PROFILES (fictional demo users)
-- Replace the placeholder UUIDs with your actual auth.users UUIDs
-- =============================================================
INSERT INTO profiles (id, email, full_name, role, department, avatar_url, created_at, updated_at) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@cybersafe.demo',       'Alex Morgan',  'super_admin',      'Security Operations', NULL, '2026-01-15T08:00:00Z', '2026-11-01T09:00:00Z'),
  ('00000000-0000-0000-0000-000000000002', 'analyst@cybersafe.demo',     'Jordan Lee',   'security_analyst', 'Security Operations', NULL, '2026-02-01T08:00:00Z', '2026-11-01T09:00:00Z'),
  ('00000000-0000-0000-0000-000000000003', 'riya.patel@cybersafe.demo',  'Riya Patel',   'security_analyst', 'Threat Intelligence', NULL, '2026-02-10T08:00:00Z', '2026-11-01T09:00:00Z'),
  ('00000000-0000-0000-0000-000000000004', 'employee@cybersafe.demo',    'Sam Rivera',   'employee',         'Human Resources',     NULL, '2026-03-01T08:00:00Z', '2026-11-01T09:00:00Z'),
  ('00000000-0000-0000-0000-000000000005', 'taylor.kim@cybersafe.demo',  'Taylor Kim',   'employee',         'Finance',             NULL, '2026-03-15T08:00:00Z', '2026-11-01T09:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- Update incident reporter/assignee references to match new UUIDs
-- If you changed the profile UUIDs above, update these too:

-- =============================================================
-- 2. INCIDENTS (12 fictional security incidents)
-- =============================================================
INSERT INTO incidents (id, reference_id, title, description, category, severity, status, affected_system, reporter_id, assigned_to, resolution_summary, created_at, updated_at) VALUES
  (
    'inc-001', 'INC-LK4X2Y-A1B2',
    '[DEMO] Phishing Email Targeting Finance Department',
    'DEMO DATA — Received a suspicious email impersonating the IT department requesting login credentials. The email contained a link to a fake VPN login page. Multiple employees in finance received this same email.',
    'phishing_email', 'high', 'investigating',
    'Email / Finance Department',
    '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', NULL,
    '2026-11-08T09:23:00Z', '2026-11-09T14:15:00Z'
  ),
  (
    'inc-002', 'INC-LK3M9P-C3D4',
    '[DEMO] Brute-Force Attack on Admin Portal',
    'DEMO DATA — Multiple failed login attempts detected on the administrative portal from an unknown IP address (198.51.100.47). Brute-force pattern observed — 47 attempts in 3 minutes.',
    'unauthorized_access', 'critical', 'under_review',
    'Admin Portal / Authentication System',
    '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', NULL,
    '2026-11-09T02:47:00Z', '2026-11-09T08:30:00Z'
  ),
  (
    'inc-003', 'INC-LK2T6R-E5F6',
    '[DEMO] Malware Detected on HR Workstation',
    'DEMO DATA — Antivirus software flagged a Trojan dropper on a workstation in the HR department. The file was introduced via an unauthorised USB drive.',
    'malware', 'critical', 'resolved',
    'HR Workstation — WS-HR-042',
    '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003',
    'Workstation quarantined and reimaged. USB policy updated to block external media. No data exfiltration detected.',
    '2026-11-02T11:15:00Z', '2026-11-05T16:00:00Z'
  ),
  (
    'inc-004', 'INC-LK1N3S-G7H8',
    '[DEMO] Account Login from Unusual Geographic Location',
    'DEMO DATA — A user account logged in from an IP address geo-located overseas while the account owner confirmed they were on-site. Potential account compromise.',
    'account_compromise', 'high', 'resolved',
    'User Account / SSO Platform',
    '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002',
    'Account password reset, MFA enforced, suspicious session terminated. No sensitive data accessed.',
    '2026-11-01T17:33:00Z', '2026-11-03T10:00:00Z'
  ),
  (
    'inc-005', 'INC-LK0Q7T-I9J0',
    '[DEMO] Personnel Records Shared Publicly via Cloud Storage',
    'DEMO DATA — An employee accidentally set a folder containing personnel records to public in cloud storage. The folder was accessible for approximately 4 hours.',
    'data_exposure', 'high', 'closed',
    'Cloud Storage / SharePoint',
    '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003',
    'Folder permissions corrected. Incident reported to DPO. Access logs reviewed — no external downloads detected.',
    '2026-10-28T13:00:00Z', '2026-10-30T09:00:00Z'
  ),
  (
    'inc-006', 'INC-LJZ4K5-K1L2',
    '[DEMO] Suspicious Link Received via Microsoft Teams',
    'DEMO DATA — A message was received via Teams from an external user containing a link to a known malware distribution site. The link was not clicked by any recipient.',
    'suspicious_link', 'medium', 'submitted',
    'Microsoft Teams',
    '00000000-0000-0000-0000-000000000005', NULL, NULL,
    '2026-11-10T08:05:00Z', '2026-11-10T08:05:00Z'
  ),
  (
    'inc-007', 'INC-LJY8M2-M3N4',
    '[DEMO] CEO Impersonation Phishing — Wire Transfer Request',
    'DEMO DATA — CEO impersonation emails sent to 12 employees requesting urgent wire transfers. Emails spoofed the CEO''s display name but used a lookalike domain.',
    'phishing_email', 'critical', 'resolved',
    'Email / Executive Office',
    '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002',
    'Email filtering rules updated, all recipients notified, domain blocked at mail gateway. Finance team briefed on wire transfer verification.',
    '2026-10-20T10:00:00Z', '2026-10-24T15:30:00Z'
  ),
  (
    'inc-008', 'INC-LJX2P9-O5P6',
    '[DEMO] Unauthorised USB Device in Server Room',
    'DEMO DATA — Access control logs show an unauthorised USB device was connected to a production server for 12 minutes using an authorised employee''s badge.',
    'unauthorized_access', 'medium', 'investigating',
    'Data Centre — Server Room B',
    '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', NULL,
    '2026-11-07T23:15:00Z', '2026-11-09T11:00:00Z'
  ),
  (
    'inc-009', 'INC-LJW6R4-Q7R8',
    '[DEMO] Ransomware Indicator in Email Attachment',
    'DEMO DATA — Sandbox analysis flagged an email attachment as containing a ransomware dropper. The attachment was quarantined before delivery to any user.',
    'malware', 'critical', 'resolved',
    'Email Gateway / Sandbox',
    '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002',
    'Attachment quarantined and analysed. Sender domain blacklisted. Email security rules updated. No endpoints affected.',
    '2026-10-15T07:30:00Z', '2026-10-16T12:00:00Z'
  ),
  (
    'inc-010', 'INC-LJV0S1-S9T0',
    '[DEMO] Password Spray Attack on Microsoft 365',
    'DEMO DATA — Azure AD detected a low-and-slow password spray attack targeting 230 user accounts across a 6-hour window from distributed IP addresses.',
    'unauthorized_access', 'high', 'resolved',
    'Microsoft 365 / Azure AD',
    '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003',
    'Conditional access policies tightened, MFA enforced across all accounts. 2 accounts with successful logins had sessions revoked and passwords reset.',
    '2026-10-10T14:00:00Z', '2026-10-12T09:30:00Z'
  ),
  (
    'inc-011', 'INC-LJU4T8-U1V2',
    '[DEMO] Sensitive PII Sent to Wrong Email Address',
    'DEMO DATA — HR employee accidentally sent a spreadsheet containing employee personal data to an incorrect external email address.',
    'data_exposure', 'high', 'closed',
    'Email / HR Systems',
    '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003',
    'Recipient contacted and confirmed deletion. DPO notified. Email recall attempted. DLP rules updated to flag PII in outbound emails.',
    '2026-09-25T16:45:00Z', '2026-09-28T11:00:00Z'
  ),
  (
    'inc-012', 'INC-LJT8U5-W3X4',
    '[DEMO] Suspicious PowerShell Script Execution',
    'DEMO DATA — EDR solution detected a suspicious encoded PowerShell script executing on a developer workstation. Script attempted to download additional payloads.',
    'malware', 'high', 'resolved',
    'Developer Workstation — WS-DEV-017',
    '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002',
    'Script blocked and quarantined. Workstation memory forensics performed. No persistence established. Developer briefed on secure coding practices.',
    '2026-10-05T10:20:00Z', '2026-10-07T14:00:00Z'
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- 3. INCIDENT NOTES (5 fictional investigation notes)
-- =============================================================
INSERT INTO incident_notes (id, incident_id, author_id, content, created_at) VALUES
  ('note-001', 'inc-001', '00000000-0000-0000-0000-000000000002',
   'Confirmed phishing domain registered 3 days ago. Blocking at DNS level. Reaching out to affected users to confirm no credentials entered.',
   '2026-11-08T11:30:00Z'),
  ('note-002', 'inc-001', '00000000-0000-0000-0000-000000000002',
   'All 7 affected employees confirmed they did not enter credentials. Email filtering rule deployed to block the sender domain. Continuing to monitor.',
   '2026-11-09T14:15:00Z'),
  ('note-003', 'inc-002', '00000000-0000-0000-0000-000000000002',
   'IP traced to Tor exit node. Account locked after 10 attempts (rate limiting). No successful authentication. Reviewing WAF rules.',
   '2026-11-09T08:30:00Z'),
  ('note-004', 'inc-003', '00000000-0000-0000-0000-000000000003',
   'Trojan identified as Emotet loader. Workstation isolated from network immediately. Memory dump taken for further analysis.',
   '2026-11-02T12:00:00Z'),
  ('note-005', 'inc-003', '00000000-0000-0000-0000-000000000003',
   'Full reimaging completed. No lateral movement detected. USB storage devices now blocked by GPO across all endpoints.',
   '2026-11-05T16:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- 4. AUDIT LOGS (10 fictional activity entries)
-- =============================================================
INSERT INTO audit_logs (id, actor_id, action, resource_type, resource_id, details, created_at) VALUES
  ('audit-001', '00000000-0000-0000-0000-000000000005', 'incident.created',        'incident', 'inc-001', '{"reference_id":"INC-LK4X2Y-A1B2","title":"[DEMO] Phishing Email Targeting Finance Department"}', '2026-11-08T09:23:00Z'),
  ('audit-002', '00000000-0000-0000-0000-000000000001', 'incident.assigned',       'incident', 'inc-001', '{"assigned_to":"Jordan Lee","reference_id":"INC-LK4X2Y-A1B2"}',                                    '2026-11-08T10:00:00Z'),
  ('audit-003', '00000000-0000-0000-0000-000000000002', 'incident.status_changed', 'incident', 'inc-001', '{"from":"submitted","to":"investigating","reference_id":"INC-LK4X2Y-A1B2"}',                       '2026-11-08T11:00:00Z'),
  ('audit-004', '00000000-0000-0000-0000-000000000002', 'note.added',              'incident', 'inc-001', '{"note_preview":"Confirmed phishing domain registered 3 days ago...","reference_id":"INC-LK4X2Y-A1B2"}', '2026-11-08T11:30:00Z'),
  ('audit-005', '00000000-0000-0000-0000-000000000004', 'incident.created',        'incident', 'inc-003', '{"reference_id":"INC-LK2T6R-E5F6","title":"[DEMO] Malware Detected on HR Workstation"}',           '2026-11-02T11:15:00Z'),
  ('audit-006', '00000000-0000-0000-0000-000000000003', 'incident.severity_changed','incident','inc-003', '{"from":"high","to":"critical","reference_id":"INC-LK2T6R-E5F6"}',                                 '2026-11-02T12:30:00Z'),
  ('audit-007', '00000000-0000-0000-0000-000000000003', 'incident.resolved',       'incident', 'inc-003', '{"reference_id":"INC-LK2T6R-E5F6","resolution":"Workstation quarantined and reimaged."}',          '2026-11-05T16:00:00Z'),
  ('audit-008', '00000000-0000-0000-0000-000000000002', 'incident.created',        'incident', 'inc-002', '{"reference_id":"INC-LK3M9P-C3D4","title":"[DEMO] Brute-Force Attack on Admin Portal"}',           '2026-11-09T02:47:00Z'),
  ('audit-009', '00000000-0000-0000-0000-000000000001', 'user.role_changed',       'user',     '00000000-0000-0000-0000-000000000003', '{"user":"Riya Patel","from":"employee","to":"security_analyst"}',                          '2026-11-01T09:00:00Z'),
  ('audit-010', '00000000-0000-0000-0000-000000000005', 'incident.created',        'incident', 'inc-006', '{"reference_id":"INC-LJZ4K5-K1L2","title":"[DEMO] Suspicious Link Received via Microsoft Teams"}','2026-11-10T08:05:00Z')
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- 5. NOTIFICATIONS (4 fictional demo notifications)
-- =============================================================
INSERT INTO notifications (id, user_id, title, message, type, read, incident_id, created_at) VALUES
  ('notif-001', '00000000-0000-0000-0000-000000000002',
   'New Critical Incident',
   'INC-LK3M9P-C3D4: Brute-Force Attack on Admin Portal has been reported.',
   'critical', false, 'inc-002', '2026-11-09T02:47:00Z'),
  ('notif-002', '00000000-0000-0000-0000-000000000002',
   'Incident Assigned to You',
   'INC-LK4X2Y-A1B2: Phishing Email incident has been assigned to you.',
   'assignment', false, 'inc-001', '2026-11-08T10:00:00Z'),
  ('notif-003', '00000000-0000-0000-0000-000000000002',
   'New Incident Submitted',
   'INC-LJZ4K5-K1L2: Suspicious Link via Teams awaiting review.',
   'info', false, 'inc-006', '2026-11-10T08:05:00Z'),
  ('notif-004', '00000000-0000-0000-0000-000000000002',
   'Incident Resolved',
   'INC-LK2T6R-E5F6: Malware on HR Workstation has been resolved.',
   'success', true, 'inc-003', '2026-11-05T16:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- Seed complete. All records are fictional demo data.
-- Remember to replace the placeholder UUIDs with your actual
-- Supabase auth user UUIDs before running!
-- =============================================================
