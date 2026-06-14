import React, { useState } from 'react';
import { Mail, CheckCircle, XCircle, Send } from 'lucide-react';
import { API_URL } from '../../lib/api';
import './NewsLetter.css';

function NewsLetter() {
  const [email, setEmail] = useState("");
  const [newsletterMsg, setNewsletterMsg] = useState<null | { type: 'success' | 'error'; text: string }>(null);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const v = email.trim();
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!re.test(v)) {
      setNewsletterMsg({ type: 'error', text: 'Please enter a valid email address.' });
      setTimeout(() => setNewsletterMsg(null), 5000);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/subscribers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: v })
      });
      const data = await response.json();
      
      if (response.ok) {
        setNewsletterMsg({ type: 'success', text: data.message || 'Thanks for subscribing!' });
        setEmail('');
        setTimeout(() => setNewsletterMsg(null), 5000);
      } else {
        setNewsletterMsg({ type: 'error', text: data.message || 'Subscription failed' });
        setTimeout(() => setNewsletterMsg(null), 5000);
      }
    } catch (error) {
      console.error('Subscription error:', error);
      setNewsletterMsg({ type: 'error', text: 'Subscription failed. Please try again.' });
      setTimeout(() => setNewsletterMsg(null), 5000);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <section className="newsletter-section">
      <div className="container">
        <div className="newsletter-card">
          <div className="newsletter-icon-wrapper">
            <Mail className="newsletter-main-icon" />
          </div>
          
          <div className="newsletter-content">
            <span className="eyebrow">Newsletter</span>
            <h2>Stay Updated with Vita Herbs</h2>
            <p>Get herbal wellness tips, new product alerts, and exclusive offers delivered to your inbox.</p>
          </div>

          <form className="newsletter-form" onSubmit={handleSubscribe}>
            <div className="input-wrapper">
              <Mail className="input-icon" />
              <input 
                type="email" 
                placeholder="Enter your email address" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Subscribing...
                </>
              ) : (
                <>
                  <Send />
                  Subscribe
                </>
              )}
            </button>
          </form>

          {newsletterMsg && (
            <div className={`newsletter-message ${newsletterMsg.type}`}>
              {newsletterMsg.type === 'success' ? (
                <CheckCircle className="message-icon" />
              ) : (
                <XCircle className="message-icon" />
              )}
              {newsletterMsg.text}
            </div>
          )}

          <p className="newsletter-note">
            No spam, ever. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
}

export default NewsLetter;