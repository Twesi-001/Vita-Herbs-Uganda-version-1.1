import NewsLetter from '../components/ui/NewsLetter'
import ValueSection from '../components/ui/ValueSection'
import MissionSection from '../components/ui/MissionSection'
import { Link } from 'react-router-dom'
import Products from './Products'
import Socials from './Socials'
import heroImage from '../assets/Herbs.jpg';
import { useScrollReveal } from '../hooks/useScrollReveal'
import { useSiteContent } from '../hooks/useSiteContent'
import { useState, useEffect } from 'react'
import { API_URL } from '../lib/api'
import'./Home.css'

function HeroSlideshow() {
  const [slides, setSlides] = useState<string[]>([heroImage]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    fetch(`${API_URL}/products`)
      .then(r => r.json())
      .then((products: { image_url: string | null }[]) => {
        const urls = products.map(p => p.image_url).filter(Boolean) as string[];
        if (urls.length > 0) setSlides([heroImage, ...urls]);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (slides.length < 2) return;
    const id = setInterval(() => setCurrent(c => (c + 1) % slides.length), 7000);
    return () => clearInterval(id);
  }, [slides]);

  return (
    <div className="hero-image hero-slideshow">
      <img src={heroImage} alt="" className="hero-slideshow-sizer" aria-hidden="true" decoding="async" />
      {slides.map((src, i) => (
        <div
          key={src}
          className={`hero-slide${i === current ? ' hero-slide--active' : ''}`}
          style={{ backgroundImage: `url(${src})` }}
        />
      ))}
    </div>
  );
}

function Home(){
    useScrollReveal();
    const get = useSiteContent();

    return(
        <>
         <main id="home">
    <section className="hero reveal reveal--fade-up">
      <div className="container hero-grid">
        <div className="hero-copy">
          <h1>
            Herbal Extract{' '}
            <span className="hero-break">
              <span className="hero-nowrap">Medicine for Better</span>
            </span>
            {' '}
            <span className="hero-nowrap">Everyday Living</span>
          </h1>
          <p>
            {get('hero.subtext', 'Kar Organics is a new herbal company focused on natural extract-based wellness products. Discover trusted herbal solutions and order easily through WhatsApp.')}
          </p>

          <div className="hero-actions">
            <Link to="/products" className="btn btn-primary">View Products</Link>
            <Link to="/contact" className="btn btn-outline">Contact Us</Link>
          </div>

          <div className="trust-badges">
            <div>Natural Ingredients</div>
            <div>Quality Focused</div>
            <div>Fast Support</div>
          </div>
        </div>

        <HeroSlideshow />
      </div>
    </section>

    <div className="reveal reveal--fade-up"><Products showAllLink /></div>
    <div className="reveal reveal--fade-up"><ValueSection /></div>
    <div className="reveal reveal--fade-up"><MissionSection /></div>
    <div className="reveal reveal--fade-up"><Socials /></div>
    <div className="reveal reveal--fade-up"><NewsLetter /></div>
  </main>
        
        </>
    )
}
export default Home
