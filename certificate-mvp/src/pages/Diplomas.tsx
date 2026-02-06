import { Link } from 'react-router-dom';
import '../styles/diplomas.css';

export default function Diplomas() {
  return (
    <main className="page">
      <section className="container coming">
        <div className="card coming-card">
          <div className="badge">Coming soon</div>
          <h1>Diplomas are on the way</h1>
          <p>We are building full diploma programs. Meanwhile, explore certificates.</p>
          <Link to="/certificates" className="btn btn-primary">Browse Certificates</Link>
        </div>
      </section>
    </main>
  );
}
