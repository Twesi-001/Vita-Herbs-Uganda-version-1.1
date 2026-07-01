import { useEffect } from 'react'
import NewsLetter from '../components/ui/NewsLetter'
import ValueSection from '../components/ui/ValueSection'
import { Link, useLocation } from 'react-router-dom'
import Products from './Products'
import Socials from './Socials'
import { AboutBody } from './About'
import { ContactBody } from './Contact'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { useSiteContent } from '../hooks/useSiteContent'
import'./Home.css'

function Home(){
    useScrollReveal();
    const get = useSiteContent();
    const location = useLocation();

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
          <img src="/assets/anti-ulcers.jpeg" alt="Kar Anti Ulcer herbal tea" className="hero-main-img" />
        </div>
      </div>
    </section>

    <div className="reveal reveal--fade-up"><Products showAllLink /></div>
    <ValueSection />
    <section id="about" className="home-anchor reveal reveal--fade-up"><AboutBody /></section>
    <div className="reveal reveal--fade-up"><NewsLetter /></div>
    <section id="contact" className="home-anchor reveal reveal--fade-up"><ContactBody /></section>
    <div className="reveal reveal--fade-up"><Socials /></div>
  </main>
        
        </>
    )
}
export default Home
