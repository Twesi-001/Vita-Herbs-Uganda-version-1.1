// Header.tsx
import { NavLink } from 'react-router-dom';
import './Header.css';

function Header() {
    return (
        <header className="header">
            <div className="container nav">
                <NavLink to="/" className="logo">
                     <span className="header-logo-badge">
                                <img
                                    src="/logo.jpeg"
                                    alt="VitaHerbs Uganda"
                                    className="header-logo-img"
                                />
                            </span>
                            <span className="footer-site-title">
                                VitaHerbs <span className="footer-site-region">Uganda</span>
                            </span>
                </NavLink>

                <nav className="menu">
                    <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>Home</NavLink>
                    <NavLink to="/about" className={({ isActive }) => isActive ? 'active' : ''}>About</NavLink>
                    <NavLink to="/products" className={({ isActive }) => isActive ? 'active' : ''}>Products</NavLink>
                    <NavLink to="/social" className={({ isActive }) => isActive ? 'active' : ''}>Socials</NavLink>
                    <NavLink to="/contact" className={({ isActive }) => isActive ? 'active' : ''}>Contact</NavLink>
                </nav>

                <a className="btn btn-primary" href="https://wa.me/256760108564" target="_blank" rel="noopener noreferrer">
                    WhatsApp Us
                </a>
            </div>
        </header>
    );
}

export default Header;