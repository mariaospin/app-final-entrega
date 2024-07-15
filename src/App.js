import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { oauth2 as SMART } from 'fhirclient';
import AppointmentForm from './components/AppointmentForm';
import Medication from './components/Medication';
import AddMedicationRequest from './components/AddMedicationRequest';
import ViewMedications from './components/ViewMedications';
import AppointmentCalendar from './components/AppointmentCalendar';
import ViewAppointments from './components/ViewAppointments';
import './App.css';

const Home = () => (
  <div>
    <h2>Bienvenido</h2>
    <p>Seleccione una opción</p>
  </div>
);

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
        <nav>
          <Link to="/appointment">Agendar Cita</Link>
          <Link to="/medication">Registro de Fármacos</Link>
          <Link to="/appointments">Mis Citas</Link>
        </nav>
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











