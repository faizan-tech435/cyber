import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { IncidentProvider } from '@/contexts/IncidentContext'
import { AppLayout } from '@/components/layout/AppLayout'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { OverviewPage } from '@/pages/OverviewPage'
import { IncidentsPage } from '@/pages/IncidentsPage'
import { IncidentDetailPage } from '@/pages/IncidentDetailPage'
import { ReportIncidentPage } from '@/pages/ReportIncidentPage'
import { InvestigationPage } from '@/pages/InvestigationPage'
import { AnalyticsPage } from '@/pages/AnalyticsPage'
import { AwarenessPage } from '@/pages/AwarenessPage'
import { KnowledgeBasePage } from '@/pages/KnowledgeBasePage'
import { TeamPage } from '@/pages/TeamPage'
import { AuditLogsPage } from '@/pages/AuditLogsPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { DemoWorkflowPage } from '@/pages/DemoWorkflowPage'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner fullScreen message="Loading CyberSafe Desk..." />
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner fullScreen />
  if (user) return <Navigate to="/" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />
      <Route path="/register" element={<AuthRoute><RegisterPage /></AuthRoute>} />

      {/* Protected app shell — includes /demo so it gets full context */}
      <Route path="/" element={
        <ProtectedRoute>
          <IncidentProvider>
            <AppLayout />
          </IncidentProvider>
        </ProtectedRoute>
      }>
        <Route index element={<OverviewPage />} />
        <Route path="incidents" element={<IncidentsPage />} />
        <Route path="incidents/:id" element={<IncidentDetailPage />} />
        <Route path="report" element={<ReportIncidentPage />} />
        <Route path="investigation" element={<InvestigationPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="awareness" element={<AwarenessPage />} />
        <Route path="knowledge-base" element={<KnowledgeBasePage />} />
        <Route path="team" element={<TeamPage />} />
        <Route path="audit-logs" element={<AuditLogsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="demo" element={<DemoWorkflowPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
