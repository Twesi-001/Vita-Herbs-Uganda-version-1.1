import { useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { Mail, MessageCircle, Send } from "lucide-react";
import "./Contact.css";
// Type definitions
interface FormData {
  name: string;
  phone: string;
  email: string;
  product: string;
  quantity: string;
  message: string;
}

interface Product {
  id: number;
  name: string;
}

const toast = {
  success: (msg: string): void => {
    const toastEl = document.createElement('div');
    toastEl.className = 'toast-success';
    toastEl.textContent = msg;
    document.body.appendChild(toastEl);
    setTimeout(() => toastEl.remove(), 3000);
  },
  error: (msg: string): void => {
    const toastEl = document.createElement('div');
    toastEl.className = 'toast-error';
    toastEl.textContent = msg;
    document.body.appendChild(toastEl);
    setTimeout(() => toastEl.remove(), 3000);
  },
  info: (msg: string): void => {
    const toastEl = document.createElement('div');
    toastEl.className = 'toast-info';
    toastEl.textContent = msg;
    document.body.appendChild(toastEl);
    setTimeout(() => toastEl.remove(), 3000);
  }
};

function ContactPage() {
  const [form, setForm] = useState<FormData>({
    name: "", 
    phone: "", 
    email: "", 
    product: "", 
    quantity: "", 
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const products: Product[] = [
    { id: 1, name: "Vita Detox Extract" },
    { id: 2, name: "Vita Immune Boost" },
    { id: 3, name: "Vita Joint Relief" },
    { id: 4, name: "Vita Energy Complex" },
  ];

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!form.name || !form.phone || !form.product || !form.quantity) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    toast.info("Preparing your inquiry...");

    // Prepare WhatsApp message
    const lines: string[] = [
      "🌿 *New inquiry from VitaHerbs website*",
      "",
      "📋 *Customer Details:*",
      `👤 Name: ${form.name}`,
      `📞 Phone: ${form.phone}`,
      ...(form.email ? [`✉️ Email: ${form.email}`] : []),
      "",
      "🛍️ *Order Details:*",
      `📦 Product: ${form.product}`,
      `🔢 Quantity: ${form.quantity}`,
      ...(form.message ? ["", "💬 *Message:*", form.message] : []),
    ];

    const url = `https://wa.me/256760108564?text=${encodeURIComponent(lines.join("\n"))}`;
    window.open(url, "_blank", "noopener,noreferrer");

    toast.success("Opening WhatsApp to send your inquiry...");
    
    // Reset form
    setForm({ name: "", phone: "", email: "", product: "", quantity: "", message: "" });
    setIsSubmitting(false);
  };

  return (
    <div className="contact-wrapper">
      <div className="contact-page">
        {/* Header */}
        <div className="contact-header">
          <span className="contact-badge">Contact Us</span>
          <h1>Get In Touch</h1>
          <p>We'd love to hear from you. Send us a message and we'll respond within 24 hours.</p>
        </div>

        {/* Form */}
        <div className="contact-card">
          <form onSubmit={onSubmit} className="contact-form">
            <div className="form-row">
              <div className="form-group">
                <label>Full Name <span className="required">*</span></label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone Number <span className="required">*</span></label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter your phone number"
                  value={form.phone}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email address"
                  value={form.email}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-group">
                <label>Product <span className="required">*</span></label>
                <select 
                  name="product"
                  value={form.product} 
                  onChange={handleChange}
                  disabled={isSubmitting}
                  required
                >
                  <option value="">Select a product</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Quantity <span className="required">*</span></label>
                <input
                  type="text"
                  name="quantity"
                  placeholder="Enter quantity (e.g., 2, 5, 10)"
                  value={form.quantity}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="form-group">
                <label>Additional Message</label>
                <textarea
                  name="message"
                  placeholder="Tell us more about your needs or questions..."
                  value={form.message}
                  onChange={handleChange}
                  rows={3}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  Sending...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Send Inquiry
                </>
              )}
            </button>
          </form>
        </div>

        {/* Contact Actions */}
        <div className="contact-actions">
          <a href="mailto:hello@vitaherbs.ug" className="action-link email-link">
            <Mail size={18} />
            hello@vitaherbs.ug
          </a>
          <a href="https://wa.me/256760108564" target="_blank" rel="noopener noreferrer" className="action-link whatsapp-link">
            <MessageCircle size={18} />
            WhatsApp Us
          </a>
        </div>
      </div>

     
    </div>
  );
}

export default ContactPage;