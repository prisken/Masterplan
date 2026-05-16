import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { AppDataProvider } from './context/AppDataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AssetsPage } from './pages/AssetsPage';
import { ContactsPage } from './pages/ContactsPage';
import { ContentPage } from './pages/ContentPage';
import { Dashboard } from './pages/Dashboard';
import { EcosystemPage } from './pages/EcosystemPage';
import { EventsPage } from './pages/EventsPage';
import { FinancePage } from './pages/FinancePage';
import { HksiPage } from './pages/HksiPage';
import { LoginPage } from './pages/LoginPage';
import { MonthlyReviewPage } from './pages/MonthlyReviewPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { PromptsPage } from './pages/PromptsPage';
import { SettingsPage } from './pages/SettingsPage';
import { TasksPage } from './pages/TasksPage';
import { AdvisorPage } from './pages/AdvisorPage';
import { TodayPage } from './pages/TodayPage';
import { WeeklyReviewPage } from './pages/WeeklyReviewPage';

function AppRoutes() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/advisor" element={<AdvisorPage />} />
          <Route path="/pa" element={<AdvisorPage />} />
          <Route path="/mdrt" element={<AdvisorPage />} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/content" element={<ContentPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/finance" element={<FinancePage />} />
          <Route path="/hksi" element={<HksiPage />} />
          <Route path="/assets" element={<AssetsPage />} />
          <Route path="/prompts" element={<PromptsPage />} />
          <Route path="/ecosystem" element={<EcosystemPage />} />
          <Route path="/today" element={<TodayPage />} />
          <Route path="/weekly" element={<WeeklyReviewPage />} />
          <Route path="/monthly" element={<MonthlyReviewPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

function AuthenticatedApp() {
  const auth = useAuth();

  if (!auth.enabled) {
    return (
      <AppDataProvider persistence="local">
        <AppRoutes />
      </AppDataProvider>
    );
  }

  if (auth.status === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <p className="text-slate-500">Checking session…</p>
      </div>
    );
  }

  if (auth.status === 'anonymous') {
    return <LoginPage />;
  }

  return (
    <AppDataProvider persistence="server">
      <AppRoutes />
    </AppDataProvider>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AuthenticatedApp />
      </AuthProvider>
    </ToastProvider>
  );
}
