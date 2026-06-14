import './Socials.css';

function Socials() {
    return (
        <section className="section" id="social">
            <div className="container">
                <div className="section-heading">
                    <span className="eyebrow">Marketing Channels</span>
                    <h2>Follow Vita Herbs</h2>
                    <p>Connect with us for updates, tips, and product videos.</p>
                </div>

                <div className="social-links">
                    <a href="https://wa.me/256760108564" target="_blank" rel="noopener noreferrer" className="social-link whatsapp">
                        <span className="social-icon">💬</span>
                        <span>WhatsApp</span>
                    </a>
                    <a href="https://www.tiktok.com/@vitaherbsuganda" target="_blank" rel="noopener noreferrer" className="social-link tiktok">
                        <span className="social-icon">🎵</span>
                        <span>TikTok</span>
                    </a>
                    <a href="https://www.instagram.com/vitaherbsuganda" target="_blank" rel="noopener noreferrer" className="social-link instagram">
                        <span className="social-icon">📷</span>
                        <span>Instagram</span>
                    </a>
                    <a href="https://www.facebook.com/vitaherbsuganda" target="_blank" rel="noopener noreferrer" className="social-link facebook">
                        <span className="social-icon">👍</span>
                        <span>Facebook</span>
                    </a>
                    <a href="https://www.youtube.com/@vitaherbsuganda" target="_blank" rel="noopener noreferrer" className="social-link youtube">
                        <span className="social-icon">▶️</span>
                        <span>YouTube</span>
                    </a>
                </div>
            </div>
        </section>
    );
}

export default Socials;