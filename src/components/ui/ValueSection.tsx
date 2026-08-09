import { useRef } from 'react';
import { Sunrise, Zap, Heart } from 'lucide-react';
import './ValueSection.css';
import { useSiteContent } from '../../hooks/useSiteContent';
import whyHerbsImg from '../../assets/why-herbs.jpg';

// Three value cards. `key` maps to the value.cardN.* content keys in the DB.
const CARDS = [
  { key: 1, icon: Sunrise, title: 'Wake Up Light & Renewed', text: 'Start your day clear-headed and refreshed - the way mornings are meant to feel.' },
  { key: 2, icon: Zap, title: 'Energy That Carries You', text: 'Steady energy that keeps you going - for your family, your work, and everything in between.' },
  { key: 4, icon: Heart, title: 'Rooted in Community', text: 'Sourced directly from East African farmers. Your wellness journey helps build theirs too.' },
];

function ValueSection() {
  const get = useSiteContent();

  const cards = CARDS.map(({ key, icon, title, text }) => ({
    icon,
    title: get(`value.card${key}.title`, title),
    text: get(`value.card${key}.text`, text),
  }));

  const bgImage = get('value.bgImage', whyHerbsImg);

  return (
    <section className="value-section" id="value">
      <div className="value-bg" style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('${bgImage}')` }} />
      <div className="value-overlay reveal reveal--fade-up">
        <div className="container">
          <div className="section-heading">
            <h2 dangerouslySetInnerHTML={{ __html: get('value.heading', "You're Not Just Buying Herbs. You're Buying Your Body's Way Back to Balance.") }} />
            <p dangerouslySetInnerHTML={{ __html: get('value.subtext', 'Every Kar Organics extract is crafted with a purpose - helping you feel like yourself again, naturally, day after day.') }} />
          </div>
          <div className="value-grid">
            {cards.map(({ icon: Icon, title, text }) => (
              <div className="value-card" key={title || text}>
                <div className="value-icon"><Icon /></div>
                <h3>{title}</h3>
                <p dangerouslySetInnerHTML={{ __html: text }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ValueSection;
