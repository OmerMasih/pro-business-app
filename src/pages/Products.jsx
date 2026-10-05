import { useEffect, useState } from "react";
import "./Products.css";

function Products() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then((response) => response.json())
      .then((data) => {
        setProducts(data);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
      });
  }, []);

  return (
    <main className="products-page">
      <div className="products-header">
        <p className="eyebrow">OUR PRODUCTS</p>
        <h1>Products</h1>
        <p>Manage and view your business products.</p>
      </div>

      <div className="product-grid">
        {products.map((product) => (
          <div className="product-card" key={product.id}>
            <div className="product-icon">📦</div>

            <h2>{product.name}</h2>

            <p className="product-price">${product.price.toFixed(2)}</p>

            <button>View Product</button>
          </div>
        ))}
      </div>
    </main>
  );
}

export default Products;
