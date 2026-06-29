import { Package, Users, CalendarCheck, ShoppingBag } from 'lucide-react';
import './StatsSection.css';

const STATS = [
  { icon: <Package size={32} />, value: '5+',   label: 'Herbal Products' },
  { icon: <Users size={32} />,   value: '100+', label: 'Happy Customers' },
  { icon: <CalendarCheck size={32} />, value: '1+', label: 'Year in Business' },
  { icon: <ShoppingBag size={32} />, value: '50+', label: 'Orders Fulfilled' },
];

export default function StatsSection() {
  return (
    <section className="stats-section">
      <div className="container stats-grid">

        <div className="stats-image-wrap">
          <img src="/assets/product-detox.jpg" alt="Kar Organics herbal products" />
        </div>

        <div className="stats-content">
          <span className="eyebrow">Our Impact</span>
          <h2>Trusted Natural Wellness, Right Here in Uganda</h2>
          <p>We're a growing herbal company committed to bringing you safe, effective, and natural extract-based products — delivered with care and speed.</p>

          <div className="stats-cards">
            {STATS.map(({ icon, value, label }) => (
              <div key={label} className="stat-card">
                <span className="stat-icon">{icon}</span>
                <strong className="stat-value">{value}</strong>
                <span className="stat-label">{label}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
