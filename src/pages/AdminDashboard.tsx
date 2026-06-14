import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

interface Subscriber {
  _id: string;
  email: string;
  subscribedAt: string;
  isActive: boolean;
}

interface Contact {
  _id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
  isFollowedUp: boolean;
}

interface Stats {
  subscribers: number;
  contacts: number;
  products: number;
}

interface LoginResponse {
  token: string;
  message?: string;
}

function AdminDashboard() {
  const [authState, setAuthState] = useState<'loading' | 'loggedout' | 'loggedin'>('loading');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [stats, setStats] = useState<Stats>({ subscribers: 0, contacts: 0, products: 0 });
  const [activeTab, setActiveTab] = useState<'subscribers' | 'contacts'>('subscribers');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const API_URL = 'https://vitaherbs-backend.onrender.com/api';

  // Load dashboard data function
  const loadDashboardData = async (token: string): Promise<void> => {
    try {
      const [statsRes, subscribersRes, contactsRes] = await Promise.all([
        fetch(`${API_URL}/admin/stats`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/admin/subscribers`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/admin/contacts`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      if (!statsRes.ok || !subscribersRes.ok || !contactsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const statsData: Stats = await statsRes.json();
      const subscribersData: Subscriber[] = await subscribersRes.json();
      const contactsData: Contact[] = await contactsRes.json();
      
      setStats(statsData);
      setSubscribers(subscribersData);
      setContacts(contactsData);
    } catch (err) {
      console.error('Failed to fetch dashboard:', err);
      setError('Failed to load dashboard data');
    }
  };

  // Check auth on mount
  useEffect(() => {
    const checkAuth = async (): Promise<void> => {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setAuthState('loggedout');
        return;
      }
      
      try {
        const response = await fetch(`${API_URL}/admin/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          await loadDashboardData(token);
          setAuthState('loggedin');
        } else {
          localStorage.removeItem('adminToken');
          setAuthState('loggedout');
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        setAuthState('loggedout');
      }
    };
    
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refresh data
  const refreshData = async (): Promise<void> => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      await loadDashboardData(token);
    }
  };

  // Login handler - using React.FormEvent (not deprecated, it's the correct one)
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data: LoginResponse = await response.json();
      
      if (response.ok && data.token) {
        localStorage.setItem('adminToken', data.token);
        await loadDashboardData(data.token);
        setAuthState('loggedin');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login failed:', err);
      setError('Connection failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Export CSV
  const exportCSV = (type: 'subscribers' | 'contacts'): void => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      window.open(`${API_URL}/admin/export/${type}?token=${token}`, '_blank');
    }
  };

  // Delete item
  const deleteItem = async (type: 'subscribers' | 'contacts', id: string): Promise<void> => {
    const token = localStorage.getItem('adminToken');
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const response = await fetch(`${API_URL}/admin/${type}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        await refreshData();
      } else {
        throw new Error('Delete failed');
      }
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Delete failed');
    }
  };

  // Logout
  const handleLogout = (): void => {
    localStorage.removeItem('adminToken');
    setAuthState('loggedout');
    setSubscribers([]);
    setContacts([]);
    setStats({ subscribers: 0, contacts: 0, products: 0 });
  };

  // Loading state
  if (authState === 'loading') {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Login screen
  if (authState === 'loggedout') {
    return (
      <div className="admin-login">
        <div className="login-card">
          <h1>VitaHerbs Admin</h1>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
            />
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
            {error && <p className="error">{error}</p>}
          </form>
        </div>
      </div>
    );
  }

  // Dashboard
  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <h1>📊 VitaHerbs Marketing Dashboard</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </header>

      <div className="stats-cards">
        <div className="stat-card">
          <span className="stat-icon">📧</span>
          <div>
            <h3>{stats.subscribers}</h3>
            <p>Subscribers</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">💬</span>
          <div>
            <h3>{stats.contacts}</h3>
            <p>Contact Inquiries</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">📦</span>
          <div>
            <h3>{stats.products}</h3>
            <p>Products</p>
          </div>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={activeTab === 'subscribers' ? 'active' : ''}
          onClick={() => setActiveTab('subscribers')}
        >
          Subscribers ({subscribers.length})
        </button>
        <button 
          className={activeTab === 'contacts' ? 'active' : ''}
          onClick={() => setActiveTab('contacts')}
        >
          Contact Inquiries ({contacts.length})
        </button>
      </div>

      <div className="data-table-container">
        <div className="table-header">
          <h2>{activeTab === 'subscribers' ? 'Newsletter Subscribers' : 'Customer Messages'}</h2>
          <button onClick={() => exportCSV(activeTab)} className="export-btn">
            📥 Export CSV
          </button>
        </div>

        {activeTab === 'subscribers' ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Subscribed Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((sub: Subscriber) => (
                <tr key={sub._id}>
                  <td>{sub.email}</td>
                  <td>{new Date(sub.subscribedAt).toLocaleDateString()}</td>
                  <td>{sub.isActive ? '✅ Active' : '❌ Inactive'}</td>
                  <td>
                    <button onClick={() => deleteItem('subscribers', sub._id)} className="delete-btn">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {subscribers.length === 0 && (
                <tr key="no-subscribers">
                  <td colSpan={4} style={{ textAlign: 'center' }}>No subscribers yet</td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Message</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact: Contact) => (
                <tr key={contact._id}>
                  <td>{contact.name}</td>
                  <td>{contact.email}</td>
                  <td>{contact.message.substring(0, 60)}...</td>
                  <td>{new Date(contact.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => deleteItem('contacts', contact._id)} className="delete-btn">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {contacts.length === 0 && (
                <tr key="no-contacts">
                  <td colSpan={5} style={{ textAlign: 'center' }}>No contacts yet</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;