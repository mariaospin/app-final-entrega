import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import InstitutionSelect from './InstitutionSelect';
import ServiceSelect from './ServiceSelect';

const AppointmentForm = ({ client }) => {
  const [institutions, setInstitutions] = useState([]);
  const [healthcareServices, setHealthcareServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [institution, setInstitution] = useState('');
  const [service, setService] = useState('');
  const [priority, setPriority] = useState('routine');
  const [error, setError] = useState(null);

  const [patientData, setPatientData] = useState({
    nombre: '',
    apellido: '',
    rut: '',
    fechaNacimiento: '',
    prevision: '',
    edad: ''
  });

  const navigate = useNavigate();

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

export default AppointmentForm;