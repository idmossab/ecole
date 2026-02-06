import { NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="nav">
      <div className="container nav-inner">
        <div className="brand">CourseOnline</div>
        <nav className="nav-links">
          <NavLink to="/" className="nav-link">Home</NavLink>
          <NavLink to="/certificates" className="nav-link">Certificates</NavLink>
          <NavLink to="/diplomas" className="nav-link">Diplomas</NavLink>
          <NavLink to="/login" className="btn btn-primary">Login</NavLink>
        </nav>
      </div>
    </header>
  );
}
