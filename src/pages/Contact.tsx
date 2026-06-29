import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../lib/api";
import "./Contact.css";

interface Product { id: number; name: string; }
interface Toast { id: number; msg: string; type: 'success' | 'error'; }

/* Exact Font Awesome solid icons matching the themeforest reference */
function IconMapMarker() {
  return (
    <svg viewBox="0 0 384 512" fill="currentColor" aria-hidden="true">
      <path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z" />
    </svg>
  );
}
function IconEnvelopeOpen() {
  return (
    <svg viewBox="0 0 512 512" fill="currentColor" aria-hidden="true">
      <path d="M512 464c0 26.51-21.49 48-48 48H48c-26.51 0-48-21.49-48-48V200.724a48 48 0 0 1 18.387-37.776c24.913-19.529 45.501-35.365 164.2-121.511C199.412 29.17 232.797-.347 256 .003c23.197-.348 56.596 29.172 73.413 41.433 118.687 86.137 139.303 101.995 164.2 121.512A48 48 0 0 1 512 200.724V464zm-65.666-196.605c-2.563-3.728-7.7-4.595-11.339-1.907-22.845 16.873-55.462 40.705-105.582 77.079-16.825 12.262-50.21 41.781-73.413 41.43-23.211.351-56.6-29.172-73.413-41.43-50.114-36.37-82.734-60.204-105.582-77.079-3.639-2.688-8.776-1.821-11.339 1.907l-9.072 13.196a8 8 0 0 0 1.965 11.122c22.928 16.943 55.471 40.705 105.42 76.954 20.674 15.076 57.755 48.788 92.021 48.6 34.272.188 71.357-33.529 92.021-48.6 49.948-36.249 82.491-60.011 105.42-76.954a8 8 0 0 0 1.965-11.122l-9.072-13.196z" />
    </svg>
  );
}
function IconMobile() {
  return (
    <svg viewBox="0 0 320 512" fill="currentColor" aria-hidden="true">
      <path d="M272 0H48C21.5 0 0 21.5 0 48v416c0 26.5 21.5 48 48 48h224c26.5 0 48-21.5 48-48V48c0-26.5-21.5-48-48-48zM160 480c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32zm112-108c0 6.6-5.4 12-12 12H60c-6.6 0-12-5.4-12-12V60c0-6.6 5.4-12 12-12h200c6.6 0 12 5.4 12 12v312z" />
    </svg>
  );
}
function IconPaperPlane() {
  return (
    <svg viewBox="0 0 512 512" fill="currentColor" aria-hidden="true">
      <path d="M476 3.2L12.5 270.6c-18.1 10.4-15.8 35.6 2.2 43.2L121 358.4l287.3-253.2c5.5-4.9 13.3 2.6 8.6 8.3L176 407v80.5c0 23.6 28.5 32.9 42.5 15.8L282 426l124.6 52.2c14.2 6 30.4-2.9 33-18.2l72-432C515 7.8 493.3-6.8 476 3.2z" />
    </svg>
  );
}

function ToastContainer({ toasts }: { toasts: Toast[] }) {
  if (!toasts.length) return null;
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast--${t.type}`}>{t.msg}</div>
      ))}
    </div>
  );
}

function ContactPage() {
  const [form, setForm] = useState({
    name: "", phone: "", email: "", product: "", quantity: "", message: ""
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/products`)
      .then(r => r.json())
      .then((data: Product[]) => setProducts(data))
      .catch(() => {});
  }, []);

  function addToast(msg: string, type: 'success' | 'error') {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }

  function update(k: string, v: string) {
    setForm(f => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.phone || !form.product || !form.quantity) {
      addToast("Please fill in all required fields", "error");
      return;
    }

    try {
      await fetch(`${API_URL}/inquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } catch (err) {
      console.error("Failed to save inquiry:", err);
    }

    const lines = [
      "New inquiry from KarOrganics website:",
      `Name: ${form.name}`,
      `Phone: ${form.phone}`,
      form.email ? `Email: ${form.email}` : null,
      `Product: ${form.product}`,
      `Quantity: ${form.quantity}`,
      form.message ? `Message: ${form.message}` : null,
    ].filter(Boolean);

    const url = `https://wa.me/256701924517?text=${encodeURIComponent(lines.join("\n"))}`;
    window.open(url, "_blank", "noopener,noreferrer");

    addToast("Inquiry sent! Opening WhatsApp...", "success");
    setForm({ name: "", phone: "", email: "", product: "", quantity: "", message: "" });
  }

  return (
    <>
      <section className="contact-hero">
        <div className="container">
          <div className="contact-hero-content">
            <div className="hero-text">
              <h1>Get In Touch</h1>
            </div>
            <nav className="hero-breadcrumb" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span className="sep">·</span>
              <span className="current">Contact</span>
            </nav>
          </div>
        </div>
      </section>

      <section className="contact-main">
        <div className="container">
          <div className="contact-grid">

            {/* ── Form (left) ── */}
            <div className="contact-form-col">
              <h3 className="form-heading">Let's Make The World Better, Together</h3>
              <p className="form-intro">
                Interested in our herbal products? Send us an inquiry and we'll get back to you
                shortly - or reach out directly on WhatsApp for a faster response.
              </p>
              <form onSubmit={onSubmit} className="contact-form">
                <div className="cf-field">
                  <input type="text" value={form.name} onChange={e => update("name", e.target.value)} placeholder="Name" />
                </div>
                <div className="cf-field">
                  <input type="email" value={form.email} onChange={e => update("email", e.target.value)} placeholder="Email" />
                </div>
                <div className="cf-field">
                  <input type="tel" value={form.phone} onChange={e => update("phone", e.target.value)} placeholder="Phone *" />
                </div>
                <div className="cf-field">
                  <select value={form.product} onChange={e => update("product", e.target.value)}>
                    <option value="">Product of Interest *</option>
                    {products.map(p => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="cf-field">
                  <input type="number" min="1" value={form.quantity} onChange={e => update("quantity", e.target.value)} placeholder="Quantity *" />
                </div>
                <div className="cf-field">
                  <textarea value={form.message} onChange={e => update("message", e.target.value)} rows={5} placeholder="Tell Us About Your Order *" />
                </div>
                <button type="submit" className="submit-btn">
                  Send Message <IconPaperPlane />
                </button>
              </form>
            </div>

            {/* ── Address info (right) ── */}
            <div className="address-info">
              <div className="addr-card">
                <span className="addr-icon"><IconMobile /></span>
                <p>Call / WhatsApp<span>+256 701 924 517</span></p>
              </div>
              <div className="addr-card">
                <span className="addr-icon"><IconEnvelopeOpen /></span>
                <p>Send Us Mail<span>hello@karorganics.ug</span></p>
              </div>
              <div className="addr-card">
                <span className="addr-icon"><IconMapMarker /></span>
                <p>Our Location<span>Kampala, Central Uganda</span></p>
              </div>
            </div>

          </div>
        </div>
      </section>

      <section className="contact-map">
        <iframe
          title="KarOrganics Uganda location"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d255282.35055956347!2d32.4699899!3d0.3475964!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x177dbc0f9d74e8b9%3A0x4a8c0e2a6e7e6b0a!2sKampala%2C%20Uganda!5e0!3m2!1sen!2sug!4v1700000000000"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </section>

      <ToastContainer toasts={toasts} />
    </>
  );
}

export default ContactPage;
