// Header.tsx
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import './Header.css';
import logo from '../../assets/logo1.jpeg';

function Header() {
    const [open, setOpen] = useState(false);
    const close = () => setOpen(false);

    const linkClass = ({ isActive }: { isActive: boolean }) => (isActive ? 'active' : '');

    return (
        <header className="header">

            <div className="container nav">
                <NavLink to="/" className="logo1" onClick={close}>
                    <span className="header-logo1-badge">
                        <img
                            src={logo}
                            alt="KarOrganics Uganda"
                            className="header-logo1-img"
                        />
                    </span>
                    <span className="footer-site-title">
                        KarOrganics<span className="footer-site-region">Uganda</span>
                    </span>
                </NavLink>

                <nav className={`menu ${open ? 'menu--open' : ''}`}>
                    <NavLink to="/" className={linkClass} onClick={close}>Home</NavLink>
                    <NavLink to="/about" className={linkClass} onClick={close}>About</NavLink>
                    <NavLink to="/products" className={linkClass} onClick={close}>Products</NavLink>
                    <NavLink to="/social" className={linkClass} onClick={close}>Socials</NavLink>
                    <NavLink to="/contact" className={linkClass} onClick={close}>Contact</NavLink>

                    <a
                        className="btn btn-primary menu-cta"
                        href="https://wa.me/256701924517"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={close}
                    >
                        WhatsApp Us
                    </a>
                </nav>

                <a
                    className="btn btn-primary header-cta"
                    href="https://wa.me/256701924517"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    WhatsApp Us
                </a>

                <button
                    className="menu-toggle"
                    onClick={() => setOpen((v) => !v)}
                    aria-label={open ? 'Close menu' : 'Open menu'}
                    aria-expanded={open}
                >
                    {open ? <X /> : <Menu />}
                </button>
            </div>
        </header>
    );
}

export default Header;
