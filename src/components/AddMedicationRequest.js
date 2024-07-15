import React, { useState } from 'react';

const AddMedicationRequest = ({ client }) => {
  const [doctor, setDoctor] = useState('');
  const [medication, setMedication] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const practitioner = {
      resourceType: 'Practitioner',
      name: [{
        text: doctor
      }]
    };

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
              }
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
              value: 1,
              unit: 'tablet',
              system: 'http://unitsofmeasure.org',
              code: 'tab'
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
      <button type="submit">Guardar</button>
    </form>
  );
};

export default AddMedicationRequest;






