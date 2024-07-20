import React from 'react';
//Se importa esta funcion , la cual nos permite crear enlaces para navegar a diferentes páginas sin recargar la página.
import { Link } from 'react-router-dom';

//Se crea la variable llamada Medication.
//Se muestra el titulo de Registro de farmacos.
// con <nav> es para cear un bloque de navegación que contiene los enlaces.
// <Link to="/medication/add">Ingresar Receta</Link>: Crea un enlace que lleva a la página para agregar una nueva receta.
//to="/medication/add": Especifica la dirección a la que llevará este enlace.
//Ingresar Receta: Es el texto que verá el usuario y que puede hacer clic.
//<Link to="/medication/view">Ver Recetas</Link>: Crea un enlace que lleva a la página para ver las recetas existentes.
//to="/medication/view": Especifica la dirección a la que llevará este enlace.
//Ver Recetas: Es el texto que verá el usuario y que puede hacer clic.
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

