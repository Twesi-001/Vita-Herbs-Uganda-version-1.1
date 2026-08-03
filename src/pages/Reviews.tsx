import { Link } from 'react-router-dom';
import { ReviewsBody } from '../components/ui/ReviewsSection';
import './Reviews.css';

function ReviewsPage() {
  return (
    <>
      <section className="reviews-hero">
        <div className="container">
          <div className="reviews-hero-content">
            <div className="hero-text">
              <h1>Customer Reviews</h1>
            </div>
            <nav className="hero-breadcrumb" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span className="sep">·</span>
              <span className="current">Reviews</span>
            </nav>
          </div>
        </div>
      </section>

      <ReviewsBody />
    </>
  );
}

export default ReviewsPage;
