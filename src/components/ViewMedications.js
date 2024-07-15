import React, { useState, useEffect } from 'react';

const ViewMedications = ({ client }) => {
  const [medications, setMedications] = useState([]);
  const [filteredMedications, setFilteredMedications] = useState([]);
  const [error, setError] = useState(null);
  const [doctorFilter, setDoctorFilter] = useState('');
  const [medicationFilter, setMedicationFilter] = useState('');
  const patientId = '263';

  useEffect(() => {
    const fetchMedications = async () => {
      try {
        const response = await fetch(`http://159.223.196.104:8000/fhir/MedicationRequest?subject=Patient/${patientId}`, {
          headers: {
            'Content-Type': 'application/fhir+json'
          }
        });
        if (!response.ok) throw new Error('Failed to fetch medications');
        const data = await response.json();
        setMedications(data.entry || []);
        setFilteredMedications(data.entry || []);
      } catch (error) {
        console.error('Error fetching medications:', error);
        setError('Error fetching medications');
      }
    };

    fetchMedications();
  }, [patientId]);

  useEffect(() => {
    const filtered = medications.filter((entry) => {
      const medicationRequest = entry.resource;
      const doctor = medicationRequest.requester?.display || '';
      const medication = medicationRequest.medicationReference?.display || '';
      return (
        doctor.toLowerCase().includes(doctorFilter.toLowerCase()) &&
        medication.toLowerCase().includes(medicationFilter.toLowerCase())
      );
    });
    setFilteredMedications(filtered);
  }, [doctorFilter, medicationFilter, medications]);

  return (
    <div>
      <h2>Ver Medicamentos</h2>
      {error && <div className="error">{error}</div>}
      <div>
        <label>Filtrar por Nombre del Médico:</label>
        <input
          type="text"
          value={doctorFilter}
          onChange={(e) => setDoctorFilter(e.target.value)}
          placeholder="Nombre del Médico"
        />
      </div>
      <div>
        <label>Filtrar por Nombre del Medicamento:</label>
        <input
          type="text"
          value={medicationFilter}
          onChange={(e) => setMedicationFilter(e.target.value)}
          placeholder="Nombre del Medicamento"
        />
      </div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre del Medicamento</th>
            <th>Nombre del Médico</th>
            <th>Fecha de Inicio</th>
            <th>Fecha de Término</th>
          </tr>
        </thead>
        <tbody>
          {filteredMedications.map((entry) => {
            const medicationRequest = entry.resource;
            const medication = medicationRequest.medicationReference?.display || 'N/A';
            const doctor = medicationRequest.requester?.display || 'N/A';
            const startDate = medicationRequest.dosageInstruction[0]?.timing?.repeat?.boundsPeriod?.start || 'N/A';
            const endDate = medicationRequest.dosageInstruction[0]?.timing?.repeat?.boundsPeriod?.end || 'N/A';

            return (
              <tr key={medicationRequest.id}>
                <td>{medicationRequest.id}</td>
                <td>{medication}</td>
                <td>{doctor}</td>
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





