import React, { useState, useEffect } from 'react';
import '../App.css';

const ViewMedications = ({ client }) => {
  const [medications, setMedications] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMedications = async () => {
      try {
        const response = await client.request('Medication');
        setMedications(response.entry || []);
      } catch (error) {
        console.error('Error fetching medications:', error);
        setError('Error fetching medications');
      }
    };

    fetchMedications();
  }, [client]);

  return (
    <div>
      <h2>Ver Recetas</h2>
      {error && <div className="error">{error}</div>}
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Medicamento</th>
            <th>Médico</th>
            <th>Fecha de Inicio</th>
            <th>Fecha de Término</th>
          </tr>
        </thead>
        <tbody>
          {medications.map((entry) => {
            const medicationRequest = entry.resource;
            const medication = medicationRequest.medicationCodeableConcept?.text || 'N/A';
            const requester = medicationRequest.requester?.display || 'N/A';
            const dosageInstruction = medicationRequest.dosageInstruction?.[0]?.text || 'N/A';
            const dosageParts = dosageInstruction.split(' ');
            const startDate = dosageParts[2] || 'N/A';
            const endDate = dosageParts[4] || 'N/A';

            return (
              <tr key={medicationRequest.id}>
                <td>{medicationRequest.id}</td>
                <td>{medication}</td>
                <td>{requester}</td>
                <td>{startDate}</td>
                <td>{endDate}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ViewMedications;
