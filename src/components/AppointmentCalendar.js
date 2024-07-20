/* eslint-disable react-hooks/exhaustive-deps */
//La linea de eslint-disebale....... , tiene como función desactivar la regla especifica que puede advertir sobre las dependencias faltantes en useEffetc.
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';


const AppointmentCalendar = ({ client }) => {//Se declara la variable AppointmentCalendar que esta recibiendo un prop llamado client, el cual es el ID del usuario osea el paciente que est registrado en el servidor FHIR.
 // appointments: Guarda una lista de citas disponibles.
//selectedAppointment: Almacena el ID de La cita seleccionada por el usuario.
//error: Almacena mensajes de error.
//patientData: Almacena datos del paciente.
//cesfamName: Almacena el  nombre del CESFAM (Centro de Salud Familiar).
//serviceName: Almacena el nombre del servicio de salud.
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [error, setError] = useState(null);
  const [patientData, setPatientData] = useState({});
  const [cesfamName, setCesfamName] = useState('');
  const [serviceName, setServiceName] = useState('');
  //const location = useLocation();: Obtiene la ubicación actual de la aplicación.
  //const navigate = useNavigate();: Obtiene una función para realizar la navegación programática.
  //const { service, patientId, serviceRequestId } = location.state || {};: Extrae service, patientId, y serviceRequestId del estado de la ubicación, si están disponibles.
  const location = useLocation();
  const navigate = useNavigate();
  const { service, patientId, serviceRequestId } = location.state || {};
  //Define dos rangos de identificadores de citas (firstAppointmentRange y secondAppointmentRange) y una variable de estado attempt para rastrear el intento actual de búsqueda de citas.
  //Esto funciona de la siguiente manera, cuando el paciente termina de rellenar el appoinmentFrom y da siguiente se busca una hora disponible que esa es filtrada en el primer rango de citas, si el paciente rechza una vez se vuelve a filtrar por el segunda rango de citas , y si el paciente rechaza por segunda vez se manda lista de espera.
  const firstAppointmentRange = { start: 38389, end: 38411 };
  const secondAppointmentRange = { start: 38466, end: 38486 };
  const [attempt, setAttempt] = useState(0); // Para rastrear el intento actual
  
  //Este useEffect se ejecuta cuando patientId o service cambian. Dentro de este useEffect:
  //fetchPatientData: Función asíncrona que obtiene los datos del paciente de un servidor FHIR y actualiza el estado patientData.
  //fetchCesfamName: Función asíncrona que obtiene el nombre del CESFAM y actualiza el estado cesfamName.
  //fetchServiceName: Función asíncrona que obtiene el nombre del servicio de salud y actualiza el estado serviceName.
  //Llama a estas funciones para obtener y actualizar los datos necesarios.
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

  //Este useEffect se ejecuta cuando service, attempt, firstAppointmentRange o secondAppointmentRange cambian.
 //fetchAppointments: Función asíncrona que obtiene las citas disponibles de un servidor FHIR y filtra las citas basadas en el rango de identificadores y la fecha actual.
 //Si service está definido, determina el rango de citas a utilizar (firstAppointmentRange o secondAppointmentRange) basado en el valor de attempt y llama a fetchAppointments con ese rango.
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
            const appointmentDate = new Date(app.start);
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Establece la hora a las 00:00 para comparar solo la fecha
            return (
              app.extension &&
              app.extension.some(
                ext =>
                  ext.url === "http://biomedica.uv.cl/fhir/ig/Agenda/StructureDefinition/HealthcareService" &&
                  ext.valueReference &&
                  ext.valueReference.reference === `HealthcareService/${service}`
              ) &&
              appointmentId >= range.start &&
              appointmentId <= range.end &&
              appointmentDate > today
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
  //Define una función para manejar la selección de una cita, actualizando el estado selectedAppointment.

  const handleSelectAppointment = (appointmentId) => {
    setSelectedAppointment(appointmentId);
  };

  //Define una función asíncrona handleSubmit para manejar el envío del formulario:
//e.preventDefault(): Evita el comportamiento predeterminado del formulario (que es recargar la página).
//Verifica si se ha seleccionado una cita. Si no, establece un mensaje de error.
//Intenta obtener la cita seleccionada del servidor FHIR, actualizar su estado a booked, y enviar la actualización al servidor.
//Muestra un mensaje de éxito si la cita se reserva correctamente y redirige a la página principal.
//Maneja errores mostrando mensajes de error.
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
      appointment.basedOn = [{
        reference: `ServiceRequest/${serviceRequestId}`
      }];

      console.log('Appointment to be sent:', appointment);

      const putResponse = await fetch(`http://159.223.196.104:8000/fhir/Appointment/${selectedAppointment}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/fhir+json',
          // 'If-Match': getResponse.headers.get('ETag')
        },
        body: JSON.stringify(appointment)
      });

      if (!putResponse.ok) {
        const errorData = await putResponse.json();
        console.error('Error details:', errorData);
        throw new Error(`Failed to book appointment. Details: ${JSON.stringify(errorData)}`);
      }

      const updatedAppointment = await putResponse.json();
      const practitioner = updatedAppointment.participant.find(p => p.actor.reference.startsWith('Practitioner/')).actor.display;

      alert(`Cita reservada:
      Nombre del Paciente: ${patientData.nombre} ${patientData.apellido}
      Médico: ${practitioner}
      Fecha y Hora: ${new Date(updatedAppointment.start).toLocaleString()}
      Servicio: ${serviceName}
      CESFAM: ${cesfamName}
      Estado de la cita: ${updatedAppointment.status}
      ID del ServiceRequest: ${serviceRequestId}`);

      console.log(`Appointment updated from proposed to booked with ServiceRequest ID: ${serviceRequestId}`);
      
      navigate('/');
    } catch (error) {
      console.error('Error booking appointment:', error);
      setError(`Failed to book appointment. Please try again later. Details: ${error.message}`);
    }
  };
  //Define una función para manejar el rechazo de la cita:
  //Si es el primer intento (attempt es 0), incrementa attempt a 1.
  //Si es el segundo intento, muestra un mensaje de alerta y redirige a la página principal.
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

