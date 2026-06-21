import './Socials.css';
import { useSiteContent } from '../hooks/useSiteContent';

function Socials() {
  const get = useSiteContent();

  const links = [
    { key: 'social.whatsapp.url', fallback: 'https://wa.me/256 701 924517', icon: '💬', label: 'WhatsApp', cls: 'whatsapp' },
    { key: 'social.tiktok.url', fallback: 'https://www.tiktok.com/@karorganics uganda', icon: '🎵', label: 'TikTok', cls: 'tiktok' },
    { key: 'social.instagram.url', fallback: 'https://www.instagram.com/karorganics uganda', icon: '📷', label: 'Instagram', cls: 'instagram' },
    { key: 'social.facebook.url', fallback: 'https://www.facebook.com/karorganics uganda', icon: '👍', label: 'Facebook', cls: 'facebook' },
    { key: 'social.youtube.url', fallback: 'https://www.youtube.com/@karorganics uganda', icon: '▶️', label: 'YouTube', cls: 'youtube' },
  ];

  return (
    <section className="section" id="social">
      <div className="container">
        <div className="section-heading">
          <span className="eyebrow">Marketing Channels</span>
          <h2>Follow Kar Organics</h2>
          <p>Connect with us for updates, tips, and product videos.</p>
        </div>

        <div className="social-links">
          {links.map(({ key, fallback, icon, label, cls }) => (
            <a key={key} href={get(key, fallback)} target="_blank" rel="noopener noreferrer" className={`social-link ${cls}`}>
              <span className="social-icon">{icon}</span>
              <span>{label}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Socials;