import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Products.css";

const API_URL = "https://pro-business-app-1.onrender.com/api/products";

const CATEGORIES = [
  "Electronics",
  "Office Supplies",
  "Furniture",
  "Clothing",
  "Food",
  "Accessories",
  "Other",
];

const emptyForm = {
  name: "",
  price: "",
  description: "",
  category: "Electronics",
  sku: "",
  rating: 5,
  stockQuantity: "",
};

function Products() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // AUTHENTICATION

  function getAuthHeaders(includeJson = false) {
    const token = localStorage.getItem("token");

    return {
      ...(includeJson && {
        "Content-Type": "application/json",
      }),
      Authorization: `Bearer ${token}`,
    };
  }

  function handleUnauthorized(response) {
    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login", { replace: true });
      return true;
    }

    return false;
  }

  // FETCH PRODUCTS

  async function fetchProducts() {
    try {
      setError("");

      const response = await fetch(API_URL, {
        headers: getAuthHeaders(),
      });

      if (handleUnauthorized(response)) return;

      if (!response.ok) {
        throw new Error("Failed to load products.");
      }

      const data = await response.json();
      setProducts(data);
    } catch (error) {
      setError(error.message || "Could not load products.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  // FORM HANDLING

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  function handleRating(value) {
    setForm((currentForm) => ({
      ...currentForm,
      rating: value,
    }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
  }

  // CREATE / UPDATE PRODUCT

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setMessage("");

    const numericPrice = Number(form.price);
    const numericStock = Number(form.stockQuantity);

    if (!form.name.trim()) {
      setError("Please enter a product name.");
      return;
    }

    if (
      form.price.trim() === "" ||
      !Number.isFinite(numericPrice) ||
      numericPrice < 0
    ) {
      setError("Please enter a valid product price.");
      return;
    }

    if (
      form.stockQuantity.trim() === "" ||
      !Number.isInteger(numericStock) ||
      numericStock < 0
    ) {
      setError("Stock quantity must be a whole number of zero or more.");
      return;
    }

    const isEditing = editingId !== null;
    const generatedSku = `PRD-${Date.now()}`;

    const productData = {
      name: form.name.trim(),
      price: numericPrice,
      description: form.description.trim(),
      category: form.category,
      sku: form.sku.trim() || (isEditing ? "" : generatedSku),
      rating: Number(form.rating),
      stockQuantity: numericStock,
    };

    setSaving(true);

    try {
      const response = await fetch(
        isEditing ? `${API_URL}/${editingId}` : API_URL,
        {
          method: isEditing ? "PUT" : "POST",
          headers: getAuthHeaders(true),
          body: JSON.stringify(productData),
        },
      );

      if (handleUnauthorized(response)) return;

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not save product.");
      }

      if (isEditing) {
        setProducts((currentProducts) =>
          currentProducts.map((product) =>
            product._id === editingId ? data : product,
          ),
        );

        setMessage("Product updated successfully!");
      } else {
        setProducts((currentProducts) => [data, ...currentProducts]);

        setMessage("Product added successfully!");
      }

      resetForm();
    } catch (error) {
      setError(error.message || "Could not save product.");
    } finally {
      setSaving(false);
    }
  }

  // EDIT PRODUCT

  function handleEdit(product) {
    setEditingId(product._id);

    setForm({
      name: product.name || "",
      price: String(product.price ?? ""),
      description: product.description || "",
      category: product.category || "Other",
      sku: product.sku || "",
      rating: product.rating || 5,
      stockQuantity: String(product.stockQuantity ?? 0),
    });

    setError("");
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // DELETE PRODUCT

  async function handleDelete(product) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`,
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/${product._id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (handleUnauthorized(response)) return;

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not delete product.");
      }

      setProducts((currentProducts) =>
        currentProducts.filter((item) => item._id !== product._id),
      );

      if (editingId === product._id) {
        resetForm();
      }

      setMessage("Product deleted successfully!");
    } catch (error) {
      setError(error.message || "Could not delete product.");
    }
  }

  // INVENTORY SUMMARY

  const totalProducts = products.length;

  const totalUnits = products.reduce(
    (total, product) => total + (Number(product.stockQuantity) || 0),
    0,
  );

  const lowStockProducts = products.filter((product) => {
    const quantity = Number(product.stockQuantity) || 0;
    return quantity > 0 && quantity <= 10;
  }).length;

  const outOfStockProducts = products.filter(
    (product) => Number(product.stockQuantity) === 0,
  ).length;

  // SEARCH AND FILTER

  const filteredProducts = products.filter((product) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      (product.name || "").toLowerCase().includes(searchText) ||
      (product.sku || "").toLowerCase().includes(searchText) ||
      (product.category || "").toLowerCase().includes(searchText);

    const matchesCategory =
      categoryFilter === "All" ||
      (product.category || "Other") === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // STOCK STATUS

  function getStockStatus(quantity) {
    const stock = Number(quantity) || 0;

    if (stock === 0) {
      return {
        label: "Out of Stock",
        className: "out-stock",
      };
    }

    if (stock <= 10) {
      return {
        label: "Low Stock",
        className: "low-stock",
      };
    }

    return {
      label: "In Stock",
      className: "in-stock",
    };
  }

  // DEMO PRODUCT IMAGES

  function getProductImage(product) {
    const name = (product.name || "").toLowerCase();
    const category = (product.category || "").toLowerCase();

    if (name.includes("iphone") || name.includes("phone")) {
      return "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80";
    }

    if (name.includes("glasses")) {
      return "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=600&q=80";
    }

    if (name.includes("mouse")) {
      return "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=600&q=80";
    }

    if (category === "electronics") {
      return "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=600&q=80";
    }

    if (category === "furniture") {
      return "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80";
    }

    return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80";
  }

  // STAR DISPLAY

  function renderStars(rating) {
    const value = Math.max(0, Math.min(5, Number(rating) || 0));

    return (
      <div className="product-stars" aria-label={`${value} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={star <= value ? "star active" : "star"}>
            ★
          </span>
        ))}

        <span className="rating-number">{value.toFixed(1)}</span>
      </div>
    );
  }

  // PAGE UI

  return (
    <main className="products-page">
      {/* PAGE HEADER */}

      <div className="products-header">
        <div>
          <p className="eyebrow">INVENTORY MANAGEMENT</p>
          <h1>Products</h1>
          <p>Manage your products, prices, ratings and inventory.</p>
        </div>

        <div className="product-header-icon">📦</div>
      </div>

      {/* INVENTORY SUMMARY */}

      <section className="inventory-summary">
        <div className="summary-card">
          <div className="summary-icon blue">📦</div>
          <div>
            <span>Total Products</span>
            <h2>{totalProducts}</h2>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon purple">▦</div>
          <div>
            <span>Total Stock Units</span>
            <h2>{totalUnits}</h2>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon orange">⚠</div>
          <div>
            <span>Low Stock</span>
            <h2>{lowStockProducts}</h2>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon red">!</div>
          <div>
            <span>Out of Stock</span>
            <h2>{outOfStockProducts}</h2>
          </div>
        </div>
      </section>

      {/* ADD / EDIT PRODUCT FORM */}

      <section className="product-form-section">
        <div className="section-heading">
          <div>
            <h2>{editingId ? "Edit Product" : "Add New Product"}</h2>
            <p>
              {editingId
                ? "Update your product information."
                : "Enter the details of your new product."}
            </p>
          </div>
        </div>

        <form className="product-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="product-name">Product Name *</label>
              <input
                id="product-name"
                name="name"
                type="text"
                placeholder="Enter product name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="product-price">Price ($) *</label>
              <input
                id="product-price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.price}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="product-category">Category</label>
              <select
                id="product-category"
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="product-sku">SKU (Optional)</label>
              <input
                id="product-sku"
                name="sku"
                type="text"
                placeholder="Auto-generated if empty"
                value={form.sku}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="product-stock">Stock Quantity *</label>
              <input
                id="product-stock"
                name="stockQuantity"
                type="number"
                min="0"
                step="1"
                placeholder="Enter quantity"
                value={form.stockQuantity}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Product Rating</label>
              <div className="rating-input">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={
                      star <= Number(form.rating)
                        ? "rating-star selected"
                        : "rating-star"
                    }
                    onClick={() => handleRating(star)}
                    aria-label={`Set rating to ${star} stars`}
                    aria-pressed={Number(form.rating) === star}
                  >
                    ★
                  </button>
                ))}
                <span>{form.rating} / 5</span>
              </div>
            </div>

            <div className="form-group full-width">
              <label htmlFor="product-description">Description</label>
              <textarea
                id="product-description"
                name="description"
                placeholder="Write a short product description..."
                value={form.description}
                onChange={handleChange}
                rows="3"
              />
            </div>
          </div>

          <div className="form-buttons">
            <button
              type="submit"
              className="save-product-button"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Save Changes"
                  : "+ Add Product"}
            </button>

            {editingId && (
              <button
                type="button"
                className="cancel-product-button"
                onClick={resetForm}
                disabled={saving}
              >
                Cancel
              </button>
            )}
          </div>

          {message && (
            <p className="product-success" role="status">
              {message}
            </p>
          )}

          {error && (
            <p className="product-error" role="alert">
              {error}
            </p>
          )}
        </form>
      </section>

      {/* PRODUCT LIST HEADER */}

      <section className="product-list-section">
        <div className="product-list-heading">
          <div>
            <h2>Product Inventory</h2>
            <p>{filteredProducts.length} products found</p>
          </div>
        </div>

        {/* SEARCH AND FILTER */}

        <div className="product-filters">
          <div className="product-search">
            <span>⌕</span>
            <input
              type="search"
              placeholder="Search products, SKU or category..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <select
            className="category-filter"
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
          >
            <option value="All">All Categories</option>

            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* PRODUCT CARDS */}

        {loading && <p className="loading-message">Loading products...</p>}

        {!loading && error && products.length === 0 && (
          <p className="empty-products">Unable to load your products.</p>
        )}

        {!loading && products.length === 0 && !error && (
          <div className="empty-products">
            <span>📦</span>
            <h3>No products yet</h3>
            <p>Add your first product using the form above.</p>
          </div>
        )}

        {!loading && products.length > 0 && filteredProducts.length === 0 && (
          <div className="empty-products">
            <span>🔍</span>
            <h3>No matching products</h3>
            <p>Try a different search or category.</p>
          </div>
        )}

        <div className="product-grid">
          {filteredProducts.map((product) => {
            const stockStatus = getStockStatus(product.stockQuantity);

            return (
              <article className="product-card" key={product._id}>
                {/* DEMO PRODUCT IMAGE */}

                <div className="product-image-wrap">
                  <img
                    src={getProductImage(product)}
                    alt={product.name}
                    className="product-card-image"
                    loading="lazy"
                  />
                </div>

                <div className="product-card-top">
                  <div className="product-card-icon">📦</div>

                  <span className={`stock-badge ${stockStatus.className}`}>
                    {stockStatus.label}
                  </span>
                </div>

                <div className="product-card-info">
                  <span className="product-category">
                    {product.category || "General"}
                  </span>

                  <h3>{product.name}</h3>

                  <p className="product-description">
                    {product.description || "No description provided."}
                  </p>

                  {renderStars(product.rating ?? 5)}

                  <div className="product-price-row">
                    <span>Product Price</span>
                    <strong>${Number(product.price).toFixed(2)}</strong>
                  </div>

                  <div className="product-details-row">
                    <div>
                      <span>SKU</span>
                      <strong>{product.sku || "Not assigned"}</strong>
                    </div>

                    <div>
                      <span>Stock</span>
                      <strong>
                        {Number(product.stockQuantity) || 0} units
                      </strong>
                    </div>
                  </div>
                </div>

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
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

export default Products;
