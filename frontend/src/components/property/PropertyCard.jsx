import React, { useState } from 'react';
import { 
  MapPinIcon, 
  ShareIcon, 
  HomeIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const PropertyCard = ({ property }) => {
  const [copied, setCopied] = useState(false);

  const formatPrice = (price) => {
    if (price >= 10000000) {
      return `Rs ${parseFloat((price / 10000000).toFixed(2))} Cr`;
    } else if (price >= 100000) {
      return `Rs ${parseFloat((price / 100000).toFixed(2))} Lac`;
    }
    return `Rs ${price.toLocaleString()}`;
  };

  const handleShareClick = () => {
    // Generate a theoretical public link or deep link to the property
    const shareLink = `${window.location.origin}/properties/${property.id}`;
    navigator.clipboard.writeText(shareLink).then(() => {
      setCopied(true);
      toast.success('Property link copied to clipboard!');
      setTimeout(() => setCopied(false), 3000);
    });
  };

  const defaultImage = property.images && property.images.length > 0 
    ? property.images[0].url 
    : 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'; // Fallback real-estate image

  return (
    <div className="flex-shrink-0 w-72 bg-surface-raised border border-surface-border rounded-3xl overflow-hidden shadow-xl group hover:border-surface-border/80 transition-all duration-300 relative">
      
      {/* Image Header */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={defaultImage} 
          alt={property.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e1015] to-transparent opacity-80" />
        
        {/* Type Badge */}
        <div className="absolute top-3 left-3 px-3 py-1 bg-[#0e1015]/80 backdrop-blur-md rounded-full border border-surface-border flex items-center gap-1.5">
          <HomeIcon className="w-3.5 h-3.5 text-accent" />
          <span className="text-[10px] uppercase tracking-wider font-bold text-ink-primary capitalize">{property.type}</span>
        </div>

        {/* Price Tag */}
        <div className="absolute bottom-3 left-4">
          <div className="text-xl font-black text-white tracking-tight leading-none drop-shadow-md">
            {formatPrice(property.price)}
          </div>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-4 flex flex-col gap-3">
        <div>
          <h3 className="text-sm font-bold text-ink-primary truncate mb-1">{property.title}</h3>
          <div className="flex items-center gap-1.5 text-xs text-ink-tertiary">
            <MapPinIcon className="w-3.5 h-3.5" />
            <span className="truncate">{property.address?.city || 'Location N/A'}</span>
          </div>
        </div>

        {/* Features Row */}
        <div className="flex items-center gap-2 py-2 border-y border-surface-border/50">
          <div className="flex-1 flex justify-center items-center gap-1.5 p-1 rounded-lg bg-surface-base border border-surface-border/30">
            <span className="text-xs font-bold text-ink-secondary">{property.features?.bedrooms || 0}</span>
            <span className="text-[10px] font-semibold text-ink-tertiary uppercase">Beds</span>
          </div>
          <div className="flex-1 flex justify-center items-center gap-1.5 p-1 rounded-lg bg-surface-base border border-surface-border/30">
            <span className="text-xs font-bold text-ink-secondary">{property.features?.bathrooms || 0}</span>
            <span className="text-[10px] font-semibold text-ink-tertiary uppercase">Baths</span>
          </div>
          <div className="flex-1 flex justify-center items-center gap-1.5 p-1 rounded-lg bg-surface-base border border-surface-border/30">
            <span className="text-xs font-bold text-ink-secondary">{property.features?.area || 0}</span>
            <span className="text-[10px] font-semibold text-ink-tertiary uppercase">Sqft</span>
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={handleShareClick}
          className="mt-1 w-full flex items-center justify-center gap-2 py-2 rounded-xl transition-all duration-300"
          style={{ 
            background: copied ? 'rgba(16,185,129,0.1)' : 'rgba(99,102,241,0.1)', 
            border: `1px solid ${copied ? 'rgba(16,185,129,0.2)' : 'rgba(99,102,241,0.2)'}`,
            color: copied ? '#10b981' : '#818cf8'
          }}
        >
          {copied ? (
            <>
              <CheckBadgeIcon className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Copied</span>
            </>
          ) : (
            <>
              <ShareIcon className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Share w/ Client</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PropertyCard;
