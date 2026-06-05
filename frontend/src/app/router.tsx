import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { CustomerListPage } from '@/features/customers/pages/CustomerListPage';
import { WorkbenchPage } from '@/features/workbench/pages/WorkbenchPage';
import { QueuePage } from '@/features/queue/pages/QueuePage';
import { SuccessStoriesPage } from '@/features/success/pages/SuccessStoriesPage';
import { NotFoundPage } from '@/features/misc/NotFoundPage';
import { AppShell } from '@/layouts/AppShell';
import { ProtectedRoute } from './ProtectedRoute';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'customers', element: <CustomerListPage /> },
      { path: 'customers/:customerId', element: <WorkbenchPage /> },
      { path: 'queue', element: <QueuePage /> },
      { path: 'success', element: <SuccessStoriesPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
