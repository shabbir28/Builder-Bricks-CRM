import React from 'react';
import VisitItem from './VisitItem';
import { TruckIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline'; // Using suitable icon if MapPin is overused

const VisitList = ({ visits, onStatusChange }) => {
  if (!visits || visits.length === 0) {
    return (
      <div style={{ padding: 30, textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
        <BuildingOfficeIcon style={{ width: 32, height: 32, margin: '0 auto 8px', opacity: 0.5 }} />
        No upcoming visits scheduled.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {visits.map(visit => (
        <VisitItem key={visit.id} visit={visit} onStatusChange={onStatusChange} />
      ))}
    </div>
  );
};

export default VisitList;
