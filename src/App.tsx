import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import TargetLists from './pages/TargetLists';
import Surveys from './pages/Surveys';
import SurveyResponse from './pages/SurveyResponse';
import Login from './pages/Login';
import { useAuthStore } from './stores/authStore';

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  return user ? <>{children}</> : <Navigate to="/login" />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  return user?.is_admin ? <>{children}</> : <Navigate to="/" />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/survey/:id/respond" element={<SurveyResponse />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route
              path="target-lists"
              element={
                <AdminRoute>
                  <TargetLists />
                </AdminRoute>
              }
            />
            <Route
              path="surveys"
              element={
                <AdminRoute>
                  <Surveys />
                </AdminRoute>
              }
            />
            <Route index element={<Navigate to="/surveys" replace />} />
          </Route>
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;