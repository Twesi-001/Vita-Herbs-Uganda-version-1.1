import React, { useState } from 'react';
import './Contact.css';

interface FetchError extends Error {
  name: string;
}

function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    try {
      const response = await fetch('https://vitaherbs-backend.onrender.com/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const data = await response.json() as { message: string };
      
      if (response.ok) {
        setStatus({ type: 'success', text: 'Message sent! We\'ll contact you soon.' });
        setFormData({ name: '', email: '', message: '' });
      } else {
        setStatus({ type: 'error', text: data.message || 'Failed to send message' });
      }
    } catch (err) {
      clearTimeout(timeoutId);
      console.error('Fetch error:', err);
      
      const error = err as FetchError;
      if (error.name === 'AbortError') {
        setStatus({ type: 'error', text: 'Request timeout. Server is waking up. Please try again.' });
      } else {
        setStatus({ type: 'error', text: 'Unable to connect. Please try again.' });
      }
    } finally {
      setLoading(false);
      setTimeout(() => setStatus(null), 5000);
    }
  };

  return (
    <section className="section" id="contact">
      <div className="container contact-box">
        <div>
          <span className="eyebrow">Contact</span>
          <h2>Talk to us today</h2>
          <p>For product questions, orders, and support, contact us directly.</p>
        </div>

        <form onSubmit={handleSubmit} className="contact-form">
          <input
            type="text"
            placeholder="Your Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            disabled={loading}
          />
          <input
            type="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            disabled={loading}
          />
          <textarea
            placeholder="Your Message"
            rows={4}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            required
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>

        {status && (
          <div className={`contact-message ${status.type}`}>
            {status.text}
          </div>
        )}

        <div className="contact-actions">
          <a href="mailto:info@vitaherbs.com">info@vitaherbs.com</a>
          <a href="whatsapp://send?phone=256760108564" rel="noopener noreferrer">Chat on WhatsApp</a>
        </div>
      </div>
    </section>
  );
}

export default Contact;