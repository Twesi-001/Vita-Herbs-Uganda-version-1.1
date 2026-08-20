import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminAuthProvider } from './AdminAuthProvider';
import { AdminUIProvider } from './components/AdminUIProvider';
import RequireAdmin from './RequireAdmin';
import AdminLayout from './AdminLayout';
import DashboardPage from './pages/DashboardPage';
import ProductsListPage from './pages/products/ProductsListPage';
import ProductFormPage from './pages/products/ProductFormPage';
import VideosPage from './pages/VideosPage';
import InquiriesPage from './pages/InquiriesPage';
import ReviewsPage from './pages/ReviewsPage';
import SubscribersPage from './pages/SubscribersPage';
import ContentPage from './pages/content/ContentPage';
import SettingsLayout from './pages/settings/SettingsLayout';
import AccountSettingsPage from './pages/settings/AccountSettingsPage';
import './styles/index.css';

/**
 * Every admin screen has its own URL, so a refresh (or a bookmark, or the back
 * button) lands where you actually were — the old panel kept the active section
 * in component state, which reset to the dashboard on every reload.
 *
 * Mounted under /admin/* by the public router.
 */
export default function AdminApp() {
  return (
    <AdminAuthProvider>
      <AdminUIProvider>
        <RequireAdmin>
          <Routes>
            <Route element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />

              <Route path="products" element={<ProductsListPage />} />
              <Route path="products/new" element={<ProductFormPage />} />
              <Route path="products/:id/edit" element={<ProductFormPage />} />

              <Route path="videos" element={<VideosPage />} />
              <Route path="inquiries" element={<InquiriesPage />} />
              <Route path="reviews" element={<ReviewsPage />} />
              <Route path="subscribers" element={<SubscribersPage />} />
              <Route path="content" element={<ContentPage />} />

              <Route path="settings" element={<SettingsLayout />}>
                {/* Redirect rather than render, so the sidebar link for
                    /admin/settings/account resolves as active. */}
                <Route index element={<Navigate to="/admin/settings/account" replace />} />
                <Route path="account" element={<AccountSettingsPage />} />
              </Route>

              <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
            </Route>
          </Routes>
        </RequireAdmin>
      </AdminUIProvider>
    </AdminAuthProvider>
  );
}
