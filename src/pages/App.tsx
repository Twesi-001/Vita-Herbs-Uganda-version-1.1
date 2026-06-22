import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense, Component, ReactNode } from 'react';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import BackToTop from '../components/ui/BackToTop';

const Home = lazy(() => import('./Home'));
const About = lazy(() => import('./About'));
const Products = lazy(() => import('./Products'));
const Contact = lazy(() => import('./Contact'));
const Socials = lazy(() => import('./Socials'));
const AdminDashboard = lazy(() => import('./AdminDashboard'));
const NotFound = lazy(() => import('./NotFound'));

function PageLoader() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner" style={{ width: 36, height: 36, border: '3px solid #e5e7eb', borderTopColor: '#3a7a2e', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );
}

interface ErrorBoundaryState { hasError: boolean; }
class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, padding: 24, textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Something went wrong</h2>
          <p style={{ color: '#6b7280' }}>Please refresh the page or try again later.</p>
          <button onClick={() => window.location.reload()} style={{ padding: '10px 24px', background: '#3a7a2e', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
            Refresh
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function PublicLayout() {
  return (
    <div className="app-container">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <Header />
      <main className="main-content" id="main-content">
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/products" element={<Products />} />
              <Route path="/social" element={<Socials />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/AdminDashboard" element={<AdminDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/*" element={<PublicLayout />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
