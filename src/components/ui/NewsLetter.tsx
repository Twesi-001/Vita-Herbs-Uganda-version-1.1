import React, { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { API_URL } from '../../lib/api';
import newsletterIcon from '../../assets/newsletter-icon.svg';
import './NewsLetter.css';

function NewsLetter() {
  const [email, setEmail] = useState('');
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
        body: JSON.stringify({ email: v }),
      });
      const data = await response.json();
      if (response.ok) {
        setNewsletterMsg({ type: 'success', text: data.message || 'Thanks for subscribing!' });
        setEmail('');
      } else {
        setNewsletterMsg({ type: 'error', text: data.message || 'Subscription failed.' });
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
    <section className="nl-banner">
      <div className="container">
        <div className="nl-inner">

          <div className="nl-left">
            <img src={newsletterIcon} alt="" aria-hidden="true" className="nl-icon" />
            <div className="nl-copy">
              <h2>Sign Up To Newsletter</h2>
              <p>Join our mailing list and stay up to date on new products, special offers, discounts, and much more!</p>
            </div>
          </div>

          <div className="nl-right">
            <form className="nl-form" onSubmit={handleSubscribe}>
              <div className="nl-input-pill">
                <input
                  type="email"
                  placeholder="Your email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  aria-label="Email address"
                />
                <button type="submit" disabled={loading}>
                  {loading ? <span className="nl-spinner" /> : null}
                  {loading ? 'Subscribing…' : 'Subscribe'}
                </button>
              </div>
            </form>

            {newsletterMsg && (
              <div className={`nl-message ${newsletterMsg.type}`}>
                {newsletterMsg.type === 'success' ? <CheckCircle size={15} /> : <XCircle size={15} />}
                {newsletterMsg.text}
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}

export default NewsLetter;
