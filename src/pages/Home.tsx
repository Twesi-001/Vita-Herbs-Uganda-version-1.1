import { useEffect, useState } from 'react'
import NewsLetter from '../components/ui/NewsLetter'
import ValueSection from '../components/ui/ValueSection'
import { Link, useLocation } from 'react-router-dom'
import Products from './Products'
import Socials from './Socials'
import { AboutBody } from './About'
import { ContactBody } from './Contact'
import { ReviewsBody } from '../components/ui/ReviewsSection'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { useSiteContent } from '../hooks/useSiteContent'
import { API_URL } from '../lib/api'
import'./Home.css'

interface HeroSlide { src: string; alt: string; }

const DEFAULT_HERO_SLIDE: HeroSlide = { src: '/assets/anti-ulcers.jpeg', alt: 'Kar Anti Ulcer herbal tea' };

function Home(){
    useScrollReveal();
    const get = useSiteContent();
    const location = useLocation();
    const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([DEFAULT_HERO_SLIDE]);
    const [heroIdx, setHeroIdx] = useState(0);

    // Pull in live product photos so the hero rotates through real products too.
    useEffect(() => {
        fetch(`${API_URL}/products`)
            .then(r => r.json())
            .then((data: { name: string; image_url: string | null; active: boolean }[]) => {
                if (!Array.isArray(data)) return;
                const productSlides = data
                    .filter(p => p.active && p.image_url)
                    .map(p => ({ src: p.image_url as string, alt: p.name }));
                if (productSlides.length) setHeroSlides([DEFAULT_HERO_SLIDE, ...productSlides]);
            })
            .catch(() => {});
    }, []);

    useEffect(() => {
        if (heroSlides.length < 2) return;
        const timer = setInterval(() => {
            setHeroIdx(i => (i + 1) % heroSlides.length);
        }, 4500);
        return () => clearInterval(timer);
    }, [heroSlides.length]);

    // When navigated here with a hash (e.g. /#about), scroll to that section.
    useEffect(() => {
        if (location.hash) {
            const id = location.hash.slice(1);
            // Wait a tick so lazy sections are mounted before scrolling.
            const t = setTimeout(() => {
                document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
            return () => clearTimeout(t);
        }
    }, [location.hash]);

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
            <a
              href="#contact"
              className="btn btn-outline"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Contact Us
            </a>
          </div>

          <div className="trust-badges">
            <div>Natural Ingredients</div>
            <div>Quality Focused</div>
            <div>Fast Support</div>
          </div>
        </div>

        <div className="hero-image">
          {heroSlides.map((slide, i) => (
            <img
              key={slide.src}
              src={slide.src}
              alt={slide.alt}
              className={`hero-main-img ${i === heroIdx ? 'hero-slide-active' : ''}`}
            />
          ))}
          {heroSlides.length > 1 && (
            <div className="hero-dots">
              {heroSlides.map((slide, i) => (
                <button
                  key={slide.src}
                  className={`hero-dot ${i === heroIdx ? 'hero-dot-active' : ''}`}
                  onClick={() => setHeroIdx(i)}
                  aria-label={`Show slide ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>

    <div className="reveal reveal--fade-up"><Products showAllLink /></div>
    <ValueSection />
    <section id="reviews" className="home-anchor reveal reveal--fade-up"><ReviewsBody /></section>
    <section id="about" className="home-anchor reveal reveal--fade-left"><AboutBody /></section>
    <div className="reveal reveal--fade-up"><NewsLetter /></div>
    <section id="contact" className="home-anchor reveal reveal--fade-right"><ContactBody /></section>
    <div className="reveal reveal--fade-up"><Socials /></div>
  </main>
        
        </>
    )
}
export default Home
