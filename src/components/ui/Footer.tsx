
import { Link } from 'react-router-dom';
import { Leaf,  Mail, Phone, MapPin } from 'lucide-react';
import './Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-section">
            <div className="footer-logo">
              <Leaf className="footer-logo-icon" />
              <span>KarOrganics<span className="logo-region">Uganda</span></span>
            </div>
            <p>Premium herbal extracts for holistic wellness. Trusted by thousands across Uganda.</p>
            <div className="social-links">
              <a href="https://wa.me/256760108564" target="_blank" rel="noopener noreferrer">💬 WhatsApp</a>
              <a href="https://www.instagram.com/vitaherbsuganda" target="_blank" rel="noopener noreferrer">📷 Instagram</a>
              <a href="https://www.facebook.com/vitaherbsuganda" target="_blank" rel="noopener noreferrer">👍 Facebook</a>
            </div>
          </div>
          
          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/products">Products</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/social">Socials</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>Contact Info</h3>
            <ul className="contact-info">
              <li><Phone /> +256 760 108564</li>
              <li><Mail /> hello@vitaherbs.ug</li>
              <li><MapPin /> Mbarara, Western Uganda</li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>Working Hours</h3>
            <ul>
              <li>Monday - Friday: 9am - 6pm</li>
              <li>Saturday: 10am - 4pm</li>
              <li>Sunday: Closed</li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {currentYear} KarOrganicsUganda. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;