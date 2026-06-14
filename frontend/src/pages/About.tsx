
import { Heart, Leaf, Sprout,  CheckCircle } from "lucide-react";
import "./About.css";

function AboutPage() {
  return (
    <>
      <section className="about-hero">
        <div className="container">
          <div className="about-hero-content">
            <span className="eyebrow">Our Story</span>
            <h1>About VitaHerbs Uganda</h1>
            <p className="hero-description">
              A heritage of healing herbs, a future of holistic wellness — rooted
              deeply in the rich soils of Uganda.
            </p>
          </div>
        </div>
      </section>

      <section className="about-story">
        <div className="container">
          <div className="about-grid">
            <div className="about-story-content">
              <span className="eyebrow">Our Heritage</span>
              <h2>Crafted from heritage, made for today.</h2>
              <p>
                VitaHerbs Uganda was born from a simple belief: the herbs that have
                sustained East African communities for generations deserve to be shared
                with the world — pure, potent, and properly honored.
              </p>
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
              <h3>Purity</h3>
              <p>Only single-origin, ethically harvested herbs</p>
            </div>
            <div className="pillar-card">
              <div className="pillar-icon"><Sprout /></div>
              <h3>Sustainability</h3>
              <p>Regenerative sourcing for future generations</p>
            </div>
            <div className="pillar-card">
              <div className="pillar-icon"><Heart /></div>
              <h3>Community</h3>
              <p>Fair partnerships with local farmers</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default AboutPage;