import { Heart, Leaf, Sprout, CheckCircle } from "lucide-react";
import "./About.css";
import { useSiteContent } from "../hooks/useSiteContent";

function AboutPage() {
  const get = useSiteContent();

  return (
    <>
      <section className="about-hero">
        <div className="container">
          <div className="about-hero-content">
            <span className="eyebrow">{get('about.hero.eyebrow', 'Our Story')}</span>
            <h1>{get('about.hero.heading', 'About VitaHerbs Uganda')}</h1>
            <p className="hero-description">
              {get('about.hero.description', 'A heritage of healing herbs, a future of holistic wellness - rooted deeply in the rich soils of Uganda.')}
            </p>
          </div>
        </div>
      </section>

      <section className="about-story">
        <div className="container">
          <div className="about-grid">
            <div className="about-story-content">
              <span className="eyebrow">{get('about.story.eyebrow', 'Our Heritage')}</span>
              <h2>{get('about.story.heading', 'Crafted from heritage, made for today.')}</h2>
              <p>{get('about.story.body', 'VitaHerbs Uganda was born from a simple belief: the herbs that have sustained East African communities for generations deserve to be shared with the world - pure, potent, and properly honored.')}</p>
            </div>

            <div className="about-card">
              <h3>Why choose us?</h3>
              <ul>
                <li><CheckCircle /> 100% natural ingredients</li>
                <li><CheckCircle /> Easy WhatsApp ordering</li>
                <li><CheckCircle /> Fast customer support</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="about-pillars">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">Our Promise</span>
            <h2>Three Pillars We Stand On</h2>
          </div>
          <div className="pillars-grid">
            <div className="pillar-card">
              <div className="pillar-icon"><Leaf /></div>
              <h3>{get('about.pillar1.title', 'Purity')}</h3>
              <p>{get('about.pillar1.body', 'Only single-origin, ethically harvested herbs')}</p>
            </div>
            <div className="pillar-card">
              <div className="pillar-icon"><Sprout /></div>
              <h3>{get('about.pillar2.title', 'Sustainability')}</h3>
              <p>{get('about.pillar2.body', 'Regenerative sourcing for future generations')}</p>
            </div>
            <div className="pillar-card">
              <div className="pillar-icon"><Heart /></div>
              <h3>{get('about.pillar3.title', 'Community')}</h3>
              <p>{get('about.pillar3.body', 'Fair partnerships with local farmers')}</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default AboutPage;