import NewsLetter from '../components/ui/NewsLetter'
import ValueSection from '../components/ui/ValueSection'
import { Link } from 'react-router-dom'
import About from './About'
import Products from './Products'
import Contact from './Contact'
import Socials from './Socials'
import heroImage from '../assets/Herbs.jpg';
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
          <h1>{get('hero.heading', 'Herbal Extract Medicine for Better Everyday Living')}</h1>
          <p>
            {get('hero.subtext', 'Vita Herbs is a new herbal company focused on natural extract-based wellness products. Discover trusted herbal solutions and order easily through WhatsApp.')}
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
          <img
            src={heroImage}
            alt="Herbal leaves and natural medicine"
          />
        </div>
      </div>
    </section>

    <div className="reveal reveal--fade-up"><Products showAllLink /></div>
    <div className="reveal reveal--fade-up"><ValueSection /></div>
    <div className="reveal reveal--fade-up"><About /></div>
    <div className="reveal reveal--fade-up"><Socials /></div>
    <div className="reveal reveal--fade-up"><NewsLetter /></div>
    <div className="reveal reveal--fade-up"><Contact /></div>
  </main>
        
        </>
    )
}
export default Home
