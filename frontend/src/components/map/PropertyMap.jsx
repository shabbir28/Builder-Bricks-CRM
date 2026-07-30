import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import PropertyMarker from './PropertyMarker';

const center = [33.6844, 73.0479];

const PropertyMap = ({ properties }) => {
  return (
    <div className="h-[600px] w-full rounded-3xl overflow-hidden border border-builders-border shadow-2xl relative z-0">
      <MapContainer 
        center={center} 
        zoom={12} 
        scrollWheelZoom={true} 
        className="h-full w-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles"
        />
        {properties.map(property => (
          <PropertyMarker key={property.id} property={property} />
        ))}
      </MapContainer>
    </div>
  );
};

export default PropertyMap;
