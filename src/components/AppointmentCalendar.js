import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const AppointmentCalendar = ({ client }) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [provider, setProvider] = useState('');
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { institution, service } = location.state || {};

  const handleSubmit = async (e) => {
    e.preventDefault();

    const appointment = {
      resourceType: 'Appointment',
      status: 'booked',
      description: service,
      start: `${date}T${time}:00Z`,
      participant: [
        {
          actor: {
            display: institution
          }
        },
        {
          actor: {
            display: provider
          }
        }
      ]
    };

    try {
      const response = await client.create({
        resourceType: "Appointment",
        body: appointment,
        headers: {
          "Content-Type": "application/fhir+json"
        }
      });

      alert(`Appointment created with ID: ${response.id}`);
      navigate('/');
    } catch (error) {
      console.error('Error creating appointment:', error);
      setError('Failed to create appointment. Please try again later.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Seleccione Fecha y Hora</h2>
      {error && <div className="error">{error}</div>}
      <div>
        <label>Fecha:</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </div>
      <div>
        <label>Hora:</label>
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
      </div>
      <div>
        <label>Prestador:</label>
        <input type="text" value={provider} onChange={(e) => setProvider(e.target.value)} required />
      </div>
      <button type="submit">Aceptar</button>
    </form>
  );
};

export default AppointmentCalendar;
