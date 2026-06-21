import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '../lib/api';
import './Products.css';

const WHATSAPP_PHONE = '256 701 924517';

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

function Products({ showAllLink = false, limit }: { showAllLink?: boolean; limit?: number }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

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
          <div className="loading-spinner"><div className="spinner"></div></div>
        ) : (
          <div className="cards">
            {displayed.map((product) => (
              <article className="card" key={product.id}>
                {product.image_url && (
                  <img src={product.image_url} alt={product.name} />
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
    </section>
  );
}

export default Products;