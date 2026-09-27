import "./Home.css";

function Home() {
  return (
    <main className="home">
      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">BUSINESS MANAGEMENT</p>

          <h1>
            Manage Your Business
            <span> Smarter.</span>
          </h1>

          <p className="hero-text">
            Pro Business App helps you manage products, employees, and your
            business operations in one place.
          </p>

          <div className="hero-buttons">
            <button>Get Started</button>
            <button className="secondary-button">Learn More</button>
          </div>
        </div>
      </section>

      <section className="features">
        <h2>Everything You Need</h2>

        <p className="section-text">
          Simple tools to help you manage your business efficiently.
        </p>

        <div className="feature-grid">
          <div className="feature-card">
            <h3>📦 Products</h3>
            <p>Manage your products, inventory, and business items.</p>
          </div>

          <div className="feature-card">
            <h3>👥 Employees</h3>
            <p>Keep track of your employees and manage your team.</p>
          </div>

          <div className="feature-card">
            <h3>📊 Dashboard</h3>
            <p>View important business information from one dashboard.</p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Home;
