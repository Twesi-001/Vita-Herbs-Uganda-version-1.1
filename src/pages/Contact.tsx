import { useState, useEffect } from "react";
import { Mail, MapPin, MessageCircle, Send } from "lucide-react";
import { API_URL } from "../lib/api";
import "./Contact.css";

interface Product { id: number; name: string; }
interface Toast { id: number; msg: string; type: 'success' | 'error'; }

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
            <span className="eyebrow">Contact</span>
            <h1>Get In Touch</h1>
            <p className="hero-description">
              We'd love to hear from you. Send us an inquiry or reach out directly —
              we usually respond within a few hours.
            </p>
          </div>
        </div>
      </section>

      <section className="contact-main">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-form-wrapper">
              <div className="contact-card">
                <h2>Send an Inquiry</h2>
                <p className="form-subtitle">Fill in your details and we'll respond shortly.</p>

                <form onSubmit={onSubmit} className="contact-form">
                  <div className="form-grid">
                    <div className="field-group">
                      <label htmlFor="cf-name">Full Name <span className="required">*</span></label>
                      <input
                        id="cf-name"
                        type="text"
                        value={form.name}
                        onChange={e => update("name", e.target.value)}
                        placeholder="Your name"
                      />
                    </div>

                    <div className="field-group">
                      <label htmlFor="cf-phone">Phone Number <span className="required">*</span></label>
                      <input
                        id="cf-phone"
                        type="tel"
                        value={form.phone}
                        onChange={e => update("phone", e.target.value)}
                        placeholder="+256 ..."
                      />
                    </div>

                    <div className="field-group">
                      <label htmlFor="cf-email">Email (Optional)</label>
                      <input
                        id="cf-email"
                        type="email"
                        value={form.email}
                        onChange={e => update("email", e.target.value)}
                        placeholder="you@example.com"
                      />
                    </div>

                    <div className="field-group">
                      <label htmlFor="cf-product">Product of Interest <span className="required">*</span></label>
                      <select
                        id="cf-product"
                        value={form.product}
                        onChange={e => update("product", e.target.value)}
                      >
                        <option value="">Select a product...</option>
                        {products.map(p => (
                          <option key={p.id} value={p.name}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="field-group full-width">
                      <label htmlFor="cf-qty">Quantity <span className="required">*</span></label>
                      <input
                        id="cf-qty"
                        type="number"
                        min="1"
                        value={form.quantity}
                        onChange={e => update("quantity", e.target.value)}
                        placeholder="e.g. 2"
                      />
                    </div>

                    <div className="field-group full-width">
                      <label htmlFor="cf-msg">Additional Message</label>
                      <textarea
                        id="cf-msg"
                        value={form.message}
                        onChange={e => update("message", e.target.value)}
                        rows={4}
                        placeholder="Anything else we should know?"
                      />
                    </div>
                  </div>

                  <button type="submit" className="submit-btn">
                    <Send />
                    Send Inquiry
                  </button>
                </form>
              </div>
            </div>

            <div className="contact-info">
              <a href="https://wa.me/256701924517" target="_blank" rel="noreferrer" className="info-card whatsapp-card">
                <div className="info-icon"><MessageCircle /></div>
                <div className="info-content">
                  <div className="info-badge">Fastest Reply</div>
                  <div className="info-title">Chat on WhatsApp</div>
                </div>
              </a>

              <div className="info-card">
                <div className="info-icon"><Mail /></div>
                <div className="info-content">
                  <div className="info-title">Email Us</div>
                  <div className="info-lines">
                    <p>hello@karorganics.ug</p>
                    <p>support@karorganics.ug</p>
                  </div>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon"><MapPin /></div>
                <div className="info-content">
                  <div className="info-title">Visit Us</div>
                  <div className="info-lines">
                    <p>Mbarara, Western Uganda</p>
                    <p>Mon – Sat, 9am – 6pm</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ToastContainer toasts={toasts} />
    </>
  );
}

export default ContactPage;
