import React from 'react';
import { Link } from 'react-router-dom';
import { Property } from '../types';

interface PropertyCardProps {
  property: Property;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group border border-gray-100">
      <div className="relative h-48 overflow-hidden">
        <img
          src={property.images[0]}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-gray-900 uppercase tracking-wide">
          {property.type}
        </div>
        <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">
            ${(property.price / 1000).toFixed(0)}k
        </div>
      </div>
      
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">{property.title}</h3>
        <div className="flex items-center text-gray-500 text-sm mb-4">
          <i className="fas fa-map-marker-alt mr-2 text-blue-500"></i>
          {property.location.city}, {property.location.state}
        </div>
        
        <div className="grid grid-cols-3 gap-4 border-t border-gray-100 pt-4 text-sm text-gray-600">
          <div className="flex flex-col items-center">
            <span className="font-bold text-gray-900">{property.features.bedrooms}</span>
            <span className="text-xs">Beds</span>
          </div>
          <div className="flex flex-col items-center border-l border-r border-gray-100">
            <span className="font-bold text-gray-900">{property.features.bathrooms}</span>
            <span className="text-xs">Baths</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-bold text-gray-900">{property.features.sqft}</span>
            <span className="text-xs">Sqft</span>
          </div>
        </div>
        
        <div className="mt-4">
            <Link to={`/properties/${property.slug}`} className="block w-full text-center bg-gray-50 hover:bg-blue-600 hover:text-white text-gray-900 font-medium py-2 rounded-lg transition-colors">
                View Details
            </Link>
        </div>
      </div>
    </div>
  );
};
