import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import '../styles/login.css';

export default function Login() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const returnTo = params.get('returnTo') || '/certificates';

  const handleLogin = () => {
    localStorage.setItem('isLoggedIn', 'true');
    navigate(returnTo);
  };

  return (
    <main className="page">
      <section className="container login">
        <div className="card login-card">
          <h1>Login</h1>
          <p>Sign in to access certificates as they become available.</p>
          <button className="btn btn-primary" onClick={handleLogin}>Login as Student</button>
          <div className="login-footer">
            <span>New here?</span>
            <Link to="/certificates">Browse certificates</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
