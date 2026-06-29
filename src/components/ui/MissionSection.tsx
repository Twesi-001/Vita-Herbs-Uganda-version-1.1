import { Link } from 'react-router-dom';
import { useSiteContent } from '../../hooks/useSiteContent';
import '../../pages/About.css';

export default function MissionSection() {
  const get = useSiteContent();

  return (
    <section className="about-mission">
      <div className="container">
        <div className="section-header">
          <h2>Our Mission</h2>
          <p>We are committed to making natural herbal wellness accessible, affordable, and trustworthy for every household in Uganda and beyond.</p>
        </div>
        <div className="mission-grid">
          <div className="mission-card">
            <div className="mission-icon"><i className="flaticon-droplet" /></div>
            <h4>{get('about.pillar1.title', 'Purity')}</h4>
            <p>{get('about.pillar1.body', 'Only single-origin, ethically harvested herbs make it into our products. No additives, no shortcuts.')}</p>
            <Link to="/products" className="read-more">Learn More <span>›</span></Link>
          </div>
          <div className="mission-card">
            <div className="mission-icon"><i className="flaticon-heart" /></div>
            <h4>{get('about.pillar2.title', 'Wellness')}</h4>
            <p>{get('about.pillar2.body', 'Every product is crafted to support your holistic health - from immunity to energy, digestion and beyond.')}</p>
            <Link to="/products" className="read-more">Learn More <span>›</span></Link>
          </div>
          <div className="mission-card">
            <div className="mission-icon"><i className="flaticon-solidarity" /></div>
            <h4>{get('about.pillar3.title', 'Community')}</h4>
            <p>{get('about.pillar3.body', 'Fair partnerships with local Ugandan farmers ensure sustainable sourcing and shared prosperity.')}</p>
            <Link to="/products" className="read-more">Learn More <span>›</span></Link>
          </div>
        </div>
      </div>
    </section>
  );
}
