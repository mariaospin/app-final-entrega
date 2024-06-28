import React from 'react';
import { Link } from 'react-router-dom';

const Medication = () => {
  return (
    <div>
      <h2>Registro de Fármacos</h2>
      <nav>
        <Link to="/medication/add">Ingresar Receta</Link>
        <Link to="/medication/view">Ver Recetas</Link>
      </nav>
    </div>
  );
};

export default Medication;
