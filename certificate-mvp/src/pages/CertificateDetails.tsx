import { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { certificates } from '../data/certificates';
import '../styles/certificate-details.css';

function isLoggedIn() {
  return localStorage.getItem('isLoggedIn') === 'true';
}

export default function CertificateDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const certificate = useMemo(() => certificates.find((item) => item.id === id), [id]);

  if (!certificate) {
    return (
      <main className="page">
        <section className="container">
          <h1>Certificate not found</h1>
          <Link to="/certificates" className="btn btn-outline">Back to certificates</Link>
        </section>
      </main>
    );
  }

  const hasContent = certificate.courses.length > 0;

  const handleStartCourse = () => {
    if (!hasContent) return;
    if (!isLoggedIn()) {
      navigate(`/login?returnTo=/certificates/${certificate.id}`);
      return;
    }
    alert('Course starting soon');
  };

  return (
    <main className="page">
      <section className="container details">
        <div className="details-card">
          <div className="badge">{certificate.status}</div>
          <h1>{certificate.title}</h1>
          <p className="description">{certificate.description}</p>
          <div className="empty">Content coming soon</div>
          <button className="btn btn-primary" onClick={handleStartCourse} disabled={!hasContent}>
            Start course
          </button>
        </div>

        <aside className="details-side">
          <div className="card side-card">
            <h3>What you will learn</h3>
            <p className="muted">We will add courses and videos soon. Stay tuned for updates.</p>
          </div>
          <div className="card side-card">
            <h3>Need access?</h3>
            <p className="muted">Login to save your progress once content is available.</p>
            <Link to="/login" className="btn btn-outline">Login</Link>
          </div>
        </aside>
      </section>
    </main>
  );
}
