
import { useState } from "react";
import { Mail, MapPin, MessageCircle, Send } from "lucide-react";
import { API_URL } from "../lib/api";
import "./Contact.css";

// Simple toast implementation since you don't have sonner set up
const toast = {
  success: (msg: string) => {
    const toastEl = document.createElement('div');
    toastEl.className = 'toast-success';
    toastEl.textContent = msg;
    document.body.appendChild(toastEl);
    setTimeout(() => toastEl.remove(), 3000);
  },
  error: (msg: string) => {
    const toastEl = document.createElement('div');
    toastEl.className = 'toast-error';
    toastEl.textContent = msg;
    document.body.appendChild(toastEl);
    setTimeout(() => toastEl.remove(), 3000);
  }
};

function ContactPage() {
  const [form, setForm] = useState({
    name: "", phone: "", email: "", product: "", quantity: "", message: ""
  });

  const products = [
    { id: 1, name: "kar Detox Extract" },
    { id: 2, name: "kar Immune Boost" },
    { id: 3, name: "kar Joint Relief" },
    { id: 4, name: "kar Energy Complex" },
  ];

  function update(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.phone || !form.product || !form.quantity) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Save the inquiry to the backend (best-effort - the WhatsApp handoff
    // still happens even if the API is unreachable).
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
      "New inquiry from KarOrganicswebsite:",
      `Name: ${form.name}`,
      `Phone: ${form.phone}`,
      form.email ? `Email: ${form.email}` : null,
      `Product: ${form.product}`,
      `Quantity: ${form.quantity}`,
      form.message ? `Message: ${form.message}` : null,
    ].filter(Boolean);

    const url = `https://wa.me/256 701 924517?text=${encodeURIComponent(lines.join("\n"))}`;
    window.open(url, "_blank", "noopener,noreferrer");

    toast.success("Inquiry sent! Opening WhatsApp...");
    setForm({ name: "", phone: "", email: "", product: "", quantity: "", message: "" });
  }

  return (
    <>
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="container">
          <div className="contact-hero-content">
            <span className="eyebrow">Contact</span>
            <h1>Get In Touch</h1>
            <p className="hero-description">
              We'd love to hear from you. Send us an inquiry or reach out directly -
              we usually respond within a few hours.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="contact-main">
        <div className="container">
          <div className="contact-grid">
            {/* Form Section */}
            <div className="contact-form-wrapper">
              <div className="contact-card">
                <h2>Send an Inquiry</h2>
                <p className="form-subtitle">Fill in your details and we'll respond shortly.</p>

                <form onSubmit={onSubmit} className="contact-form">
                  <div className="form-grid">
                    <div className="field-group">
                      <label>Full Name <span className="required">*</span></label>
                      <input 
                        type="text"
                        value={form.name} 
                        onChange={(e) => update("name", e.target.value)} 
                        placeholder="Your name"
                      />
                    </div>

                    <div className="field-group">
                      <label>Phone Number <span className="required">*</span></label>
                      <input 
                        type="tel"
                        value={form.phone} 
                        onChange={(e) => update("phone", e.target.value)} 
                        placeholder="+256 ..."
                      />
                    </div>

                    <div className="field-group">
                      <label>Email (Optional)</label>
                      <input 
                        type="email"
                        value={form.email} 
                        onChange={(e) => update("email", e.target.value)} 
                        placeholder="you@example.com"
                      />
                    </div>

                    <div className="field-group">
                      <label>Product of Interest <span className="required">*</span></label>
                      <select 
                        value={form.product} 
                        onChange={(e) => update("product", e.target.value)}
                      >
                        <option value="">Select a product...</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.name}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="field-group full-width">
                      <label>Quantity <span className="required">*</span></label>
                      <input 
                        type="text"
                        value={form.quantity} 
                        onChange={(e) => update("quantity", e.target.value)} 
                        placeholder="e.g. 2"
                      />
                    </div>

                    <div className="field-group full-width">
                      <label>Additional Message</label>
                      <textarea 
                        value={form.message} 
                        onChange={(e) => update("message", e.target.value)} 
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

            {/* Info Sidebar */}
            <div className="contact-info">
              <a href="https://wa.me/256 701 924517" target="_blank" rel="noreferrer" className="info-card whatsapp-card">
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
                    <p>hello@karorganics .ug</p>
                    <p>support@karorganics .ug</p>
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

      <style>{`
        .spinner {
          animation: spin 1s linear infinite;
          width: 16px;
          height: 16px;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .toast-success, .toast-error {
          position: fixed;
          bottom: 20px;
          right: 20px;
          padding: 12px 24px;
          border-radius: 8px;
          color: white;
          z-index: 10000;
          animation: slideIn 0.3s ease;
        }
        .toast-success { background: #2e7d32; }
        .toast-error { background: #dc2626; }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </>
  );
}

export default ContactPage;