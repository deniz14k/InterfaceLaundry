// src/components/MapWithRoute.js

import React from 'react';
import { GoogleMap, Polyline, Marker } from '@react-google-maps/api';
import polyline from '@mapbox/polyline';

const containerStyle = { width: '100%', height: '500px' };
const defaultCenter   = { lat: 46.7551903, lng: 23.5665899 };

export default function MapWithRoute({
  encodedPolyline,
  stops = [],
  headquarters
}) {
  if (!encodedPolyline) {
    return <p>Nu există polilinie pentru această rută.</p>;
  }

  // Decode encoded polyline into path coordinates
  const path = polyline.decode(encodedPolyline).map(([lat, lng]) => ({ lat, lng }));

  // Determine center of map
  const center = headquarters || path[0] || defaultCenter;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={13}
    >
      {/* Draw route line */}
      <Polyline path={path} options={{ strokeColor: '#FF0000', strokeWeight: 4 }} />

      {/* HQ marker */}
      {headquarters && (
        <Marker
          position={headquarters}
          label={{ text: 'HQ', color: 'white', fontWeight: 'bold', fontSize: '12px' }}
          icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/black-dot.png' }}
        />
      )}

      {/* Stop markers */}
      {stops.map((pt, i) => (
        <Marker
          key={`${pt.lat}-${pt.lng}-${i}`}
          position={pt}
          label={{ text: `${i + 1}`, color: 'white', fontWeight: 'bold', fontSize: '12px' }}
          icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png' }}
        />
      ))}
    </GoogleMap>
  );
}