import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import { oauth2 as SMART } from 'fhirclient';
import AppointmentForm from './components/AppointmentForm';
import Medication from './components/Medication';
import AddMedicationRequest from './components/AddMedicationRequest';
import ViewMedications from './components/ViewMedications';
import AppointmentCalendar from './components/AppointmentCalendar';
import ViewAppointments from './components/ViewAppointments';
import './App.css';
import logo from './assets/logo aplicacion.PNG'; // Asegúrate de que la ruta sea correcta

const Home = () => (
  <div className="home-container">
    <div className="welcome-text">
      <h2>Bienvenido</h2>
      <p>Seleccione una opción</p>
    </div>
    <nav className="navigation">
      <Link to="/appointment" className="nav-button">Agendar Cita</Link>
      <Link to="/medication" className="nav-button">Registro de Fármacos</Link>
      <Link to="/appointments" className="nav-button">Mis Citas</Link>
    </nav>
  </div>
);

const Header = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogoClick = () => {
    navigate('/');
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className="header">
      <img src={logo} alt="SIMSADI Logo" className="logo" onClick={handleLogoClick} />
      <div className={`hamburger-menu ${menuOpen ? 'open' : ''}`} onClick={toggleMenu}>
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
      </div>
      {menuOpen && (
        <nav className="mobile-navigation">
          <Link to="/appointment" className="nav-button" onClick={() => setMenuOpen(false)}>Agendar Cita</Link>
          <Link to="/medication" className="nav-button" onClick={() => setMenuOpen(false)}>Registro de Fármacos</Link>
          <Link to="/appointments" className="nav-button" onClick={() => setMenuOpen(false)}>Mis Citas</Link>
        </nav>
      )}
    </header>
  );
};

const App = () => {
  const [client, setClient] = useState(null);
  const [error, setError] = useState(null);
  const patientId = '263'; // Establecer patientId a 263
  const [selectedOrganizationId, setSelectedOrganizationId] = useState(null);

  useEffect(() => {
    SMART.init({
      clientId: 'my-client-id',
      scope: 'patient/*.write',
      redirectUri: window.location.origin,
      iss: 'http://159.223.196.104:8000/fhir'
    }).then(client => {
      setClient(client);
    }).catch(err => {
      console.error('Error initializing SMART on FHIR client:', err);
      setError('Failed to connect to FHIR server. Please check your network or server settings.');
    });
  }, []);

  const handleOrganizationSelect = (orgId) => {
    setSelectedOrganizationId(orgId);
  };

  return (
    <Router>
      <div className="App">
        <Header />
        {error && <div className="error">{error}</div>}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/appointment" element={<AppointmentForm client={client} onSelectOrganization={handleOrganizationSelect} />} />
          <Route path="/appointment/calendar" element={<AppointmentCalendar client={client} />} />
          <Route path="/medication" element={<Medication />} />
          <Route path="/medication/add" element={<AddMedicationRequest client={client} />} />
          <Route path="/medication/view" element={<ViewMedications client={client} />} />
          <Route path="/appointments" element={<ViewAppointments client={client} patientId={patientId} selectedOrganizationId={selectedOrganizationId} />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;



