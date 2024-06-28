import React, { useState } from 'react';
import '../App.css';

const AddMedication = ({ client }) => {
  const [doctor, setDoctor] = useState('');
  const [medication, setMedication] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const prescription = {
      resourceType: 'Medication',
      status: 'active',
      intent: 'order',
      medicationCodeableConcept: {
        text: medication,
      },
      subject: {
        reference: 'Patient/example', // Asegúrate de ajustar esto para referenciar al paciente correcto
      },
      requester: {
        display: doctor,
      },
      authoredOn: new Date().toISOString(),
      dosageInstruction: [
        {
          text: `Take from ${startDate} to ${endDate}`,
        },
      ],
    };

    try {
      const response = await client.create({
        resourceType: 'Medication',
        body: prescription,
        headers: {
          'Content-Type': 'application/fhir+json',
        },
      });

      alert(`Medication  created with ID: ${response.id}`);
    } catch (error) {
      console.error('Error creating medication request:', error);
      setError('Failed to create medication request. Please try again later.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Ingresar Receta</h2>
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

export default AddMedication;
