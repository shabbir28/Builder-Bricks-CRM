import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const PropertyMarker = ({ property }) => {
  return (
    <Marker position={[property.lat, property.lng]}>
      <Popup className="custom-popup">
        <div className="w-48 bg-white rounded-lg overflow-hidden">
          <img 
            src={property.image} 
            alt={property.title} 
            className="w-full h-32 object-cover"
          />
          <div className="p-3">
            <h3 className="font-bold text-gray-900 text-base leading-tight">
              {property.title}
            </h3>
            <p className="text-builders-blue font-black text-sm mt-1">
              {property.price}
            </p>
            <p className="text-gray-500 text-xs mt-1 font-medium">
              {property.location}
            </p>
            <button className="mt-3 w-full bg-builders-blue text-white py-2 rounded-lg text-xs font-black uppercase tracking-wider hover:bg-blue-600 transition-colors cursor-pointer">
              View Details
            </button>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

export default PropertyMarker;
