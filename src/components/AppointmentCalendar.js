/* eslint-disable no-mixed-operators */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const AppointmentCalendar = ({ client }) => {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [error, setError] = useState(null);
  const [patientData, setPatientData] = useState({});
  const [cesfamName, setCesfamName] = useState('');
  const [serviceName, setServiceName] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { service, patientId } = location.state || {};
  const firstAppointmentRange = { start: 38389, end: 38411 };
  const secondAppointmentRange = { start: 38466, end: 38486 };
  const [attempt, setAttempt] = useState(0); // Para rastrear el intento actual

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const response = await fetch(`http://159.223.196.104:8000/fhir/Patient/${patientId}`, {
          headers: {
            'Content-Type': 'application/fhir+json'
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch patient data');
        }
        const data = await response.json();
        setPatientData({
          nombre: data.name[0]?.given[0] || '',
          apellido: data.name[0]?.family || ''
        });
      } catch (error) {
        console.error('Error fetching patient data:', error);
        setError('Error fetching patient data');
      }
    };

    const fetchCesfamName = async () => {
      try {
        const response = await fetch('http://159.223.196.104:8000/fhir/Organization/338', {
          headers: {
            'Content-Type': 'application/fhir+json'
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch CESFAM name');
        }
        const data = await response.json();
        setCesfamName(data.name);
      } catch (error) {
        console.error('Error fetching CESFAM name:', error);
        setError('Error fetching CESFAM name');
      }
    };

    const fetchServiceName = async () => {
      try {
        const response = await fetch(`http://159.223.196.104:8000/fhir/HealthcareService/${service}`, {
          headers: {
            'Content-Type': 'application/fhir+json'
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch service name');
        }
        const data = await response.json();
        setServiceName(data.name);
      } catch (error) {
        console.error('Error fetching service name:', error);
        setError('Error fetching service name');
      }
    };

    fetchPatientData();
    fetchCesfamName();
    fetchServiceName();
  }, [patientId, service]);

  useEffect(() => {
    console.log('Fetching appointments for service:', service);
    const fetchAppointments = async (range) => {
      try {
        const response = await fetch(`http://159.223.196.104:8000/fhir/Appointment?status=proposed`, {
          headers: {
            'Content-Type': 'application/fhir+json'
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch appointments');
        }
        const data = await response.json();
        console.log('Fetched Appointments Data:', data);
        if (data.entry) {
          const fetchedAppointments = data.entry.map(entry => entry.resource).filter(app => {
            const appointmentId = parseInt(app.id, 10);
            return (
              app.extension &&
              app.extension.some(
                ext =>
                  ext.url === "http://biomedica.uv.cl/fhir/ig/Agenda/StructureDefinition/HealthcareService" &&
                  ext.valueReference &&
                  ext.valueReference.reference === `HealthcareService/${service}`
              ) &&
              appointmentId >= range.start &&
              appointmentId <= range.end
            );
          });
          console.log('Filtered Appointments:', fetchedAppointments);
          setAppointments(fetchedAppointments);
        } else {
          setAppointments([]);
        }
      } catch (error) {
        console.error('Error fetching appointments:', error);
        setError('Error fetching appointments');
      }
    };

    if (service) {
      const range = attempt === 0 ? firstAppointmentRange : secondAppointmentRange;
      console.log(`Attempt: ${attempt} Using range:`, range);
      fetchAppointments(range);
    }
  }, [service, attempt, firstAppointmentRange, secondAppointmentRange]);

  const handleSelectAppointment = (appointmentId) => {
    setSelectedAppointment(appointmentId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedAppointment) {
      setError('Please select an available time slot.');
      return;
    }

    try {
      // Obtener la versión más reciente del Appointment antes de actualizar
      const getResponse = await fetch(`http://159.223.196.104:8000/fhir/Appointment/${selectedAppointment}`, {
        headers: {
          'Content-Type': 'application/fhir+json'
        }
      });

      if (!getResponse.ok) {
        throw new Error('Failed to fetch appointment for update');
      }

      const appointment = await getResponse.json();
      appointment.status = 'booked';

      console.log('Appointment to be sent:', appointment);

      const putResponse = await fetch(`http://159.223.196.104:8000/fhir/Appointment/${selectedAppointment}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/fhir+json',
          'If-Match': getResponse.headers.get('ETag') // Utilizar ETag para la concurrencia
        },
        body: JSON.stringify(appointment)
      });

      if (!putResponse.ok) {
        const errorData = await putResponse.json();
        console.error('Error details:', errorData);
        throw new Error(`Failed to book appointment. Details: ${JSON.stringify(errorData)}`);
      }

      const practitioner = appointment.participant.find(p => p.actor.reference.startsWith('Practitioner/')).actor.display;

      alert(`Cita reservada:
      Nombre del Paciente: ${patientData.nombre} ${patientData.apellido}
      Médico: ${practitioner}
      Fecha y Hora: ${new Date(appointment.start).toLocaleString()}
      Servicio: ${serviceName}
      CESFAM: ${cesfamName}`);
      
      navigate('/');
    } catch (error) {
      console.error('Error booking appointment:', error);
      setError(`Failed to book appointment. Please try again later. Details: ${error.message}`);
    }
  };

  const handleReject = () => {
    if (attempt === 0) {
      setAttempt(1);
      console.log('First attempt rejected, moving to second range');
    } else {
      alert('No hay más citas disponibles. Queda en lista de espera.');
      navigate('/');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Seleccione Fecha y Hora</h2>
      {error && <div className="error">{error}</div>}
      <table>
        <thead>
          <tr>
            <th>Fecha y Hora</th>
            <th>Prestador</th>
            <th>Seleccionar</th>
          </tr>
        </thead>
        <tbody>
          {appointments.length === 0 ? (
            <tr>
              <td colSpan="3">No appointments available.</td>
            </tr>
          ) : (
            appointments.map(app => (
              <tr key={app.id}>
                <td>{new Date(app.start).toLocaleString()}</td>
                <td>{app.participant.find(p => p.actor.reference.startsWith('Practitioner/')).actor.display}</td>
                <td>
                  <input
                    type="radio"
                    id={app.id}
                    name="appointment"
                    value={app.id}
                    onChange={() => handleSelectAppointment(app.id)}
                  />
                  <label htmlFor={app.id}></label>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <button type="submit">Aceptar</button>
      <button type="button" onClick={handleReject}>Rechazar</button>
    </form>
  );
};

export default AppointmentCalendar;







