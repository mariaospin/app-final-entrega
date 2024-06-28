import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { oauth2 as SMART } from 'fhirclient';
import AppointmentForm from './components/AppointmentForm';
import Medication from './components/Medication';
import AddMedication from './components/AddMedication';
import ViewMedications from './components/ViewMedications';
import AppointmentCalendar from './components/AppointmentCalendar';
import './App.css';

const App = () => {
  const [client, setClient] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    SMART.init({
      clientId: 'my-client-id', // Puedes usar cualquier clientId genérico
      scope: 'patient/*.write',
      redirectUri: window.location.origin, // Asegúrate de que este sea el URI de redirección que registraste
      iss: 'http://159.223.196.104:8000/fhir',
    }).then(client => {
      setClient(client);
    }).catch(err => {
      console.error('Error initializing SMART on FHIR client:', err);
      setError('Failed to connect to FHIR server. Please check your network or server settings.');
    });
  }, []);

  return (
    <Router>
      <div className="App">
        <h1>SMART on FHIR App</h1>
        <nav>
          <Link to="/appointment">Agendar Cita</Link>
          <Link to="/medication">Registro de Fármacos</Link>
        </nav>
        {error && <div className="error">{error}</div>}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/appointment" element={<AppointmentForm client={client} />} />
          <Route path="/appointment/calendar" element={<AppointmentCalendar client={client} />} />
          <Route path="/medication" element={<Medication />} />
          <Route path="/medication/add" element={<AddMedication client={client} />} />
          <Route path="/medication/view" element={<ViewMedications client={client} />} />
        </Routes>
      </div>
    </Router>
  );
};

const Home = () => (
  <div>
    <h2>Bienvenido</h2>
    <p>Seleccione una opción</p>
  </div>
);

export default App;
