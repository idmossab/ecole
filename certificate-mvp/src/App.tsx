import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Certificates from './pages/Certificates';
import CertificateDetails from './pages/CertificateDetails';
import Diplomas from './pages/Diplomas';
import Login from './pages/Login';

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/certificates" element={<Certificates />} />
        <Route path="/certificates/:id" element={<CertificateDetails />} />
        <Route path="/diplomas" element={<Diplomas />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
