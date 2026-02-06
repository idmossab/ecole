import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { certificates } from '../data/certificates';
import '../styles/certificate-details.css';

function isLoggedIn() {
  return localStorage.getItem('isLoggedIn') === 'true';
}

export default function CertificateDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [showComingSoon, setShowComingSoon] = useState(false);

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

  const hasContent = certificate.courses.some((course) => course.videoCount > 0);

  const handleStartCourse = () => {
    if (!hasContent) {
      setShowComingSoon(true);
      return;
    }
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
          <div className="badge">Open to everyone</div>
          <h1>{certificate.title}</h1>
          <p className="description">{certificate.description}</p>
          <div className="empty">Content coming soon</div>
        </div>

        <aside className="details-side">
          <div className="card side-card">
            <h3>Program notes</h3>
            <p className="muted">Courses are listed below. Videos will be added soon.</p>
          </div>
          <div className="card side-card">
            <h3>Need access?</h3>
            <p className="muted">Login to save your progress once content is available.</p>
            <Link to="/login" className="btn btn-outline">Login</Link>
          </div>
        </aside>
      </section>

      <section className="container courses">
        <h2 className="section-title">Courses</h2>
        <div className="grid grid-3">
          {certificate.courses.map((course) => (
            <div key={course.id} className="card course-card">
              <h3>{course.title}</h3>
              <div className="course-meta">
                <span>{course.durationMinutes} min</span>
                <span>{course.videoCount} videos</span>
              </div>
              <button className="btn btn-primary" disabled={!hasContent} onClick={handleStartCourse}>
                Start course
              </button>
            </div>
          ))}
        </div>
      </section>

      {showComingSoon && (
        <div className="modal-backdrop" onClick={() => setShowComingSoon(false)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <h3>Content coming soon</h3>
            <p>Courses are being prepared. Check back shortly.</p>
            <button className="btn btn-primary" onClick={() => setShowComingSoon(false)}>Okay</button>
          </div>
        </div>
      )}
    </main>
  );
}
