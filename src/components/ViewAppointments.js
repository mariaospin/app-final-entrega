import React, { useState, useEffect } from 'react';

//Primero se crea una vairaible llamada Viewappointment que va a mostrar todas las citas, que haya escogido el cliente,que se declara en la parte principal app.js
//luego dentro de esta variable, se van a guardar la ista de citas, los errores que se encontraron para despues mostrarlos en consola,y ademas siempre va a guardar la variable del CESFAM,ene ste caso solo se tiene un CESFAm osea la organización por eso solo se le pone el ID, en caso de puede darse la ocpion de decile que solo muestre las citas a los CESFAM escogidos en la parte de appoinmentForm.js.
const ViewAppointments = ({ client }) => {
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState(null);
  const cesfamName = "CESFAM RODELILLO";

  //Aca el useEffect() hace la funcón de que traiga a pantalla las citas cuando el usuario haya cargado de la pagina, osea seleecionare sa opción en la app.
  //para mostrar el nombre del servicio, se toma el ID del servicio escogido en appointmentform, que luego se guarda, y se utiliza aca donde se le pide al sistema que con el ID del recurso servicio, busque el nombre para mostarlo en la tabla.
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

    //Esta variable va a mostrar la lista de todas las citas que haya tomado el paciente, filtra y solo muestra las citas que su estado sea booked (reservado).
    //Primero busca todas las citas y va filtrando solo por las que esten reservadas, si hay citas que cumplen con el estado reservado, se procesa cada cita para obtener detalles como nombre del médico y el nombre del servicio de salud.
    //si no hay citas se establece como una lista vacia.
    //Se llama a la función fetchAppoinments para que empiece a obtener las citas cuando se carga la pagina.
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

  //finalmente, los resultados de arriba se muestran en pantalla con este codigo.
  //para cada columna, se llava a cada variable filtrandolos por el ID obtenido anteriormente, con el recurso appointment.
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