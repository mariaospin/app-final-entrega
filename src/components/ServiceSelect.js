import React from 'react';

const ServiceSelect = ({ services, service, setService }) => {
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

export default ServiceSelect;


