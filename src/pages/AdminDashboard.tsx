import React, { useState, useEffect } from 'react';
import { API_URL } from '../lib/api';
import './AdminDashboard.css';

interface Subscriber {
  id: number;
  email: string;
  created_at: string;
}

interface Contact {
  id: number;
  name: string;
  email: string | null;
  phone: string;
  product: string;
  quantity: string;
  message: string | null;
  created_at: string;
}

interface Stats {
  subscribers: number;
  contacts: number;
  products: number;
}

function AdminDashboard() {
  const [authState, setAuthState] = useState<'loading' | 'loggedout' | 'loggedin'>('loading');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [stats, setStats] = useState<Stats>({ subscribers: 0, contacts: 0, products: 0 });
  const [activeTab, setActiveTab] = useState<'subscribers' | 'contacts'>('subscribers');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load dashboard data function - DECLARED FIRST
  const loadDashboardData = async (token: string) => {
    try {
      const [statsRes, subscribersRes, contactsRes] = await Promise.all([
        fetch(`${API_URL}/admin/stats`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/admin/subscribers`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/admin/contacts`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      const statsData = await statsRes.json();
      const subscribersData = await subscribersRes.json();
      const contactsData = await contactsRes.json();
      
      setStats(statsData);
      setSubscribers(subscribersData);
      setContacts(contactsData);
    } catch (err) {
      console.error('Failed to fetch dashboard:', err);
      setError('Failed to load dashboard data');
    }
  };

  // Check auth on mount only - NOW loadDashboardData is defined
  useEffect(() => {
    const checkAuth = async () => {
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        setAuthState('loggedout');
      }
    };
    
    checkAuth();
  }, []);

  // Refresh data
  const refreshData = async () => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      await loadDashboardData(token);
    }
  };

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('adminToken', data.token);
        await loadDashboardData(data.token);
        setAuthState('loggedin');
      } else {
        setError(data.message || 'Login failed');
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError('Connection failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Export CSV
  const exportCSV = async (type: 'subscribers' | 'contacts') => {
    const token = localStorage.getItem('adminToken');
    window.open(`${API_URL}/admin/export/${type}?token=${token}`, '_blank');
  };

  // Delete item
  const deleteItem = async (type: 'subscribers' | 'contacts', id: number) => {
    const token = localStorage.getItem('adminToken');
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      await fetch(`${API_URL}/admin/${type}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      await refreshData();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      alert('Delete failed');
    }
  };

  // Logout
  const handleLogout = () => {
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
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((sub) => (
                <tr key={sub.id}>
                  <td>{sub.email}</td>
                  <td>{new Date(sub.created_at).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => deleteItem('subscribers', sub.id)} className="delete-btn">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {subscribers.length === 0 && (
                <tr><td colSpan={3}>No subscribers yet</td></tr>
              )}
            </tbody>
          </table>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Product</th>
                <th>Message</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact.id}>
                  <td>{contact.name}</td>
                  <td>{contact.phone}</td>
                  <td>{contact.product}</td>
                  <td>{contact.message ? `${contact.message.substring(0, 60)}…` : '—'}</td>
                  <td>{new Date(contact.created_at).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => deleteItem('contacts', contact.id)} className="delete-btn">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {contacts.length === 0 && (
                <tr><td colSpan={6}>No contacts yet</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;