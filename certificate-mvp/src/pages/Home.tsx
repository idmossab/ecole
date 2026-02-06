import { Link } from 'react-router-dom';
import { certificates } from '../data/certificates';
import '../styles/home.css';

export default function Home() {
  return (
    <main className="page">
      <section className="container hero">
        <div className="hero-content">
          <h1>Learn with certificate-focused programs.</h1>
          <p>
            Explore flexible learning paths designed for modern careers. Certificates are open to everyone and
            accessible anywhere.
          </p>
          <div className="hero-actions">
            <Link to="/certificates" className="btn btn-primary">Browse Certificates</Link>
            <Link to="/login" className="btn btn-outline">Login</Link>
          </div>
        </div>
        <div className="hero-card">
          <div className="badge">Certificate Spotlight</div>
          <h3>Software Development</h3>
          <p>Build modern applications and grow into a full-stack developer.</p>
          <Link className="btn btn-primary" to="/certificates/software-development">View Certificate</Link>
        </div>
      </section>

      <section className="container section">
        <div className="section-header">
          <div>
            <h2 className="section-title">Featured Certificates</h2>
            <p className="section-subtitle">Choose a certificate and start planning your next skills upgrade.</p>
          </div>
          <Link to="/certificates" className="btn btn-outline">View all</Link>
        </div>

        <div className="grid grid-3">
          {certificates.map((cert) => (
            <div key={cert.id} className="card cert-card">
              <h3>{cert.title}</h3>
              <p>{cert.subtitle}</p>
              <Link className="btn btn-primary" to={`/certificates/${cert.id}`}>View</Link>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
