import React from 'react';

const InstitutionSelect = ({ institutions, institution, setInstitution }) => {
  return (
    <div>
      <label htmlFor="institution">Institución:</label>
      <select
        id="institution"
        value={institution}
        onChange={(e) => setInstitution(e.target.value)}
        required
      >
        <option value="">Seleccione...</option>
        {institutions.map((institution) => (
          <option key={institution.id} value={institution.id}>
            {institution.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default InstitutionSelect;


