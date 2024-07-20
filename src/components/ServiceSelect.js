import React from 'react';

// Se crea una variable llamada ServiceSelect, esta constante tiene tres cosas, services va a mostrar todos los recursos HealthService, que estan asociados a la organización con el ID 338, service guarda el ID del servicio seleccionado por el paciente y setService permite cambiar el ID de service, si se escoge otro servicio diferente.
const ServiceSelect = ({ services, service, setService }) => {
  //en esta parte se crea el desplegable de la parte de appoinmentform.
  //select, es la lista que se desplega donde el ususario puede seleccionar un servicio.
  //id="service", se le da un identificador a la lista desplegable.
  //value={service}, se le da un valor a la lista desplegable, en este
  //onChange={(e) => setService(e.target.value)}: Cada vez que el usuario selecciona algo nuevo, actualizamos el valor seleccionado usando setService.
  //required: Esto significa que el usuario debe seleccionar algo antes de poder continuar.
  //    <option value="">Seleccione...</option>, esa es la primera opción en la lista.
  //services.map((service) => {...}): Recorremos la lista de servicios y creamos una opción en la lista desplegable para cada servicio.
//option: Cada servicio tiene su propia opción en la lista desplegable.
//key={service.id}: Un identificador único para cada opción, necesario para que React maneje correctamente la lista.
//value={service.id}: El valor que se usará si esta opción es seleccionada.
//{service.name}: El nombre del servicio que se mostrará en la opción.
  return (
    <div>
      <label htmlFor="service">Prestación:</label>
      <select
        id="service"
        value={service}
        onChange={(e) => setService(e.target.value)}
        required
      >
        <option value="">Seleccione...</option>
        {services.map((service) => (
          <option key={service.id} value={service.id}>
            {service.name}
          </option>
        ))}
      </select>
    </div>
  );
};

// see xporta para que el componenete este disponible para usarse en otras partes de proyecto.
export default ServiceSelect;


