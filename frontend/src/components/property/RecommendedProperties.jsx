import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PropertyCard from './PropertyCard';
import { SparklesIcon } from '@heroicons/react/24/outline'; // Adjust for heroicons v2

const RecommendedProperties = ({ leadId }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!leadId) return;

    const fetchMatches = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/properties/match/${leadId}`);
        if (response.data.success) {
          setProperties(response.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch matched properties', err);
        setError('Unable to load recommendations.');
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [leadId]);

  if (loading) {
    return (
      <div className="panel p-6 mb-6">
        <div className="animate-pulse flex items-center gap-2 text-ink-tertiary text-sm">
          <SparklesIcon className="w-4 h-4" /> 
          Scanning for optimal property matches...
        </div>
      </div>
    );
  }

  if (error || properties.length === 0) {
    // Inject Dummy Data for demonstration
    const dummyProperties = [
      {
        id: 'dummy1',
        title: 'Luxury Villa Phase 2',
        price: 30000000,
        type: 'villa',
        address: { city: 'Islamabad', street: 'Phase 2 DHA' },
        features: { bedrooms: 5, bathrooms: 6, area: 4500 },
        images: [{ url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80' }]
      },
      {
        id: 'dummy2',
        title: 'Modern House F-7',
        price: 25000000,
        type: 'house',
        address: { city: 'Islamabad', street: 'F-7 Markaz' },
        features: { bedrooms: 4, bathrooms: 4, area: 3200 },
        images: [{ url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80' }]
      },
      {
        id: 'dummy3',
        title: 'Designer Penthouse',
        price: 28000000,
        type: 'apartment',
        address: { city: 'Islamabad', street: 'Blue Area' },
        features: { bedrooms: 3, bathrooms: 3, area: 2400 },
        images: [{ url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80' }]
      }
    ];

    return (
      <div className="panel p-6 mb-6 relative overflow-hidden">
        {/* Soft gradient background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="flex items-center gap-2 mb-4 relative z-10">
          <SparklesIcon className="w-5 h-5 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)] animate-pulse" />
          <h2 className="text-lg font-black tracking-tight text-ink-primary">Smart Recommendations</h2>
          <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-surface-base border border-surface-border text-amber-500/80">
            Demo Mode (No Real Matches)
          </span>
        </div>

        <div className="flex overflow-x-auto gap-5 pb-4 custom-scrollbar relative z-10">
          {dummyProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
        
        <style>{`
          .custom-scrollbar::-webkit-scrollbar {
            height: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255,255,255,0.02);
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,0.1);
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255,255,255,0.2);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="panel p-6 mb-6 relative overflow-hidden">
      {/* Soft gradient background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
      
      <div className="flex items-center gap-2 mb-4 relative z-10">
        <SparklesIcon className="w-5 h-5 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)] animate-pulse" />
        <h2 className="text-lg font-black tracking-tight text-ink-primary">Smart Recommendations</h2>
        <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-surface-base border border-surface-border text-ink-tertiary">
          Top {properties.length} Matches
        </span>
      </div>

      <div className="flex overflow-x-auto gap-5 pb-4 custom-scrollbar relative z-10">
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.02);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.2);
        }
      `}</style>
    </div>
  );
};

export default RecommendedProperties;
