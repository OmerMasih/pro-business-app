import "./Register.css";

function Register() {
  return (
    <main className="register-page">
      <div className="register-card">
        <h1>Create Account</h1>
        <p>Create your Pro Business account.</p>

        <form>
          <label>Full Name</label>
          <input type="text" placeholder="Enter your full name" />

          <label>Email</label>
          <input type="email" placeholder="Enter your email" />

          <label>Password</label>
          <input type="password" placeholder="Create a password" />

          <label>Confirm Password</label>
          <input type="password" placeholder="Confirm your password" />

          <button type="submit">Create Account</button>
        </form>
      </div>
    </main>
  );
}

export default Register;
