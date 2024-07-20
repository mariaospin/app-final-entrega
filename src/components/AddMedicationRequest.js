//Esta línea importa la biblioteca React y una función llamada useState. React se utiliza para construir interfaces de usuario, y useState es una herramienta que React nos da para manejar los datos en nuestras variables.
import React, { useState } from 'react';

const AddMedicationRequest = ({ client }) => {//Aquí estamos definiendo un componente de React llamado AddMedicationRequest. Un componente es una pieza reutilizable de la interfaz de usuario. ({ client }) significa que este componente espera recibir un prop llamado client.
//Estas líneas crean variables de estado para almacenar datos. useState('') significa que estamos inicializando cada una de estas variables con un valor vacío. Las variables son:
//doctor: Almacena el nombre del médico.
//medication: Almacena el nombre del medicamento.
//startDate: Almacena la fecha de inicio del tratamiento.
//endDate: Almacena la fecha de término del tratamiento.
//dosage: Almacena la dosis del medicamento.
//frequency: Almacena la frecuencia con la que se debe tomar el medicamento.
//error: Almacena cualquier mensaje de error.
  const [doctor, setDoctor] = useState('');
  const [medication, setMedication] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dosage, setDosage] = useState(''); // Nuevo estado para la dosis en formato de texto
  const [frequency, setFrequency] = useState(''); // Nuevo estado para la frecuencia
  const [error, setError] = useState(null);

  //Esta línea define una función llamada handleSubmit que se ejecutará cuando el usuario envíe el formulario. async indica que la función realizará tareas asíncronas (como llamadas a un servidor). e.preventDefault() evita que la página se recargue cuando se envía el formulario.
  const handleSubmit = async (e) => {
    e.preventDefault();
//Aquí se crea un recurso llamado practitioner que representa al médico. Este objeto sigue el formato esperado por el servidor FHIR (un servidor que maneja datos de salud).
    const practitioner = {
      resourceType: 'Practitioner',
      name: [{
        text: doctor
      }]
    };
//Estas líneas envían el objeto practitioner al servidor usando una solicitud HTTP POST. Si la solicitud falla, se lanza un error. Si tiene éxito, se obtiene la respuesta del servidor y se extrae el practitionerId, que es el identificador único del médico recién creado.
    try {
      const practitionerResponse = await fetch('http://159.223.196.104:8000/fhir/Practitioner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/fhir+json'
        },
        body: JSON.stringify(practitioner)
      });
      if (!practitionerResponse.ok) throw new Error('Failed to create practitioner');
      const practitionerData = await practitionerResponse.json();
      const practitionerId = practitionerData.id;
//De manera similar, se crea y envía un objeto medicationResource al servidor para registrar el medicamento. Si la solicitud es exitosa, se obtiene el medicationId, el identificador único del medicamento recién creado.
      const medicationResource = {
        resourceType: 'Medication',
        code: {
          coding: [{
            system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
            code: '123456',
            display: medication
          }]
        }
      };
//Aquí se crea un objeto medicationRequest que combina la información del medicamento y del médico, junto con otros detalles del tratamiento (como la dosis y la frecuencia). Este objeto también se envía al servidor FHIR. Si la solicitud es exitosa, se muestra una alerta con el ID de la solicitud de medicamento recién creada.
      const medicationResponse = await fetch('http://159.223.196.104:8000/fhir/Medication', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/fhir+json'
        },
        body: JSON.stringify(medicationResource)
      });
      if (!medicationResponse.ok) throw new Error('Failed to create medication');
      const medicationData = await medicationResponse.json();
      const medicationId = medicationData.id;

      const medicationRequest = {
        resourceType: 'MedicationRequest',
        status: 'active',
        intent: 'order',
        medicationReference: {
          reference: `Medication/${medicationId}`,
          display: medication
        },
        subject: {
          reference: 'Patient/263',
          display: 'Maria Ospina'
        },
        authoredOn: new Date().toISOString(),
        requester: {
          reference: `Practitioner/${practitionerId}`,
          display: doctor
        },
        dosageInstruction: [{
          timing: {
            repeat: {
              boundsPeriod: {
                start: startDate,
                end: endDate
              },
              frequency: parseInt(frequency) || 1 // Asegurarse de que la frecuencia sea un número
            }
          },
          route: {
            coding: [{
              system: 'http://terminology.hl7.org/CodeSystem/v3-RouteOfAdministration',
              code: 'oral',
              display: 'Oral'
            }]
          },
          doseAndRate: [{
            doseQuantity: {
              value: parseFloat(dosage) || 1, // Asegurarse de que la dosis sea un número
              unit: 'as described',
              system: 'http://unitsofmeasure.org',
              code: 'as described'
            }
          }]
        }]
      };

      const medicationRequestResponse = await fetch('http://159.223.196.104:8000/fhir/MedicationRequest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/fhir+json'
        },
        body: JSON.stringify(medicationRequest)
      });
      if (!medicationRequestResponse.ok) throw new Error('Failed to create medication request');
      const medicationRequestData = await medicationRequestResponse.json();

      alert(`MedicationRequest created with ID: ${medicationRequestData.id}`);
    } catch (error) {
      console.error('Error creating resources:', error);
      setError('Failed to create resources. Please try again later.');
    }
  };
//Estas líneas definen el formulario que el usuario verá y usará para ingresar la información del medicamento:
//Se muestra un título "Ingreso de Medicamentos".
//Si hay un error, se muestra un mensaje de error.
//Cada campo del formulario (nombre del médico, nombre del medicamento, fecha de inicio, fecha de término, dosis y frecuencia) está asociado a una variable de estado y se actualiza cada vez que el usuario escribe algo en los campos.
//Un botón "Guardar" para enviar el formulario.
  return (
    <form onSubmit={handleSubmit}>
      <h2>Ingreso de Medicamentos</h2>
      {error && <div className="error">{error}</div>}
      <div>
        <label>Nombre del Médico:</label>
        <input
          type="text"
          value={doctor}
          onChange={(e) => setDoctor(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Nombre del Medicamento:</label>
        <input
          type="text"
          value={medication}
          onChange={(e) => setMedication(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Fecha de Inicio:</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Fecha de Término:</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Dosis:</label> {/* Nuevo campo para la dosis */}
        <input
          type="text"
          value={dosage}
          onChange={(e) => setDosage(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Frecuencia:</label> {/* Nuevo campo para la frecuencia */}
        <input
          type="text"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
          required
        />
      </div>
      <button type="submit">Guardar</button>
    </form>
  );
};

export default AddMedicationRequest;

