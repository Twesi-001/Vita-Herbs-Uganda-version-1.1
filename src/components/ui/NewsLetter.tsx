import React, { useState } from 'react';
import { Mail, Send, CheckCircle, XCircle, Lock, Leaf, Bell, Tag } from 'lucide-react';
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
      } else {
        setNewsletterMsg({ type: 'error', text: data.message || 'Subscription failed' });
      }
      setTimeout(() => setNewsletterMsg(null), 5000);
    } catch {
      setNewsletterMsg({ type: 'error', text: 'Subscription failed. Please try again.' });
      setTimeout(() => setNewsletterMsg(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="newsletter-section">
      <div className="container">
        <div className="newsletter-inner">

          <div className="newsletter-left">
            <div className="newsletter-icon-badge-row">
              <div className="newsletter-icon-wrapper">
                <Mail size={28} />
              </div>
              <span className="newsletter-eyebrow">Newsletter</span>
            </div>
            <h2>Stay in the Loop</h2>
            <p>Herbal wellness tips, new arrivals, and subscriber-only offers — straight to your inbox.</p>

            <ul className="newsletter-perks">
              <li><Leaf size={15} /><span>New product launches</span></li>
              <li><Bell size={15} /><span>Wellness guides &amp; tips</span></li>
              <li><Tag size={15} /><span>Exclusive subscriber offers</span></li>
            </ul>
          </div>

          <div className="newsletter-right">
            <form className="newsletter-form" onSubmit={handleSubscribe}>
              <label htmlFor="nl-email">Your email address</label>
              <div className="newsletter-input-row">
                <div className="input-wrapper">
                  <Mail size={17} className="input-icon" />
                  <input
                    id="nl-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <button type="submit" disabled={loading}>
                  {loading ? (
                    <><span className="nl-spinner" />Subscribing…</>
                  ) : (
                    <><Send size={15} />Subscribe</>
                  )}
                </button>
              </div>
            </form>

            {newsletterMsg && (
              <div className={`newsletter-message ${newsletterMsg.type}`}>
                {newsletterMsg.type === 'success'
                  ? <CheckCircle size={16} />
                  : <XCircle size={16} />}
                {newsletterMsg.text}
              </div>
            )}

            <p className="newsletter-note">
              <Lock size={12} />
              No spam, ever. Unsubscribe anytime.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}

export default NewsLetter;
