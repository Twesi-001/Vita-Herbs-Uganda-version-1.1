import NewsLetter from '../components/ui/NewsLetter'
import { Link } from 'react-router-dom'
import About from './About'
import Products from './Products'
import Contact from './Contact'
import Socials from './Socials'
import heroImage from '../assets/Herbs.jpg'; 
import { useScrollReveal } from '../hooks/useScrollReveal'
import'./Home.css'

function Home(){
    useScrollReveal();

    return(
        <>
         <main id="home">
    <section className="hero reveal reveal--fade-up">
      <div className="container hero-grid">
        <div className="hero-copy">
          <span className="eyebrow">Natural Herbal Wellness</span>
          <h1>Herbal Extract Medicine for Better Everyday Living</h1>
          <p>
            Vita Herbs is a new herbal company focused on natural extract-based wellness products.
            Discover trusted herbal solutions and order easily through WhatsApp.
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

    <div className="reveal reveal--fade-up"><Products /></div>
    <div className="reveal reveal--fade-up"><About /></div>
    <div className="reveal reveal--fade-up"><Socials /></div>
    <div className="reveal reveal--fade-up"><NewsLetter /></div>
    <div className="reveal reveal--fade-up"><Contact /></div>
  </main>
        
        </>
    )
}
export default Home
