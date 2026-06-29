import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Leaf, Sprout, Heart, CheckCircle, ShieldCheck, Users, ChevronLeft, ChevronRight } from "lucide-react";
import "./About.css";
import { useSiteContent } from "../hooks/useSiteContent";
import herbsImg from "../assets/Herbs.jpg";

function IconFacebook() {
  return (
    <svg viewBox="0 0 320 512" fill="currentColor" aria-hidden="true">
      <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z" />
    </svg>
  );
}
function IconTwitter() {
  return (
    <svg viewBox="0 0 512 512" fill="currentColor" aria-hidden="true">
      <path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z" />
    </svg>
  );
}
function IconInstagram() {
  return (
    <svg viewBox="0 0 448 512" fill="currentColor" aria-hidden="true">
      <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
    </svg>
  );
}
function IconLinkedIn() {
  return (
    <svg viewBox="0 0 448 512" fill="currentColor" aria-hidden="true">
      <path d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z" />
    </svg>
  );
}


const team = [
  {
    name: "Sarah Nakato",
    role: "Founder & CEO",
    location: "Kampala, Uganda",
    bio: "Sarah founded KarOrganics Uganda with a passion for preserving Uganda's rich herbal heritage. She leads the company's vision to make natural wellness accessible to every household.",
    photo: "https://i.pravatar.cc/600?img=47",
  },
  {
    name: "James Mugisha",
    role: "Head of Production",
    location: "Kampala, Uganda",
    bio: "James oversees the sourcing and processing of all herbal products, working directly with local farmers to ensure the highest quality and ethical harvesting practices.",
    photo: "https://i.pravatar.cc/600?img=12",
  },
  {
    name: "Grace Achieng",
    role: "Customer Relations",
    location: "Kampala, Uganda",
    bio: "Grace is the friendly voice behind our WhatsApp support. She ensures every customer receives personalised guidance and prompt responses to their inquiries.",
    photo: "https://i.pravatar.cc/600?img=32",
  },
];

function AboutPage() {
  const get = useSiteContent();
  const [teamIdx, setTeamIdx] = useState(0);
  const prev = () => setTeamIdx(i => (i - 1 + team.length) % team.length);
  const next = () => setTeamIdx(i => (i + 1) % team.length);

  useEffect(() => {
    const timer = setInterval(() => {
      setTeamIdx(i => (i + 1) % team.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

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

      {/* ── Story + Stats ── */}
      <section className="about-history">
        <div className="container">
          <div className="history-grid">
            <div className="history-img">
              <img src={herbsImg} alt="KarOrganics herbs" />
            </div>
            <div className="history-info">
              <h2>{get('about.story.heading', "Bringing Nature's Healing Power to Your Doorstep.")}</h2>
              <h4>{get('about.story.eyebrow', "Rooted in Uganda's rich herbal heritage")}</h4>
              <p>{get('about.story.body', 'KarOrganics Uganda was born from a simple belief: the herbs that have sustained East African communities for generations deserve to be shared with the world - pure, potent, and properly honored. We work directly with local farmers to bring you the finest herbal extracts.')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Our Mission ── */}
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

      {/* ── Meet Our Team ── */}
      <section className="about-team">
        <div className="container">
          <div className="section-header">
            <h2>Meet Our Team</h2>
            <p>The passionate people behind KarOrganics Uganda - dedicated to bringing you the finest herbal products from the heart of East Africa.</p>
          </div>
          <div className="team-carousel">
            <button className="team-arrow team-arrow--prev" onClick={prev} aria-label="Previous">
              <ChevronLeft />
            </button>

            <div className="team-item">
              <div className="team-thumb">
                <img src={team[teamIdx].photo} alt={team[teamIdx].name} />
              </div>
              <div className="team-info">
                <h3>{team[teamIdx].name}</h3>
                <h5>{team[teamIdx].role}</h5>
                <ul className="team-meta">
                  <li>Location: <span>{team[teamIdx].location}</span></li>
                  <li>Department: <span>KarOrganics Uganda</span></li>
                </ul>
                <p>{team[teamIdx].bio}</p>
                <div className="team-social">
                  <a href="#" aria-label="Facebook"><IconFacebook /></a>
                  <a href="#" aria-label="Twitter"><IconTwitter /></a>
                  <a href="#" aria-label="Instagram"><IconInstagram /></a>
                  <a href="#" aria-label="LinkedIn"><IconLinkedIn /></a>
                </div>
              </div>
            </div>

            <button className="team-arrow team-arrow--next" onClick={next} aria-label="Next">
              <ChevronRight />
            </button>
          </div>
        </div>
      </section>

      {/* ── Why KarOrganics ── */}
      <section className="about-why">
        <div className="container">
          <div className="why-grid">
            <div className="why-content">
              <span className="why-eyebrow">Why KarOrganics?</span>
              <h2>Trusted Herbal Products, Delivered With Care</h2>
              <p>We make it easy to access premium herbal wellness products wherever you are in Uganda. Order via WhatsApp and receive your products quickly.</p>
              <ul className="why-list">
                <li><CheckCircle size={18} /> 100% natural, no synthetic additives</li>
                <li><CheckCircle size={18} /> Direct WhatsApp ordering - no complicated checkout</li>
                <li><CheckCircle size={18} /> Fast delivery across Uganda</li>
                <li><CheckCircle size={18} /> Responsive customer support</li>
                <li><CheckCircle size={18} /> Sourced directly from Ugandan farmers</li>
              </ul>
              <a
                href="https://wa.me/256701924517"
                target="_blank"
                rel="noopener noreferrer"
                className="why-cta"
              >
                Order on WhatsApp
              </a>
            </div>
            <div className="why-img">
              <img src={herbsImg} alt="Natural herbal products" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default AboutPage;
