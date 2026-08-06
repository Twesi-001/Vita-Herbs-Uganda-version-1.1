import { Link } from 'react-router-dom';
import { VideosBody } from '../components/ui/VideosSection';
import './Videos.css';

function VideosPage() {
  return (
    <>
      <section className="videos-hero">
        <div className="container">
          <div className="videos-hero-content">
            <div className="hero-text">
              <h1>Videos</h1>
            </div>
            <nav className="hero-breadcrumb" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span className="sep">·</span>
              <span className="current">Videos</span>
            </nav>
          </div>
        </div>
      </section>

      <VideosBody />
    </>
  );
}

export default VideosPage;
