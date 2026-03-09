import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/app-shell';
import { ToastContainer } from '@/components/ui/toast';
import WriteView from '@/views/write-view';
import ListView from '@/views/list-view';
import DetailView from '@/views/detail-view';
import DashboardView from '@/views/dashboard-view';
import ReportsView from '@/views/reports-view';
import SettingsView from '@/views/settings-view';
import { useThemeEffect } from '@/hooks/use-theme';

export default function App() {
  useThemeEffect();

  return (
    <HashRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Navigate to="/write" replace />} />
          <Route path="/write" element={<WriteView />} />
          <Route path="/write/:id" element={<WriteView />} />
          <Route path="/list" element={<ListView />} />
          <Route path="/list/:id" element={<DetailView />} />
          <Route path="/dashboard" element={<DashboardView />} />
          <Route path="/reports" element={<ReportsView />} />
          <Route path="/reports/:type/:year/:period" element={<ReportsView />} />
          <Route path="/settings" element={<SettingsView />} />
        </Route>
      </Routes>
      <ToastContainer />
    </HashRouter>
  );
}
