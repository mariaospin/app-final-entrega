import React, { useState, useEffect } from 'react';
// Se importa useNavigate , ya que tinen como funcion permitir a los usuarios redirigirse a diferentes rutas dentro de la aplicación si necesidad de que hagan clic en un enlace.
import { useNavigate } from 'react-router-dom';
//Se importa estos componentes para usarlos en los desplegables con el fin de que el usuario escoja una organizacion y segun la organizacion , se escoge los servicios que requiere.
import InstitutionSelect from './InstitutionSelect';
import ServiceSelect from './ServiceSelect';

//En esta parte del codigo se crean las variables, para guardar, primero la institucion u organización que el usuario escoge en la pantalla.
//Tambien se escoge y se guarda el servicio, , tambien para filtrar los servicios.
//La prioridad son que pide la cita.
//y tambien guarda los errores que se va generando cuando se ejecuta el codigo , para que finalmente los muestre en la consola de la app.
const AppointmentForm = ({ client }) => {
  const [institutions, setInstitutions] = useState([]);
  const [healthcareServices, setHealthcareServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [institution, setInstitution] = useState('');
  const [service, setService] = useState('');
  const [priority, setPriority] = useState('routine');
  const [error, setError] = useState(null);

  //Esta variable es para mostrar los datos rescatados del paciente que se enrolo manualmente en el postman.
  //se muestra como un formulario.
  const [patientData, setPatientData] = useState({
    nombre: '',
    apellido: '',
    rut: '',
    fechaNacimiento: '',
    prevision: '',
    edad: ''
  });

  //Se declara esta variable , para que cuando el usuario haya escogido la organizacion, el servicio y la prioridad, pase al siguiente punto que es  escoger la hora con solo un click.
  const navigate = useNavigate();

  //En le useEffect se pone el codigo que queremos que comience a ejecutar, primero que busque por medio de la URL/Organization/ID, busque su nombre para que sea mostrado en pantalla.
  //Luego se busca por el servicio que el usuario escogio, y se muestra en pantalla, ademas para mejor rendimieto se le dice que solo muestre los servicios que esten los ID entre el 353 y el  372.
  //Luego el usuario escoge la prioridad con que necesita la cita si es de rutina o es urgente.
  //Finalmente, con la URL y el ID de patient, para rescatar los datos y mostrarlos en pantalla.
  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const response1 = await fetch('http://159.223.196.104:8000/fhir/Organization/338', {
          headers: {
            'Content-Type': 'application/fhir+json'
          }
        });
        const data1 = await response1.json();
        const institutionsData = [
          { id: data1.id, name: data1.name },
        ];
        setInstitutions(institutionsData);
      } catch (error) {
        console.error('Error fetching institutions:', error);
        setError('Error fetching institutions');
      }
    };

    const fetchHealthcareServices = async () => {
      try {
        const response = await fetch('http://159.223.196.104:8000/fhir/HealthcareService', {
          headers: {
            'Content-Type': 'application/fhir+json'
          }
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch healthcare services: ${response.status}`);
        }
        const data = await response.json();
        if (data.entry) {
          const servicesData = data.entry.map(entry => ({
            id: entry.resource.id,
            name: entry.resource.name,
            providedBy: entry.resource.providedBy?.reference?.split('/')[1]
          }));
          const filteredData = servicesData.filter(service => {
            const serviceId = parseInt(service.id, 10);
            return serviceId >= 353 && serviceId <= 372;
          });
          setHealthcareServices(filteredData);
        }
      } catch (error) {
        console.error('Error fetching healthcare services:', error);
        setError('Error fetching healthcare services');
      }
    };

    const fetchPatientData = async () => {
      try {
        const response = await fetch('http://159.223.196.104:8000/fhir/Patient/263', {
          headers: {
            'Content-Type': 'application/fhir+json'
          }
        });
        const patient = await response.json();
        const birthDate = patient.birthDate || '';
        const edad = calculateAge(birthDate);
        const nombre = patient.name[0]?.given[0] || '';
        const apellido = patient.name[0]?.family || '';
        const rut = patient.identifier[0]?.value || '';
        const prevision = patient.extension.find(ext => ext.url === 'http://biomedica.uv.cl/fhir/ig/Agenda/StructureDefinition/Prevision')?.valueReference.display || '';

        setPatientData({
          nombre,
          apellido,
          rut,
          fechaNacimiento: birthDate,
          prevision,
          edad
        });
      } catch (error) {
        console.error('Error fetching patient data:', error);
        setError('Error fetching patient data');
      }
    };

    fetchInstitutions();
    fetchHealthcareServices();
    fetchPatientData();
  }, []);

  useEffect(() => {
    const servicesForInstitution = healthcareServices.filter(service => service.providedBy === institution);
    setFilteredServices(servicesForInstitution);
  }, [institution, healthcareServices]);

  const handlePatientDataChange = (e) => {
    const { name, value } = e.target;
    setPatientData({ ...patientData, [name]: value });
  };

  //Apartir de este codigo se comienza a crear el recurso ServiceRequest, automaticamente.
  //Prevent Default: e.preventDefault(); evita que el formulario se envíe de la manera predeterminada.
  //Crear el ServiceRequest: Se construye el objeto serviceRequest con los datos necesarios.
  //Enviar la solicitud: Se utiliza fetch para enviar una solicitud POST al servidor FHIR con el serviceRequest.
 ///Manejo de errores: Si la solicitud no es exitosa (!response.ok), se lanza un error.
 //Respuesta exitosa: Si la solicitud es exitosa, se muestra un mensaje de éxito y se redirige a la página principal usando navigate('/').
//Catch: Si ocurre algún error, se maneja mostrando un mensaje de error
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const serviceRequest = {
        resourceType: "ServiceRequest",
        id: "ejemplo1",
        meta: {
          versionId: "1",
          lastUpdated: new Date().toISOString(),
          source: "#4UGOQ86lRgAtYSI0",
          profile: [
            "http://biomedica.uv.cl/fhir/ig/crisis/StructureDefinition/SolicitudServicio"
          ]
        },
        extension: [
          {
            url: "http://biomedica.uv.cl/fhir/ig/crisis/StructureDefinition/Prestaciones",
            valueCode: "18"
          },
          {
            url: "http://biomedica.uv.cl/fhir/ig/Agenda/StructureDefinition/HealthcareService",
            valueReference: {
              reference: `HealthcareService/${service}`
            }
          }
        ],
        status: "active",
        intent: "order",
        priority: priority,
        subject: {
          reference: "Patient/263",
          display: `${patientData.nombre} ${patientData.apellido}`
        },
        authoredOn: new Date().toISOString()
      };

      const response = await fetch('http://159.223.196.104:8000/fhir/ServiceRequest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/fhir+json'
        },
        body: JSON.stringify(serviceRequest)
      });

      if (!response.ok) {
        throw new Error('Error creating ServiceRequest');
      }

      const createdServiceRequest = await response.json();
      navigate('/appointment/calendar', { state: { institution, service, patientData, serviceRequestId: createdServiceRequest.id, patientId: 263 } });
    } catch (error) {
      console.error('Error creating ServiceRequest:', error);
      setError('Error creating ServiceRequest');
    }
  };

  //Esta variable segun la frcha de nacimiento del paciente calcula los años que tiene.
  const calculateAge = (birthDate) => {
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDifference = today.getMonth() - birthDateObj.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Agendar Cita</h2>
      {error && <div className="error">{error}</div>}
      <InstitutionSelect institutions={institutions} institution={institution} setInstitution={setInstitution} />
      <ServiceSelect services={filteredServices} service={service} setService={setService} />
      <label>
        Prioridad:
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="routine">Rutina</option>
          <option value="urgent">Urgente</option>
        </select>
      </label>
      <input
        type="text"
        name="nombre"
        value={patientData.nombre}
        onChange={handlePatientDataChange}
        placeholder="Nombre del paciente"
        required
      />
      <input
        type="text"
        name="apellido"
        value={patientData.apellido}
        onChange={handlePatientDataChange}
        placeholder="Apellido del paciente"
        required
      />
      <input
        type="text"
        name="rut"
        value={patientData.rut}
        onChange={handlePatientDataChange}
        placeholder="RUT paciente"
        required
      />
      <input
        type="date"
        name="fechaNacimiento"
        value={patientData.fechaNacimiento}
        onChange={handlePatientDataChange}
        required
      />
      <input
        type="number"
        name="edad"
        value={patientData.edad}
        onChange={handlePatientDataChange}
        placeholder="Edad"
        readOnly
      />
      <input
        type="text"
        name="prevision"
        value={patientData.prevision}
        onChange={handlePatientDataChange}
        placeholder="Previsión"
        required
      />
      <button type="submit">Siguiente</button>
    </form>
  );
};

//Exporta para que se utilicen las variables escogidas y guardadas, para ser usadas en la otra ruta. 
export default AppointmentForm;