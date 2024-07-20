import React from 'react';

//Se crea un compoennet lalamdo Instituciónselect,este recibe tres cosas la lista de instituciones que estan en el servidor Fhir, institution recibe la institucion selecionada y finalmente setIntitution es una función para cambiar la organización sleeccionada.
//Funciona igual que el codigo de seleccionar un servicio.
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


