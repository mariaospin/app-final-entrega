import React, { useState, useEffect } from 'react';

const ViewAppointments = ({ client }) => {
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState(null);
  const cesfamName = "CESFAM RODELILLO";

  useEffect(() => {
    const fetchServiceName = async (serviceId) => {
      try {
        const response = await fetch(`http://159.223.196.104:8000/fhir/HealthcareService/${serviceId}`, {
          headers: {
            'Content-Type': 'application/fhir+json'
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch service name');
        }
        const data = await response.json();
        return data.name || 'No especificado';
      } catch (error) {
        console.error('Error fetching service name:', error);
        return 'No especificado';
      }
    };

    const fetchAppointments = async () => {
      console.log('Fetching booked appointments');
      try {
        const response = await fetch('http://159.223.196.104:8000/fhir/Appointment?status=booked', {
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
          const bookedAppointments = await Promise.all(data.entry.map(async entry => {
            const appointment = entry.resource;

            const healthcareServiceExtension = appointment.extension?.find(ext => ext.url === 'http://biomedica.uv.cl/fhir/ig/Agenda/StructureDefinition/HealthcareService');
            if (!healthcareServiceExtension) return null;

            const healthcareServiceReference = healthcareServiceExtension.valueReference.reference;
            const serviceId = healthcareServiceReference.split('/')[1];
            const serviceName = await fetchServiceName(serviceId);

            const practitioner = appointment.participant.find(p => p.actor.reference.startsWith('Practitioner/'))?.actor.display || 'No especificado';

            return {
              id: appointment.id,
              start: appointment.start,
              practitioner,
              serviceName,
              cesfamName
            };
          }));

          setAppointments(bookedAppointments.filter(app => app !== null));
        } else {
          setAppointments([]);
        }
      } catch (error) {
        console.error('Error fetching appointments:', error);
        setError('Error fetching appointments');
      }
    };

    fetchAppointments();
  }, []);

  return (
    <div>
      <h2>Mis Citas</h2>
      {error && <div className="error">{error}</div>}
      <table>
        <thead>
          <tr>
            <th>Fecha y Hora</th>
            <th>Médico</th>
            <th>Servicio</th>
            <th>CESFAM</th>
          </tr>
        </thead>
        <tbody>
          {appointments.length === 0 ? (
            <tr>
              <td colSpan="4">No appointments available.</td>
            </tr>
          ) : (
            appointments.map(app => (
              <tr key={app.id}>
                <td>{new Date(app.start).toLocaleString()}</td>
                <td>{app.practitioner}</td>
                <td>{app.serviceName}</td>
                <td>{app.cesfamName}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ViewAppointments;


