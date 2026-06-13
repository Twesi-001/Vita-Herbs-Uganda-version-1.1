import React, { useState, useEffect } from 'react';
import './Products.css';

interface Product {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  category: string;
  isFeatured: boolean;
}

function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Define function inside useEffect
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/products?featured=true');
        const data = await response.json();
        if (data.success) {
          setProducts(data.data);
        } else {
          setError('Failed to load products');
        }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        setError('Error connecting to server');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []); // Empty dependency array means this runs once on mount

  if (loading) return <div className="loading">Loading products...</div>;
  if (error) return <div className="error">{error}</div>;

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
                <div className="product-price">UGX {product.price.toLocaleString()}</div>
                <a href={`whatsapp://send?phone=256760108564`} rel="noopener noreferrer">
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