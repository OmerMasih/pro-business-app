import { Link } from "react-router-dom";
import "./Login.css";

function Login() {
  return (
    <main className="login-page">
      <div className="login-card">
        <h1>Welcome Back</h1>
        <p>Login to your Pro Business account.</p>

        <form>
          <label>Email</label>
          <input type="email" placeholder="Enter your email" />

          <label>Password</label>
          <input type="password" placeholder="Enter your password" />

          <button type="submit">Login</button>
          <p className="register-link">
            Don't have an account? <Link to="/register">Create Account</Link>
          </p>
        </form>
      </div>
    </main>
  );
}

export default Login;
