import { Sunrise, Zap, ShieldCheck, Heart } from 'lucide-react';
import './ValueSection.css';
import { useSiteContent } from '../../hooks/useSiteContent';

const icons = [Sunrise, Zap, ShieldCheck, Heart];

const CARD_DEFAULTS = [
  { title: 'Wake Up Light & Renewed', text: 'Start your day clear-headed and refreshed - the way mornings are meant to feel.' },
  { title: 'Energy That Carries You', text: 'Steady energy that keeps you going - for your family, your work, and everything in between.' },
  { title: 'Trust in Every Drop', text: "Single-origin herbs, nothing hidden. Know exactly what's going into your body, every time." },
  { title: 'Rooted in Community', text: 'Sourced directly from East African farmers. Your wellness journey helps build theirs too.' },
];

function ValueSection() {
  const get = useSiteContent();

  const cards = [1, 2, 3, 4].map((n, i) => ({
    icon: icons[i],
    title: get(`value.card${n}.title`, CARD_DEFAULTS[i].title),
    text: get(`value.card${n}.text`, CARD_DEFAULTS[i].text),
  }));

  return (
    <section className="section value-section" id="value">
      <div className="container">
        <div className="section-heading">
          <span className="eyebrow">Why It Matters</span>
          <h2>{get('value.heading', "You're Not Buying Herbs. You're Buying Your Body's Way Back to Balance.")}</h2>
          <p>{get('value.subtext', 'Every VitaHerbs extract is crafted with a purpose - helping you feel like yourself again, naturally, day after day.')}</p>
        </div>

        <div className="value-grid">
          {cards.map(({ icon: Icon, title, text }) => (
            <div className="value-card" key={title || text}>
              <div className="value-icon"><Icon /></div>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ValueSection;
