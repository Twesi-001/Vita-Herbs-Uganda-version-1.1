import { useState, useEffect } from 'react';
import './Products.css';

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  imageUrl: string;
  ingredients: string[];
  benefits: string[];
  stock: number;
  isFeatured: boolean;
}

function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  const fetchProducts = async (retry = true) => {
    setLoading(true);
    setError('');
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const response = await fetch('https://vitaherbs-backend.onrender.com/api/products?featured=true', {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.data);
        setRetryCount(0);
      } else {
        throw new Error('Failed to load products');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Server is waking up... Please wait a moment and refresh.');
      } else if (retry && retryCount < 2) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchProducts(true);
        }, 3000);
        setError('Server is starting up. Retrying...');
      } else {
        setError('Unable to connect to server. Please refresh the page.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading && products.length === 0) {
    return (
      <section className="section" id="products">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Featured Products</span>
            <h2>Our Herbal Products</h2>
            <p>Loading amazing products for you...</p>
          </div>
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p className="loading-text">Waking up server... Please wait</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="section" id="products">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Featured Products</span>
            <h2>Our Herbal Products</h2>
            <p className="error-message">{error}</p>
            <button onClick={() => fetchProducts(true)} className="retry-btn">
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section" id="products">
      <div className="container">
        <div className="section-heading">
          <span className="eyebrow">Featured Products</span>
          <h2>Our Herbal Products</h2>
          <p>Browse a few of our featured herbal extract products.</p>
        </div>

        <div className="cards">
          {products.map((product) => (
            <article className="card" key={product._id}>
              <img src={product.imageUrl} alt={product.name} />
              <div className="card-body">
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <div className="product-price">
                  UGX {product.price.toLocaleString()}
                </div>
                <div className="product-category">
                  {product.category}
                </div>
                <a 
                  href={`whatsapp://send?phone=256760108564&text=Hello! I'm interested in ${product.name}`} 
                  rel="noopener noreferrer"
                  className="order-btn"
                >
                  Order on WhatsApp
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Products;