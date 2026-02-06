import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { certificates } from '../data/certificates';
import '../styles/certificates.css';

export default function Certificates() {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return certificates;
    return certificates.filter((cert) => cert.title.toLowerCase().includes(term));
  }, [query]);

  return (
    <main className="page">
      <section className="container">
        <div className="section-header">
          <div>
            <h1 className="section-title">Certificates</h1>
            <p className="section-subtitle">Find a certificate that matches your career goals.</p>
          </div>
          <input
            className="search-input"
            placeholder="Search certificate"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <div className="grid grid-3">
          {filtered.map((cert) => (
            <div key={cert.id} className="card cert-card">
              <h3>{cert.title}</h3>
              <p>{cert.description}</p>
              <div className="course-count">{cert.courses.length} courses</div>
              <Link className="btn btn-primary" to={`/certificates/${cert.id}`}>View</Link>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
