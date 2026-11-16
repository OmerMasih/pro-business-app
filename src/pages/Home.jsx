import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import "./Home.css";

const API_URL = "https://pro-business-app-1.onrender.com";

const CHART_COLORS = ["#16a34a", "#ef4444"];

function Home() {
  const [employees, setEmployees] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        const [employeeResponse, productResponse] = await Promise.all([
          fetch(`${API_URL}/employees`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),

          fetch(`${API_URL}/products`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        if (!employeeResponse.ok || !productResponse.ok) {
          throw new Error("Unable to load dashboard data.");
        }

        const employeeData = await employeeResponse.json();
        const productData = await productResponse.json();

        setEmployees(employeeData);
        setProducts(productData);
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Employee statistics
  const activeEmployees = employees.filter(
    (employee) => employee.status === "Active",
  );

  const inactiveEmployees = employees.filter(
    (employee) => employee.status !== "Active",
  );

  const recentEmployees = [...employees].slice(0, 5);
  const recentProducts = [...products].slice(0, 5);

  // Employee status chart data
  const employeeStatusData = [
    { name: "Active", value: activeEmployees.length },
    { name: "Inactive", value: inactiveEmployees.length },
  ];

  // Employee position chart data
  const employeePositionData = Object.entries(
    employees.reduce((positions, employee) => {
      const position = employee.position?.trim() || "Not specified";
      positions[position] = (positions[position] || 0) + 1;
      return positions;
    }, {}),
  ).map(([name, total]) => ({
    name,
    total,
  }));

  // Product price chart data
  const productPriceData = products.slice(0, 8).map((product) => ({
    name: product.name,
    price: Number(product.price) || 0,
  }));

  // Monthly employee growth data
  const monthlyEmployeeData = employees.reduce((months, employee) => {
    if (!employee.createdAt) return months;

    const date = new Date(employee.createdAt);

    const month = date.toLocaleString("en-US", {
      month: "short",
      year: "numeric",
    });

    months[month] = (months[month] || 0) + 1;

    return months;
  }, {});

  const employeeGrowthData = Object.entries(monthlyEmployeeData)
    .map(([month, total]) => ({
      month,
      total,
      date: new Date(`${month} 1`),
    }))
    .sort((a, b) => a.date - b.date);

  // Currency formatting
  const formatCurrency = (value) =>
    Number(value).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });

  return (
    <main className="dashboard">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">BUSINESS MANAGEMENT</p>
          <h1>Dashboard Overview</h1>
          <p>Welcome to your Pro Business management system.</p>
        </div>

        <div className="dashboard-actions">
          <Link to="/employees" className="dashboard-button">
            + Add Employee
          </Link>

          <Link to="/products" className="dashboard-button secondary">
            + Add Product
          </Link>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="dashboard-error">
          {error}
          <p>Make sure your backend server is running.</p>
        </div>
      )}

      {/* Dashboard Statistics */}
      <section className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon">👥</div>
          <div>
            <p>Total Employees</p>
            <h2>{loading ? "..." : employees.length}</h2>
            <span>Registered employees</span>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon">📦</div>
          <div>
            <p>Total Products</p>
            <h2>{loading ? "..." : products.length}</h2>
            <span>Available products</span>
          </div>
        </div>

        <div className="stat-card purple">
          <div className="stat-icon">✅</div>
          <div>
            <p>Active Employees</p>
            <h2>{loading ? "..." : activeEmployees.length}</h2>
            <span>Currently active</span>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-icon">📊</div>
          <div>
            <p>Business Status</p>
            <h2>{loading ? "..." : "Active"}</h2>
            <span>Management overview</span>
          </div>
        </div>
      </section>

      {/* Business Analytics */}
      <section className="analytics-section">
        <div className="analytics-heading">
          <h2>Business Analytics</h2>
          <p>Visual reports based on your business records</p>
        </div>

        <div className="analytics-grid">
          {/* Employee Status Pie Chart */}
          <div className="dashboard-panel chart-panel">
            <div className="panel-header">
              <div>
                <h2>Employee Status</h2>
                <p>Active and inactive employees</p>
              </div>
            </div>

            {loading ? (
              <p className="empty-message">Loading chart...</p>
            ) : employees.length === 0 ? (
              <p className="empty-message">No employee data available.</p>
            ) : (
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={employeeStatusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {employeeStatusData.map((entry, index) => (
                        <Cell key={entry.name} fill={CHART_COLORS[index]} />
                      ))}
                    </Pie>

                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Employee Position Bar Chart */}
          <div className="dashboard-panel chart-panel">
            <div className="panel-header">
              <div>
                <h2>Employees by Position</h2>
                <p>Employee distribution by job title</p>
              </div>
            </div>

            {loading ? (
              <p className="empty-message">Loading chart...</p>
            ) : employeePositionData.length === 0 ? (
              <p className="empty-message">No employee data available.</p>
            ) : (
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={employeePositionData}
                    margin={{
                      top: 10,
                      right: 15,
                      left: 0,
                      bottom: 10,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      interval={0}
                      angle={-15}
                      textAnchor="end"
                      height={65}
                    />
                    <YAxis allowDecimals={false} />
                    <Tooltip />

                    <Bar
                      dataKey="total"
                      name="Employees"
                      fill="#6366f1"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Product Price Bar Chart */}
          <div className="dashboard-panel chart-panel full-chart">
            <div className="panel-header">
              <div>
                <h2>Product Price Overview</h2>
                <p>Prices of your first eight products</p>
              </div>
            </div>

            {loading ? (
              <p className="empty-message">Loading chart...</p>
            ) : productPriceData.length === 0 ? (
              <p className="empty-message">No product data available.</p>
            ) : (
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={productPriceData}
                    margin={{
                      top: 10,
                      right: 20,
                      left: 15,
                      bottom: 35,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                      height={75}
                    />
                    <YAxis tickFormatter={(value) => `$${value}`} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />

                    <Bar
                      dataKey="price"
                      name="Product Price"
                      fill="#0ea5e9"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Monthly Employee Growth Chart */}
          <div className="dashboard-panel chart-panel full-chart">
            <div className="panel-header">
              <div>
                <h2>Monthly Employee Growth</h2>
                <p>Number of employees registered each month</p>
              </div>
            </div>

            {loading ? (
              <p className="empty-message">Loading chart...</p>
            ) : employeeGrowthData.length === 0 ? (
              <p className="empty-message">
                No employee registration dates available.
              </p>
            ) : (
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={employeeGrowthData}
                    margin={{
                      top: 10,
                      right: 20,
                      left: 10,
                      bottom: 10,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />

                    <Bar
                      dataKey="total"
                      name="New Employees"
                      fill="#8b5cf6"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Recent Employees and Products */}
      <section className="dashboard-content">
        {/* Recent Employees */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h2>Recent Employees</h2>
              <p>Your latest employee records</p>
            </div>

            <Link to="/employees">View All →</Link>
          </div>

          {loading ? (
            <p className="empty-message">Loading employees...</p>
          ) : recentEmployees.length === 0 ? (
            <p className="empty-message">
              No employees found. Add your first employee.
            </p>
          ) : (
            <div className="table-wrapper">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Position</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {recentEmployees.map((employee) => (
                    <tr key={employee._id}>
                      <td>{employee.fullName}</td>
                      <td>{employee.position}</td>
                      <td>
                        <span
                          className={`status-badge ${
                            employee.status === "Active" ? "active" : "inactive"
                          }`}
                        >
                          {employee.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Products */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h2>Recent Products</h2>
              <p>Your latest products</p>
            </div>

            <Link to="/products">View All →</Link>
          </div>

          {loading ? (
            <p className="empty-message">Loading products...</p>
          ) : recentProducts.length === 0 ? (
            <p className="empty-message">
              No products found. Add your first product.
            </p>
          ) : (
            <div className="table-wrapper">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                  </tr>
                </thead>

                <tbody>
                  {recentProducts.map((product) => (
                    <tr key={product._id}>
                      <td>{product.name}</td>
                      <td>{formatCurrency(product.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="quick-actions">
        <h2>Quick Actions</h2>

        <div className="quick-action-grid">
          <Link to="/employees" className="quick-action-card">
            <span>👥</span>
            <div>
              <h3>Manage Employees</h3>
              <p>Add, edit, and search employees.</p>
            </div>
            <strong>→</strong>
          </Link>

          <Link to="/products" className="quick-action-card">
            <span>📦</span>
            <div>
              <h3>Manage Products</h3>
              <p>Add, edit, and manage products.</p>
            </div>
            <strong>→</strong>
          </Link>
        </div>
      </section>
    </main>
  );
}

export default Home;
