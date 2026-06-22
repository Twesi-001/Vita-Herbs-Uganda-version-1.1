import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '../lib/api';
import './Products.css';

const WHATSAPP_PHONE = '256701924517';

interface Product {
  id: number;
  name: string;
  description: string;
  image_url: string | null;
  price: number | null;
  active: boolean;
}

function orderLink(productName: string) {
  const message = `Hello karorganics , I'd like to order ${productName}.`;
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}

function Lightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="lightbox-backdrop" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose} aria-label="Close">✕</button>
      <img
        src={src}
        alt={alt}
        className="lightbox-img"
        onClick={e => e.stopPropagation()}
      />
    </div>
  );
}

function Products({ showAllLink = false, limit }: { showAllLink?: boolean; limit?: number }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/products`)
      .then((r) => r.json())
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const displayed = limit ? products.slice(0, limit) : products;

  return (
    <section className="section" id="products">
      <div className="container">
        <div className="section-heading">
          <h2>Our Herbal Products</h2>
          <p>Browse a few of our featured herbal extract products.</p>
        </div>

        {loading ? (
          <div className="cards">
            {Array.from({ length: limit ?? 3 }).map((_, i) => (
              <div className="card card-skeleton" key={i}>
                <div className="skeleton skeleton-img" />
                <div className="card-body">
                  <div className="skeleton skeleton-title" />
                  <div className="skeleton skeleton-text" />
                  <div className="skeleton skeleton-text skeleton-text--short" />
                  <div className="skeleton skeleton-btn" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="cards">
            {displayed.map((product) => (
              <article className="card" key={product.id}>
                {product.image_url && (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="card-img-clickable"
                    loading="lazy"
                    decoding="async"
                    onClick={() => setLightbox({ src: product.image_url!, alt: product.name })}
                  />
                )}
                <div className="card-body">
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  {product.price && (
                    <p className="product-price">UGX {Number(product.price).toLocaleString()}</p>
                  )}
                  <a href={orderLink(product.name)} target="_blank" rel="noopener noreferrer">
                    Order on WhatsApp
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}

        {showAllLink && (
          <div className="products-cta">
            <Link to="/products" className="btn btn-primary">Explore All Products</Link>
          </div>
        )}
      </div>

      {lightbox && (
        <Lightbox src={lightbox.src} alt={lightbox.alt} onClose={() => setLightbox(null)} />
      )}
    </section>
  );
}

export default Products;
