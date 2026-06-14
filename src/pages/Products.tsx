import './Products.css';
import detoxImg from '../assets/product-detox.jpg';
import capsulesImg from '../assets/product-capsules.jpg';
import oilImg from '../assets/product-oil.jpg';

const WHATSAPP_PHONE = '256760108564';

const products = [
    {
        name: 'Vita Detox Extract',
        description: 'Supports body cleansing and wellness balance.',
        image: detoxImg,
    },
    {
        name: 'Vita Immune Boost',
        description: 'Made to support everyday immune wellness.',
        image: capsulesImg,
    },
    {
        name: 'Vita Joint Relief',
        description: 'Herbal support for movement comfort and wellness.',
        image: oilImg,
    },
];

function orderLink(productName: string) {
    const message = `Hello VitaHerbs, I'd like to order ${productName}.`;
    return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}

function Products() {
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
                        <article className="card" key={product.name}>
                            <img src={product.image} alt={product.name} />
                            <div className="card-body">
                                <h3>{product.name}</h3>
                                <p>{product.description}</p>
                                <a href={orderLink(product.name)} target="_blank" rel="noopener noreferrer">Order on WhatsApp</a>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default Products;