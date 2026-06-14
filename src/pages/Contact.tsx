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
    toastEl.className = 'contact-toast-success';
    toastEl.textContent = msg;
    document.body.appendChild(toastEl);
    setTimeout(() => toastEl.remove(), 3000);
  },
  error: (msg: string): void => {
    const toastEl = document.createElement('div');
    toastEl.className = 'contact-toast-error';
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

  const products: Product[] = [
    { id: 1, name: "Vita Detox Extract" },
    { id: 2, name: "Vita Immune Boost" },
    { id: 3, name: "Vita Joint Relief" },
    { id: 4, name: "Vita Energy Complex" },
  ];

  const update = (k: keyof FormData, v: string): void => {
    setForm((prev: FormData) => ({ ...prev, [k]: v }));
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    update(name as keyof FormData, value);
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    
    if (!form.name || !form.phone || !form.product || !form.quantity) {
      toast.error("Please fill in all required fields");
      return;
    }

    const lines: string[] = [
      "New inquiry from VitaHerbs website:",
      `Name: ${form.name}`,
      `Phone: ${form.phone}`,
      ...(form.email ? [`Email: ${form.email}`] : []),
      `Product: ${form.product}`,
      `Quantity: ${form.quantity}`,
      ...(form.message ? [`Message: ${form.message}`] : []),
    ];

    const url = `https://wa.me/256760108564?text=${encodeURIComponent(lines.join("\n"))}`;
    window.open(url, "_blank", "noopener,noreferrer");

    toast.success("Opening WhatsApp to send your inquiry...");
    setForm({ name: "", phone: "", email: "", product: "", quantity: "", message: "" });
  };

  return (
    <section className="contact-section">
      <div className="contact-container">
        {/* Centered Header */}
        <div className="contact-header">
          <span className="contact-eyebrow">Contact Us</span>
          <h1>Get In Touch</h1>
          <p>We'd love to hear from you. Send us a message and we'll respond within 24 hours.</p>
        </div>

        {/* Form Container */}
        <div className="contact-form-container">
          <form onSubmit={onSubmit} className="contact-form">
            <div className="contact-form-group">
              <label>Full Name <span className="contact-required">*</span></label>
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={form.name}
                onChange={handleChange}
              />
            </div>

            <div className="contact-form-group">
              <label>Phone Number <span className="contact-required">*</span></label>
              <input
                type="tel"
                name="phone"
                placeholder="Enter your phone number"
                value={form.phone}
                onChange={handleChange}
              />
            </div>

            <div className="contact-form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email address"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div className="contact-form-group">
              <label>Product <span className="contact-required">*</span></label>
              <select 
                name="product"
                value={form.product} 
                onChange={handleChange}
              >
                <option value="">Select a product</option>
                {products.map((p: Product) => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="contact-form-group">
              <label>Quantity <span className="contact-required">*</span></label>
              <input
                type="text"
                name="quantity"
                placeholder="Enter quantity"
                value={form.quantity}
                onChange={handleChange}
              />
            </div>

            <div className="contact-form-group contact-full-width">
              <label>Additional Message</label>
              <textarea
                name="message"
                placeholder="Enter your message here..."
                value={form.message}
                onChange={handleChange}
                rows={4}
              />
            </div>

            <div className="contact-submit-container">
              <button type="submit" className="contact-submit-btn">
                <Send size={18} />
                Send Inquiry
              </button>
            </div>
          </form>
        </div>

        {/* Bottom Center Actions */}
        <div className="contact-actions">
          <a href="mailto:hello@vitaherbs.ug">
            <Mail size={18} />
            hello@vitaherbs.ug
          </a>
          <a href="https://wa.me/256760108564" target="_blank" rel="noopener noreferrer">
            <MessageCircle size={18} />
            WhatsApp Us
          </a>
        </div>
      </div>
    </section>
  );
}

export default ContactPage;