import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AppointmentForm = ({ client }) => {
  const [institution, setInstitution] = useState('');
  const [service, setService] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/appointment/calendar', { state: { institution, service } });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Agendar Cita</h2>
      <div>
        <label>Institución:</label>
        <input
          type="text"
          value={institution}
          onChange={(e) => setInstitution(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Prestación:</label>
        <select value={service} onChange={(e) => setService(e.target.value)} required>
          <option value="">Seleccione...</option>
          <option value="consulta">Consulta</option>
          <option value="examen">Examen</option>
          {/* Agregar más opciones según sea necesario */}
        </select>
      </div>
      <button type="submit">Siguiente</button>
    </form>
  );
};

export default AppointmentForm;
