import { useEffect, useState } from "react";
import "./Products.css";

const API_URL = "http://localhost:5000/api/products";

function Products() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);

  // Load products from MongoDB
  async function fetchProducts() {
    try {
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to load products.");
      }

      const data = await response.json();
      setProducts(data);
    } catch (error) {
      setError("Could not load products. Check that your backend is running.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  // Clear the form
  function resetForm() {
    setName("");
    setPrice("");
    setEditingId(null);
  }

  // Add a new product or update an existing product
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

    setSaving(true);

    try {
      const isEditing = editingId !== null;

      const response = await fetch(
        isEditing ? `${API_URL}/${editingId}` : API_URL,
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            price: numericPrice,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not save the product.");
      }

      if (isEditing) {
        setProducts((currentProducts) =>
          currentProducts.map((product) =>
            product._id === editingId ? data : product
          )
        );

        setMessage("Product updated successfully!");
      } else {
        setProducts((currentProducts) => [data, ...currentProducts]);

        setMessage("Product added successfully!");
      }

      resetForm();
    } catch (error) {
      setError(error.message || "Could not save the product.");
    } finally {
      setSaving(false);
    }
  }

  // Fill the form with the product we want to edit
  function handleEdit(product) {
    setEditingId(product._id);
    setName(product.name);
    setPrice(String(product.price));
    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // Delete a product
  async function handleDelete(product) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/${product._id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not delete the product.");
      }

      setProducts((currentProducts) =>
        currentProducts.filter((item) => item._id !== product._id)
      );

      if (editingId === product._id) {
        resetForm();
      }

      setMessage("Product deleted successfully!");
    } catch (error) {
      setError(
        error.message || "Could not delete the product. Check your backend."
      );
    }
  }

  return (
    <main className="products-page">
      <div className="products-header">
        <p className="eyebrow">OUR PRODUCTS</p>
        <h1>Products</h1>
        <p>Manage and view your business products.</p>
      </div>

      {/* Add or edit product form */}
      <form className="add-product-form" onSubmit={handleSubmit}>
        <h2>{editingId ? "Edit Product" : "Add a New Product"}</h2>

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

        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : editingId ? "Save Changes" : "Add Product"}
        </button>

        {editingId && (
          <button
            type="button"
            className="cancel-button"
            onClick={resetForm}
            disabled={saving}
          >
            Cancel Edit
          </button>
        )}

        {message && <p role="status">{message}</p>}
        {error && <p role="alert">{error}</p>}
      </form>

      {/* Product list */}
      {loading && <p>Loading products...</p>}

      {!loading && products.length === 0 && !error && (
        <p>No products found. Add your first product!</p>
      )}

      <div className="product-grid">
        {products.map((product) => (
          <div className="product-card" key={product._id}>
            <div className="product-icon">📦</div>

            <h2>{product.name}</h2>

            <p className="product-price">${Number(product.price).toFixed(2)}</p>

            <div className="product-actions">
              <button
                type="button"
                className="edit-button"
                onClick={() => handleEdit(product)}
              >
                Edit
              </button>

              <button
                type="button"
                className="delete-button"
                onClick={() => handleDelete(product)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

export default Products;
