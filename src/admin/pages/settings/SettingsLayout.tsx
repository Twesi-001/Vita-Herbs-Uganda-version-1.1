import { NavLink, Outlet } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import { SETTINGS_GROUPS } from './settingsNav';

/**
 * Nested layout route for /admin/settings/*. It owns the page header, so each
 * settings sub-page renders only its own card.
 */
export default function SettingsLayout() {
  return (
    <>
      <PageHeader title="Settings" description="Manage your admin account and preferences." />

      <div className="settings-layout">
        <nav className="settings-nav">
          {SETTINGS_GROUPS.map((group) => (
            <div key={group.label} className="settings-nav-group">
              <div className="settings-nav-label">{group.label}</div>
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `settings-nav-item ${isActive ? 'is-active' : ''}`}
                >
                  <span className="settings-nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="settings-body">
          <Outlet />
        </div>
      </div>
    </>
  );
}
