import React, { useEffect, useState } from 'react';//Se llama a la bibliotea principal REACT, la cual se utiliza para crear los componentes,como el UseEffect que es un hook de el framework que se usa para manejar fectos secundari en componentes funcionales, como por ejemplo, obtener datos,el useState, se utiliza para consultar cobre los compoenen que estan en estado local y sean funcionales.
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';// Esta importacion permite la utilizacion de las rutas , por eso se llama route, que es donde se define una ruta especifica y este renderiza la URL cuando coincida con la ruta.lo mismo pasa con routes,toma todos los codigos de cada ruta y los traduce a elementos visuales los cuales cumplen cierta funcion en la app.
import { oauth2 as SMART } from 'fhirclient';//esta importación facilita la autenticación y autorización mendiante el protocolo SMART on FHIR.
//lo siguientes 6 importaciones llaman a todas las funciones que esta en la carpeta de componentes.
import AppointmentForm from './components/AppointmentForm';
import Medication from './components/Medication';
import AddMedicationRequest from './components/AddMedicationRequest';
import ViewMedications from './components/ViewMedications';
import AppointmentCalendar from './components/AppointmentCalendar';
import ViewAppointments from './components/ViewAppointments';
//importa el archivo CSS que es el que contiene los estilos visuales de la aplicación.
import './App.css';
import logo from './assets/logo aplicacion.PNG'; // Ruta para cargar el logo de la aplicación.


//interfaz principal, donde muestra todas las funciones princpales de la applicación.
const Home = () => (  
  <div className="home-container">
    <div className="welcome-text">
      <h2>Bienvenido</h2>
      <p>Seleccione una opción</p>
    </div>
    <nav className="navigation"> 
      <Link to="/appointment" className="nav-button">Agendar Cita</Link>
      <Link to="/medication" className="nav-button">Registro de Fármacos</Link>
      <Link to="/appointments" className="nav-button">Mis Citas</Link>
    </nav>
  </div>
);
// esta funcion , es para cuando apretamos el logo nos lleve ala pagina principal.
const Header = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogoClick = () => {
    navigate('/');
  };
// esta función dice que cuando se hace click en el menú, lo abra si esta cerrado y lo cierre si esta abierto.
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
// en esta parte , tiene varias fucniones primero la parte de el logo, es para que muestre el logo y lo haga como un botón.
// luego esta el menú donde muestra que cuando, este abierto muestre los botones que llevan a el ususario a otras funciones.

  return (
    <header className="header">
      <img src={logo} alt="SIMSADI Logo" className="logo" onClick={handleLogoClick} />
      <div className={`hamburger-menu ${menuOpen ? 'open' : ''}`} onClick={toggleMenu}>
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
      </div>
      {menuOpen && (
        <nav className="mobile-navigation">
          <Link to="/appointment" className="nav-button" onClick={() => setMenuOpen(false)}>Agendar Cita</Link>
          <Link to="/medication" className="nav-button" onClick={() => setMenuOpen(false)}>Registro de Fármacos</Link>
          <Link to="/appointments" className="nav-button" onClick={() => setMenuOpen(false)}>Mis Citas</Link>
        </nav>
      )}
    </header>
  );
};

//en esta parte se comienza a crear el componente de la aplicacion declarando variabes y estados, la cajita de cliente se guarda la información sobre el cliente, el setClient es una función que se usa para cambiar lo que hay en la cajita, useState acá se le dice a que empiece con la cajita de cliente vacia.
//La función de error se utiliza para guardar los errores recolectados.
// La función patientId es una variable donde se guarda el ID del paciente que ya se enrolo anteriormente con postman.
//La cajita de selectedOrganizationId, que se usa para cambiar lo que hay en la cajita, y se guarda la variable osea el ID de la organización que escogio el usuario.
const App = () => {
  const [client, setClient] = useState(null);
  const [error, setError] = useState(null);
  const patientId = '263'; // Establecer patientId a 263
  const [selectedOrganizationId, setSelectedOrganizationId] = useState(null);

  // esta parte useEfffect,  le dice a Reacta que dbe de hacer algo despues de que el paciente haya seleccionado una función en la app.
  // Smart.init conecta la palicación al servidor FHIR, utilizando información importante como es el clientId y las direcciones, y con scope lo que el usuario puede hacer.
  // el .then , si la conexion es extsa, se guarda la información del cliente.
  //.catch se guarda el mensaje y lo muestra en la consola.
  useEffect(() => {
    SMART.init({
      clientId: 'my-client-id',
      scope: 'patient/*.write',
      redirectUri: window.location.origin,
      iss: 'http://159.223.196.104:8000/fhir'
    }).then(client => {
      setClient(client);
    }).catch(err => {
      console.error('Error initializing SMART on FHIR client:', err);
      setError('Failed to connect to FHIR server. Please check your network or server settings.');
    });
  }, []);

  //esta función es guarda y recuerda siempre la organización que se ha seleccionado.
  const handleOrganizationSelect = (orgId) => {
    setSelectedOrganizationId(orgId);
  };

  //Router es como el director , el decide que partes de la aplicació mostrar, según la selección del usuario.
  //el <Router> es el que se encarga de mostrar las rutas de la aplicación
  //Header muestra el encabezao con el logo y el menú.
  //{error && <div className="error">{error}</div>} muestra un mensaje de error si hay un problema.
  //Route path='' element , define que componenete muestra para cada dirección
  return (
    <Router>
      <div className="App">
        <Header />
        {error && <div className="error">{error}</div>}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/appointment" element={<AppointmentForm client={client} onSelectOrganization={handleOrganizationSelect} />} />
          <Route path="/appointment/calendar" element={<AppointmentCalendar client={client} />} />
          <Route path="/medication" element={<Medication />} />
          <Route path="/medication/add" element={<AddMedicationRequest client={client} />} />
          <Route path="/medication/view" element={<ViewMedications client={client} />} />
          <Route path="/appointments" element={<ViewAppointments client={client} patientId={patientId} selectedOrganizationId={selectedOrganizationId} />} />
        </Routes>
      </div>
    </Router>
  );
};

// Hace que la app este disponible para usarse en otras partes del proyecto.
export default App;



