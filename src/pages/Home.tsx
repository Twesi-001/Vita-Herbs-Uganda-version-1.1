import NewsLetter from '../components/ui/NewsLetter'
import ValueSection from '../components/ui/ValueSection'
import MissionSection from '../components/ui/MissionSection'
import { Link } from 'react-router-dom'
import Products from './Products'
import Socials from './Socials'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { useSiteContent } from '../hooks/useSiteContent'
import'./Home.css'

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

        <div className="hero-image">
          <img src="/assets/anti-ulcers.jpeg" alt="Kar Anti Ulcer herbal tea" className="hero-main-img" />
        </div>
      </div>
    </section>

    <div className="reveal reveal--fade-up"><Products showAllLink /></div>
    <ValueSection />
    <div className="reveal reveal--fade-up"><MissionSection /></div>
    <div className="reveal reveal--fade-up"><NewsLetter /></div>
    <div className="reveal reveal--fade-up"><Socials /></div>
  </main>
        
        </>
    )
}
export default Home
