import { Routes, Route } from 'react-router-dom';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import BackToTop from '../components/ui/BackToTop';
import AdminDashboard from './AdminDashboard';
import Home from './Home';
import About from './About';
import Products from './Products';
import Contact from './Contact';
import Socials from './Socials';

function App() {
  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/products" element={<Products />} />
          <Route path="/social" element={<Socials />} />
          <Route path="/contact" element={<Contact />} />
           <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}

export default App;