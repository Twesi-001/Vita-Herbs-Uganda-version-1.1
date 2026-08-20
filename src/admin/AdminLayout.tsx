import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell, ChevronDown, ChevronsLeft, KeyRound, LogOut, Maximize, Menu, Minimize,
  Settings as SettingsIcon, X,
} from 'lucide-react';
import { useAdminAuth } from './adminAuthContext';
import { ChromeContext } from './adminChromeContext';
import { NAV_SECTIONS, mostSpecificMatch } from './navConfig';
import { useAdminResource } from '../hooks/useAdminResource';
import type { Review, Stats } from './types';

const EMPTY_STATS: Stats = { subscribers: 0, contacts: 0, products: 0, reviews: 0, videos: 0 };

export default function AdminLayout() {
  const { logout } = useAdminAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // The layout stays mounted across route changes, so these fetch once per session.
  const { data: stats, refetch: refetchStats } = useAdminResource<Stats>('/admin/stats');
  const { data: reviews, refetch: refetchReviews } = useAdminResource<Review[]>('/admin/reviews');

  const counts = stats ?? EMPTY_STATS;
  const pendingReviews = useMemo(
    () => (reviews ?? []).filter((r) => (r.status ?? 'pending') === 'pending'),
    [reviews],
  );

  const refreshCounts = useCallback(() => {
    refetchStats();
    refetchReviews();
  }, [refetchStats, refetchReviews]);

  const chrome = useMemo(() => ({ refreshCounts }), [refreshCounts]);

  const activePath = mostSpecificMatch(pathname);

  // Close the mobile drawer and any open dropdown when the route changes.
  // Adjusted during render rather than in an effect — React's documented
  // pattern for reacting to a changed value without an extra paint.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setSidebarOpen(false);
    setShowNotifications(false);
    setShowProfileMenu(false);
  }

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfileMenu(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  return (
    <ChromeContext.Provider value={chrome}>
      <div className={`admin-layout ${sidebarCollapsed ? 'layout-collapsed' : ''}`}>
        {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

        {/* ── Sidebar ── */}
        <aside className={`admin-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
          <div className="sidebar-brand">
            <img src="/assets/logo.jpeg" alt="Kar Organics" className="brand-logo-img" />
            <div className="brand-text">
              <div className="brand-name">Kar Organics</div>
              <div className="brand-sub">Admin Panel</div>
            </div>
            <button
              className="sidebar-collapse-btn"
              onClick={() => setSidebarCollapsed((v) => !v)}
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <ChevronsLeft size={16} />
            </button>
            <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <nav className="sidebar-nav">
            {NAV_SECTIONS.map((section) => (
              <div key={section.label} className="nav-section">
                <div className="nav-section-label">{section.label}</div>
                {section.items.map((item) => (
                  <div key={item.path} className="nav-group">
                    <NavLink
                      to={item.path}
                      className={`nav-item ${item.path === activePath ? 'nav-active' : ''}`}
                      title={sidebarCollapsed ? item.label : undefined}
                    >
                      <span className="nav-icon">{item.icon}</span>
                      <span className="nav-label">{item.label}</span>
                      {item.badge && <span className="nav-badge">{counts[item.badge]}</span>}
                    </NavLink>
                  </div>
                ))}
              </div>
            ))}
          </nav>

          <div className="sidebar-footer">
            <button className="nav-item nav-logout" onClick={logout}>
              <span className="nav-icon"><LogOut size={19} /></span>
              <span className="nav-label">Log out</span>
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="admin-main">
          <header className="admin-topbar">
            <button className="hamburger" onClick={() => setSidebarOpen(true)}>
              <Menu size={22} />
            </button>
            {/* Page title and actions live in each page's PageHeader now, so the
                topbar is pure chrome — this spacer keeps the icons flush right. */}
            <div className="topbar-spacer" />
            <div className="topbar-right">
              <div className="topbar-icons">
                <button
                  className="icon-chip"
                  onClick={toggleFullscreen}
                  title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                >
                  {isFullscreen ? <Minimize size={17} /> : <Maximize size={17} />}
                </button>

                <div className="topbar-dropdown" ref={notifRef}>
                  <button
                    className="icon-chip"
                    onClick={() => { setShowNotifications((v) => !v); setShowProfileMenu(false); }}
                    title="Notifications"
                  >
                    <Bell size={17} />
                    {pendingReviews.length > 0 && (
                      <span className="icon-chip-badge">{pendingReviews.length}</span>
                    )}
                  </button>
                  {showNotifications && (
                    <div className="topbar-menu topbar-menu--wide">
                      <div className="topbar-menu-head">Notifications</div>
                      {pendingReviews.length === 0 ? (
                        <p className="topbar-menu-empty">You&apos;re all caught up.</p>
                      ) : (
                        <ul className="topbar-menu-list">
                          {pendingReviews.slice(0, 5).map((r) => (
                            <li key={r.id}>
                              <span className="dash-avatar dash-avatar--purple">
                                {r.name.charAt(0).toUpperCase()}
                              </span>
                              <div className="dash-list-main">
                                <div className="cell-strong">{r.name}</div>
                                <div className="cell-sub">left a review awaiting approval</div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                      <button
                        className="topbar-menu-footer"
                        onClick={() => { setShowNotifications(false); navigate('/admin/reviews'); }}
                      >
                        View all reviews
                      </button>
                    </div>
                  )}
                </div>

                <Link to="/admin/settings/account" className="icon-chip" title="Settings">
                  <SettingsIcon size={17} />
                </Link>

                <div className="topbar-dropdown" ref={profileRef}>
                  <button
                    className="profile-chip"
                    onClick={() => { setShowProfileMenu((v) => !v); setShowNotifications(false); }}
                  >
                    <span className="profile-avatar">A</span>
                    <ChevronDown size={14} />
                  </button>
                  {showProfileMenu && (
                    <div className="topbar-menu">
                      <div className="topbar-menu-head">Admin</div>
                      <button
                        className="topbar-menu-item"
                        onClick={() => { setShowProfileMenu(false); navigate('/admin/settings/account'); }}
                      >
                        <KeyRound size={15} /> Account settings
                      </button>
                      <button className="topbar-menu-item topbar-menu-item--danger" onClick={logout}>
                        <LogOut size={15} /> Log out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          <div className="admin-content">
            <Outlet />
          </div>
        </div>
      </div>
    </ChromeContext.Provider>
  );
}
