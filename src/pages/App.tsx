import { Routes, Route } from 'react-router-dom';
import Header from '../components/ui/Header';
import Footer from '../components/ui/footer';
import Home from '../pages/Home';
import About from '../pages/About';
import Products from '../pages/Products';
import Contact from '../pages/Contact';
import Socials from '../pages/Socials';
import AdminDashboard from '../pages/AdminDashboard';

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/products" element={<Products />} />
        <Route path="/social" element={<Socials />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;