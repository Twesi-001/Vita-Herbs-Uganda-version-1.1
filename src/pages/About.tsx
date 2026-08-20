import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, ChevronLeft, ChevronRight, ArrowRight, Mail } from "lucide-react";
import "./About.css";
import { useSiteContent } from "../hooks/useSiteContent";
import herbsImg from "../assets/Herbs.jpg";
import { FOUNDER_DEFAULTS, FOUNDERS_HEADING, FOUNDERS_SUBTEXT, founderKey, type Founder } from "../lib/founders";
import MissionSection from "../components/ui/MissionSection";
import { VideosBody } from "../components/ui/VideosSection";

// Same address the header and contact page use.
const KAR_EMAIL = "hello@karorganics.ug";

// Ugandan numbers are shared locally ("0701924517") but wa.me needs E.164
// digits, so normalise before building the link while still displaying the
// number exactly as it was typed in the admin panel.
function toWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('256')) return digits;
  if (digits.startsWith('0')) return `256${digits.slice(1)}`;
  return digits;
}

// Shared About content (without the page hero) so it can be reused
// both on the standalone /about route and embedded on the Home page.
export function AboutBody() {
  const get = useSiteContent();

  // Founders come from the admin Site Content keys, falling back to the
  // built-in defaults. A founder without a name is treated as unset and
  // dropped, so the carousel never shows a blank slide.
  const founders: Founder[] = FOUNDER_DEFAULTS.map((def, i) => {
    const k = (field: string) => founderKey(i, field);
    return {
      name: get(k('name'), def.name),
      role: get(k('role'), def.role),
      location: get(k('location'), def.location),
      bio: get(k('bio'), def.bio),
      // A cleared photo falls back to the bundled one rather than an empty src.
      photo: get(k('photo'), def.photo) || def.photo,
      phones: [get(k('phone1'), def.phones[0] ?? ''), get(k('phone2'), def.phones[1] ?? '')]
        .map(p => p.trim())
        .filter(Boolean),
    };
  }).filter(f => f.name.trim());

  const [teamIdx, setTeamIdx] = useState(0);
  const count = founders.length;
  const activeIdx = count ? teamIdx % count : 0;
  const founder = founders[activeIdx];
  const prev = () => setTeamIdx(i => (i - 1 + count) % count);
  const next = () => setTeamIdx(i => (i + 1) % count);

  // Hovering (or tabbing into) the carousel holds the current founder so the
  // slide can't change out from under someone reading it or reaching for a
  // contact link.
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (count < 2 || paused) return;
    const timer = setInterval(() => {
      setTeamIdx(i => (i + 1) % count);
    }, 4000);
    return () => clearInterval(timer);
  }, [count, paused]);

  return (
    <>
      {/* ── Story + Stats ── */}
      <section className="about-history">
        <div className="container">
          <div className="history-grid">
            <div className="history-gallery">
              <div className="history-img history-img-1">
                <img src={get('about.story.image', herbsImg)} alt="KarOrganics herbs" />
              </div>
              <div className="history-img history-img-2">
                <img src={get('about.story.image2', herbsImg)} alt="KarOrganics herbal products" />
              </div>
            </div>
            <div className="history-info">
              <h4>{get('about.story.eyebrow', 'About Us')}</h4>
              <h2>{get('about.story.heading', "Bringing Nature's Healing Power to Your Doorstep.")}</h2>
              <p dangerouslySetInnerHTML={{ __html: get('about.story.body', 'KarOrganics Uganda was born from a simple belief: the herbs that have sustained East African communities for generations deserve to be shared with the world - pure, potent, and properly honored.') }} />
              <p dangerouslySetInnerHTML={{ __html: get('about.story.body2', 'Every product is crafted to the highest standards of purity and potency, so you get natural wellness you can rely on, every single day.') }} />
              <Link to="/products" className="history-cta">Learn More <ArrowRight size={15} /></Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Our Mission ── */}
      <MissionSection />

      {/* ── Videos ── */}
      <VideosBody hideIfEmpty />

      {/* ── Meet Our Founders ── */}
      {founder && (
        <section className="about-team">
          <div className="container">
            <div className="section-header">
              <h2>{get('founders.heading', FOUNDERS_HEADING)}</h2>
              <p>{get('founders.subtext', FOUNDERS_SUBTEXT)}</p>
            </div>
            <div
              className={`team-carousel ${paused ? 'is-paused' : ''}`}
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              onFocusCapture={() => setPaused(true)}
              onBlurCapture={() => setPaused(false)}
            >
              {count > 1 && (
                <button className="team-arrow team-arrow--prev" onClick={prev} aria-label="Previous">
                  <ChevronLeft />
                </button>
              )}

              <div className="team-item">
                <div className="team-thumb">
                  <img
                    src={founder.photo}
                    alt={founder.name}
                    // A saved URL can go stale (a removed upload, or a bundled
                    // path whose build hash has since changed) - drop back to
                    // the photo shipped with the site rather than a broken image.
                    onError={(e) => {
                      const fallback = FOUNDER_DEFAULTS[activeIdx]?.photo;
                      if (fallback && !e.currentTarget.src.endsWith(fallback)) {
                        e.currentTarget.src = fallback;
                      }
                    }}
                  />
                </div>
                <div className="team-info">
                  <h3>{founder.name}</h3>
                  <h5>{founder.role}</h5>
                  <ul className="team-meta">
                    {founder.location && <li>Location: <span>{founder.location}</span></li>}
                    {founder.phones.length > 0 && (
                      <li>
                        Contact:
                        <span className="team-phones">
                          {founder.phones.map((phone) => (
                            <a
                              key={phone}
                              className="team-phone"
                              href={`https://wa.me/${toWhatsAppNumber(phone)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {phone}
                            </a>
                          ))}
                        </span>
                      </li>
                    )}
                  </ul>
                  <div className="team-bio" dangerouslySetInnerHTML={{ __html: founder.bio }} />
                  <a className="team-contact-btn" href={`mailto:${KAR_EMAIL}`}>
                    <Mail size={16} /> Contact Us
                  </a>
                </div>
              </div>

              {count > 1 && (
                <button className="team-arrow team-arrow--next" onClick={next} aria-label="Next">
                  <ChevronRight />
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── Why KarOrganics ── */}
      <section className="about-why">
        <div className="container">
          <div className="why-grid">
            <div className="why-content">
              <span className="why-eyebrow">{get('about.why.eyebrow', 'Why KarOrganics?')}</span>
              <h2>{get('about.why.heading', 'Trusted Herbal Products, Delivered With Care')}</h2>
              <p dangerouslySetInnerHTML={{ __html: get('about.why.body', 'We make it easy to access premium herbal wellness products wherever you are in Uganda. Order via WhatsApp and receive your products quickly.') }} />
              <ul className="why-list">
                <li><CheckCircle size={18} /> {get('about.why.item1', '100% natural, no synthetic additives')}</li>
                <li><CheckCircle size={18} /> {get('about.why.item2', 'Direct WhatsApp ordering - no complicated checkout')}</li>
                <li><CheckCircle size={18} /> {get('about.why.item3', 'Fast delivery across Uganda')}</li>
                <li><CheckCircle size={18} /> {get('about.why.item4', 'Responsive customer support')}</li>
                <li><CheckCircle size={18} /> {get('about.why.item5', 'Sourced directly from Ugandan farmers')}</li>
              </ul>
              <a
                href="https://wa.me/256701924517"
                target="_blank"
                rel="noopener noreferrer"
                className="why-cta"
              >
                {get('about.why.cta', 'Order on WhatsApp')}
              </a>
            </div>
            <div className="why-img">
              <img src={get('about.why.image', herbsImg)} alt="Natural herbal products" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function AboutPage() {
  const get = useSiteContent();
  return (
    <>
      {/* ── Hero ── */}
      <section className="about-hero">
        <div className="container">
          <div className="about-hero-content">
            <div className="hero-text">
              <h1>{get('about.hero.heading', 'About KarOrganics Uganda')}</h1>
            </div>
            <nav className="hero-breadcrumb" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span className="sep">·</span>
              <span className="current">About</span>
            </nav>
          </div>
        </div>
      </section>

      <AboutBody />
    </>
  );
}

export default AboutPage;
