import { useEffect, useRef } from 'react';
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
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  const cards = CARDS.map(({ key, icon, title, text }) => ({
    icon,
    title: get(`value.card${key}.title`, title),
    text: get(`value.card${key}.text`, text),
  }));

  const bgImage = get('value.bgImage', whyHerbsImg);

  // background-attachment: fixed silently does nothing on iOS Safari (a
  // long-standing, deliberate limitation, not a bug that gets fixed) — the
  // whole section just scrolls normally there. This drives the same "image
  // stays still while content scrolls over it" effect via a transform
  // instead, which works everywhere including iOS.
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const section = sectionRef.current;
        const bg = bgRef.current;
        if (!section || !bg) return;
        const rect = section.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        bg.style.transform = `translate3d(0, ${rect.top * 0.4}px, 0)`;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="value-section" id="value" ref={sectionRef}>
      <div
        ref={bgRef}
        className="value-bg"
        style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('${bgImage}')` }}
      />
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
