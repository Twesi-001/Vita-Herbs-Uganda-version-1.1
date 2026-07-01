// Header.tsx
import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Search } from 'lucide-react';
import './Header.css';
import logo from '../../assets/logo1.jpeg';

/* Exact Font Awesome Free (solid) icons used by the reference top bar,
   inlined so we match them precisely without adding a dependency. */
function IconMapMarker() {
    return (
        <svg viewBox="0 0 384 512" fill="currentColor" aria-hidden="true">
            <path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z" />
        </svg>
    );
}

function IconEnvelopeOpen() {
    return (
        <svg viewBox="0 0 512 512" fill="currentColor" aria-hidden="true">
            <path d="M512 464c0 26.51-21.49 48-48 48H48c-26.51 0-48-21.49-48-48V200.724a48 48 0 0 1 18.387-37.776c24.913-19.529 45.501-35.365 164.2-121.511C199.412 29.17 232.797-.347 256 .003c23.197-.348 56.596 29.172 73.413 41.433 118.687 86.137 139.303 101.995 164.2 121.512A48 48 0 0 1 512 200.724V464zm-65.666-196.605c-2.563-3.728-7.7-4.595-11.339-1.907-22.845 16.873-55.462 40.705-105.582 77.079-16.825 12.262-50.21 41.781-73.413 41.43-23.211.351-56.6-29.172-73.413-41.43-50.114-36.37-82.734-60.204-105.582-77.079-3.639-2.688-8.776-1.821-11.339 1.907l-9.072 13.196a8 8 0 0 0 1.965 11.122c22.928 16.943 55.471 40.705 105.42 76.954 20.674 15.076 57.755 48.788 92.021 48.6 34.272.188 71.357-33.529 92.021-48.6 49.948-36.249 82.491-60.011 105.42-76.954a8 8 0 0 0 1.965-11.122l-9.072-13.196z" />
        </svg>
    );
}

function IconMobile() {
    return (
        <svg viewBox="0 0 320 512" fill="currentColor" aria-hidden="true">
            <path d="M272 0H48C21.5 0 0 21.5 0 48v416c0 26.5 21.5 48 48 48h224c26.5 0 48-21.5 48-48V48c0-26.5-21.5-48-48-48zM160 480c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32zm112-108c0 6.6-5.4 12-12 12H60c-6.6 0-12-5.4-12-12V60c0-6.6 5.4-12 12-12h200c6.6 0 12 5.4 12 12v312z" />
        </svg>
    );
}

function Header() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const close = () => setOpen(false);

    const linkClass = ({ isActive }: { isActive: boolean }) => (isActive ? 'active' : '');

    // About & Contact now live as sections on the Home page — clicking them
    // scrolls to that section (navigating home first if we're elsewhere).
    function scrollToSection(id: string) {
        return (e: React.MouseEvent) => {
            e.preventDefault();
            close();
            if (location.pathname === '/') {
                document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
            } else {
                navigate(`/#${id}`);
            }
        };
    }

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
    }

    function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
        const q = e.target.value;
        setQuery(q);
        const trimmed = q.trim();
        if (trimmed) {
            navigate(`/products?q=${encodeURIComponent(trimmed)}`);
        } else {
            navigate('/products');
        }
    }

    return (
        <>
        <div className="topbar">
            <div className="container topbar-inner">
                <ul className="topbar-info">
                    <li><IconMapMarker /> <span>Kampala, Central Uganda</span></li>
                    <li><a href="mailto:hello@karorganics.ug"><IconEnvelopeOpen /> <span>hello@karorganics.ug</span></a></li>
                    <li><a href="tel:+256701924517"><IconMobile /> <span>+256 701 924 517</span></a></li>
                </ul>
                <a
                    href="https://wa.me/256701924517"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="topbar-cta"
                >
                    WhatsApp Us
                </a>
            </div>
        </div>

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
                        KarOrganics <span className="footer-site-region">Uganda</span>
                    </span>
                </NavLink>

                <nav className={`menu ${open ? 'menu--open' : ''}`}>
                    <NavLink to="/" className={linkClass} onClick={close}>Home</NavLink>
                    <a href="/#about" className="" onClick={scrollToSection('about')}>About</a>
                    <NavLink to="/products" className={linkClass} onClick={close}>Products</NavLink>
                    <NavLink to="/social" className={linkClass} onClick={close}>Socials</NavLink>
                    <a href="/#contact" className="" onClick={scrollToSection('contact')}>Contact</a>

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

                <form className="nav-search" onSubmit={handleSearch} role="search">
                    <Search className="nav-search-icon" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="nav-search-input"
                        value={query}
                        onChange={handleSearchChange}
                        aria-label="Search products"
                    />
                </form>

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
        </>
    );
}

export default Header;
