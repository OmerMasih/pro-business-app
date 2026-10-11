import { useEffect, useState } from "react";
import "./Products.css";

function Products() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function fetchProducts() {
    try {
      const response = await fetch("http://localhost:5000/api/products");

      if (!response.ok) {
        throw new Error("Failed to load products");
      }

      const data = await response.json();
      setProducts(data);
    } catch (error) {
      setError("Could not load products. Check your backend.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    const numericPrice = Number(price);

    if (
      !name.trim() ||
      price.trim() === "" ||
      !Number.isFinite(numericPrice) ||
      numericPrice < 0
    ) {
      setError("Enter a product name and a valid, non-negative price.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          price: numericPrice,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not add product.");
      }

      setProducts((currentProducts) => [data, ...currentProducts]);
      setName("");
      setPrice("");
      setMessage("Product added successfully!");
    } catch (error) {
      setError(error.message || "Could not add product. Check your backend.");
    }
  }

  return (
    <main className="products-page">
      <div className="products-header">
        <p className="eyebrow">OUR PRODUCTS</p>
        <h1>Products</h1>
        <p>Manage and view your business products.</p>
      </div>

      <form className="add-product-form" onSubmit={handleSubmit}>
        <h2>Add a New Product</h2>

        <label htmlFor="product-name">Product name</label>
        <input
          id="product-name"
          type="text"
          placeholder="e.g. Wireless Mouse"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />

        <label htmlFor="product-price">Price ($)</label>
        <input
          id="product-price"
          type="number"
          placeholder="e.g. 29.99"
          min="0"
          step="0.01"
          value={price}
          onChange={(event) => setPrice(event.target.value)}
          required
        />

        <button type="submit">Add Product</button>

        {message && <p role="status">{message}</p>}
        {error && <p role="alert">{error}</p>}
      </form>

      {loading && <p>Loading products...</p>}

      {!loading && !error && products.length === 0 && (
        <p>No products found. Add your first product!</p>
      )}

      <div className="product-grid">
        {products.map((product) => (
          <div className="product-card" key={product._id}>
            <div className="product-icon">📦</div>
            <h2>{product.name}</h2>
            <p className="product-price">${Number(product.price).toFixed(2)}</p>
          </div>
        ))}
      </div>
    </main>
  );
}

export default Products;
