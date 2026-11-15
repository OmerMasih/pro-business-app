import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Employees.css";

const API_URL = "http://localhost:5000/api/employees";

const emptyForm = {
  fullName: "",
  email: "",
  phone: "",
  position: "",
  salary: "",
  status: "Active",
};

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  // Authentication headers
  function getAuthHeaders(includeJson = false) {
    const token = localStorage.getItem("token");

    return {
      ...(includeJson ? { "Content-Type": "application/json" } : {}),
      Authorization: `Bearer ${token}`,
    };
  }

  // Handle expired or invalid authentication
  function handleUnauthorized(response) {
    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      navigate("/login", { replace: true });
      return true;
    }

    return false;
  }

  // Fetch employees from MongoDB
  async function fetchEmployees(searchTerm = search) {
    try {
      setError("");

      const response = await fetch(
        `${API_URL}?search=${encodeURIComponent(searchTerm)}`,
        {
          headers: getAuthHeaders(),
        },
      );

      if (handleUnauthorized(response)) return;

      if (!response.ok) {
        throw new Error("Failed to load employees.");
      }

      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      setError(error.message || "Could not load employees.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEmployees("");
  }, []);

  // Update form fields
  function handleChange(event) {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  // Clear form
  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  // Add or update employee
  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setMessage("");

    const numericSalary = Number(form.salary);

    if (
      !form.fullName.trim() ||
      !form.email.trim() ||
      !form.position.trim() ||
      form.salary.trim() === "" ||
      !Number.isFinite(numericSalary) ||
      numericSalary < 0
    ) {
      setError("Please complete all required fields correctly.");
      return;
    }

    setSaving(true);

    try {
      const isEditing = editingId !== null;

      const response = await fetch(
        isEditing ? `${API_URL}/${editingId}` : API_URL,
        {
          method: isEditing ? "PUT" : "POST",
          headers: getAuthHeaders(true),
          body: JSON.stringify({
            ...form,
            fullName: form.fullName.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            position: form.position.trim(),
            salary: numericSalary,
          }),
        },
      );

      const data = await response.json();

      if (handleUnauthorized(response)) return;

      if (!response.ok) {
        throw new Error(data.message || "Could not save employee.");
      }

      if (isEditing) {
        setMessage("Employee updated successfully!");
      } else {
        setMessage("Employee added successfully!");
      }

      resetForm();
      await fetchEmployees();
    } catch (error) {
      setError(error.message || "Could not save employee.");
    } finally {
      setSaving(false);
    }
  }

  // Edit employee
  function handleEdit(employee) {
    setEditingId(employee._id);

    setForm({
      fullName: employee.fullName,
      email: employee.email,
      phone: employee.phone || "",
      position: employee.position,
      salary: String(employee.salary),
      status: employee.status,
    });

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // Delete employee
  async function handleDelete(employee) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${employee.fullName}?`,
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/${employee._id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (handleUnauthorized(response)) return;

      if (!response.ok) {
        throw new Error(data.message || "Could not delete employee.");
      }

      setMessage("Employee deleted successfully!");

      if (editingId === employee._id) {
        resetForm();
      }

      await fetchEmployees();
    } catch (error) {
      setError(error.message || "Could not delete employee.");
    }
  }

  // Search employees
  function handleSearch(event) {
    const value = event.target.value;

    setSearch(value);
    fetchEmployees(value);
  }

  const activeCount = employees.filter(
    (employee) => employee.status === "Active",
  ).length;

  return (
    <main className="employees-page">
      <header className="employees-header">
        <p className="eyebrow">TEAM MANAGEMENT</p>
        <h1>Employee Management</h1>
        <p>Manage your business team in one place.</p>
      </header>

      {/* Employee statistics */}
      <section className="employee-stats">
        <div className="stat-card">
          <span>Total Employees</span>
          <h2>{employees.length}</h2>
        </div>

        <div className="stat-card">
          <span>Active Employees</span>
          <h2>{activeCount}</h2>
        </div>

        <div className="stat-card">
          <span>Inactive Employees</span>
          <h2>{employees.length - activeCount}</h2>
        </div>
      </section>

      {/* Add or edit employee form */}
      <form className="employee-form" onSubmit={handleSubmit}>
        <h2>{editingId ? "Edit Employee" : "Add New Employee"}</h2>

        <label htmlFor="fullName">Full Name *</label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          placeholder="Enter full name"
          value={form.fullName}
          onChange={handleChange}
          required
        />

        <label htmlFor="email">Email *</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="Enter email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <label htmlFor="phone">Phone</label>
        <input
          id="phone"
          name="phone"
          type="tel"
          placeholder="Enter phone number"
          value={form.phone}
          onChange={handleChange}
        />

        <label htmlFor="position">Position *</label>
        <input
          id="position"
          name="position"
          type="text"
          placeholder="e.g. Manager"
          value={form.position}
          onChange={handleChange}
          required
        />

        <label htmlFor="salary">Salary ($) *</label>
        <input
          id="salary"
          name="salary"
          type="number"
          min="0"
          step="0.01"
          placeholder="Enter salary"
          value={form.salary}
          onChange={handleChange}
          required
        />

        <label htmlFor="status">Employment Status</label>
        <select
          id="status"
          name="status"
          value={form.status}
          onChange={handleChange}
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>

        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : editingId ? "Save Changes" : "Add Employee"}
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

        {message && (
          <p className="employee-success" role="status">
            {message}
          </p>
        )}

        {error && (
          <p className="employee-error" role="alert">
            {error}
          </p>
        )}
      </form>

      {/* Search */}
      <section className="employee-list">
        <div className="employee-list-header">
          <h2>Our Employees</h2>

          <input
            type="search"
            placeholder="Search by name or position..."
            value={search}
            onChange={handleSearch}
            aria-label="Search employees"
          />
        </div>

        {loading && <p>Loading employees...</p>}

        {!loading && employees.length === 0 && (
          <p>No employees found. Add your first employee!</p>
        )}

        <div className="employee-grid">
          {employees.map((employee) => (
            <article className="employee-card" key={employee._id}>
              <div className="employee-avatar">
                {employee.fullName.charAt(0).toUpperCase()}
              </div>

              <h3>{employee.fullName}</h3>
              <p>{employee.position}</p>

              <div className="employee-details">
                <p>
                  <strong>Email:</strong> {employee.email}
                </p>

                <p>
                  <strong>Phone:</strong> {employee.phone || "Not provided"}
                </p>

                <p>
                  <strong>Salary:</strong> $
                  {Number(employee.salary).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>

              <span
                className={`employee-status ${
                  employee.status === "Active"
                    ? "status-active"
                    : "status-inactive"
                }`}
              >
                {employee.status}
              </span>

              <div className="employee-actions">
                <button
                  type="button"
                  className="edit-button"
                  onClick={() => handleEdit(employee)}
                >
                  Edit
                </button>

                <button
                  type="button"
                  className="delete-button"
                  onClick={() => handleDelete(employee)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default Employees;
