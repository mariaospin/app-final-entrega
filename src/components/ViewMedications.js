import React, { useState, useEffect } from 'react';

// se crean variables , para que guarden datos, de lo que ingresa el paciente.
//medications, guarda todos los nombres de los mediamentos.
//filteredMedications, guarda todos la lista de medicaments que han sido filtrados.
//error, guarda todas los errores que ocurren al ejecutar el codigo.
//doctorfilter, es para filtrar los medicamentos por doctor.
//patientId, es para gaudra el número de identificación del paciente.
const ViewMedications = ({ client }) => {
  const [medications, setMedications] = useState([]);
  const [filteredMedications, setFilteredMedications] = useState([]);
  const [error, setError] = useState(null);
  const [doctorFilter, setDoctorFilter] = useState('');
  const [medicationFilter, setMedicationFilter] = useState('');
  const patientId = '263';

  //se crea una tarea para obtener medicamentos, se pide la información a la URL protegida uqe es la apigateway, la cosulta se hace de la siguiente manera, es la URL/Recurso/se le pregunta el recurso si conteine el ID del paciente, y se guardan todos los datos que haya ingresado ese ID al recurso.
  //si la respuesta es 200 se guardan los datos.
  //si es mala se guardan los errores y se muestran en consola.
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

  //en esta parte del codigo se genera una nueva tarea, lo que se hace es para filtrar por nombre del medico o nombre del medicamento, esto se hace e la siguiente manera:
  // se revisa cada medicamento y se  mira  el nombre del doctor y el nombre del medicamento.
  //Se verifica si coincide con el nombre el usuario ingreso, si coincide se hace una nueva lista, y se llamaa a la tarea cada vez que los filtros cambian.
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
//en esta parte comenzamos a crear la pantala.
//lo primero es definir el codigo en este caso se definio como ver medicamentos dentro de un encabezado de segundo nivel, osea como un subtitulo e la pagina.
//esta la parte donde muestra si se encuentra algun error en el momento en que se corre el codigo.
//lo segundp que se hace es crear un campo con el <div> <label>.... donde va a permitir  el usuario ingresar un nombre ya sea del emdico o del emdiamento para filtrar la tabla que se esta mostrando en pantalla.
//lo siguiente es crear la tabla, en este caso se crea una tabla con 7 columnas, y cada columna tiene un nombre <thead>, que permite nombrar los encabezados de cada columna.
//Aquí, filteredMedications.map((entry) => {...}) toma cada medicamento de la lista filtrada y crea una fila en la tabla.
//const medicationRequest = entry.resource; saca la información importante de cada medicamento.
//const medication = medicationRequest.medicationReference?.display || 'N/A'; obtiene el nombre del medicamento. Si no hay nombre, muestra 'N/A'.
//const doctor = medicationRequest.requester?.display || 'N/A'; obtiene el nombre del médico. Si no hay nombre, muestra 'N/A'.
//const startDate = medicationRequest.dosageInstruction[0]?.timing?.repeat?.boundsPeriod?.start || 'N/A'; obtiene la fecha de inicio. Si no hay fecha, muestra 'N/A'.
//const endDate = medicationRequest.dosageInstruction[0]?.timing?.repeat?.boundsPeriod?.end || 'N/A'; obtiene la fecha de término. Si no hay fecha, muestra 'N/A'.
//const dosage = medicationRequest.dosageInstruction[0]?.doseAndRate[0]?.doseQuantity?.value || 'N/A'; obtiene la dosis del medicamento. Si no hay dosis, muestra 'N/A'.
//const frequency = medicationRequest.dosageInstruction[0]?.timing?.repeat?.frequency || 'N/A'; obtiene la frecuencia del medicamento. Si no hay frecuencia, muestra 'N/A'.
//Cada fila de la tabla (<tr>) muestra la información del medicamento en las columnas correspondientes (<td>).
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
            <th>Dosis</th>
            <th>Frecuencia</th> {/* Nueva columna para la frecuencia */}
          </tr>
        </thead>
        <tbody>
          {filteredMedications.map((entry) => {
            const medicationRequest = entry.resource;
            const medication = medicationRequest.medicationReference?.display || 'N/A';
            const doctor = medicationRequest.requester?.display || 'N/A';
            const startDate = medicationRequest.dosageInstruction[0]?.timing?.repeat?.boundsPeriod?.start || 'N/A';
            const endDate = medicationRequest.dosageInstruction[0]?.timing?.repeat?.boundsPeriod?.end || 'N/A';
            const dosage = medicationRequest.dosageInstruction[0]?.doseAndRate[0]?.doseQuantity?.value || 'N/A'; // Obtener la dosis
            const frequency = medicationRequest.dosageInstruction[0]?.timing?.repeat?.frequency || 'N/A'; // Obtener la frecuencia

            return (
              <tr key={medicationRequest.id}>
                <td>{medicationRequest.id}</td>
                <td>{medication}</td>
                <td>{doctor}</td>
                <td>{startDate}</td>
                <td>{endDate}</td>
                <td>{dosage}</td> {/* Mostrar la dosis */}
                <td>{frequency}</td> {/* Mostrar la frecuencia */}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

//finalmente se exportan todas las funciones para que puedan ser utilizadas.
export default ViewMedications;

