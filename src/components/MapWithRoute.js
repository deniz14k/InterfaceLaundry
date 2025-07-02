// src/components/MapWithRoute.js

import React from 'react';
import { GoogleMap, LoadScript, Polyline, Marker } from '@react-google-maps/api';
import polyline from '@mapbox/polyline';

const containerStyle = { width: '100%', height: '500px' };
const defaultCenter   = { lat: 46.7551903, lng: 23.5665899 };
const LIBRARIES = ['places'];

export default function MapWithRoute({
  encodedPolyline,
  stops = [],
  headquarters
}) {
  if (!encodedPolyline) {
    return <p>Nu există polilinie pentru această rută.</p>;
  }

  // Decode the Mapbox polyline
  const path = polyline
    .decode(encodedPolyline)
    .map(([lat, lng]) => ({ lat, lng }));

  const center = headquarters || path[0] || defaultCenter;

  return (
    <LoadScript
      googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_KEY}
      libraries={LIBRARIES}
    >
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={13}
      >
        {/* Draw polyline route */}
        <Polyline
          path={path}
          options={{ strokeColor: '#FF0000', strokeWeight: 4 }}
        />

        {/* HQ marker */}
        {headquarters && (
          <Marker
            position={headquarters}
            label={{ text: 'HQ', color: 'white', fontWeight: 'bold', fontSize: '12px' }}
            icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/black-dot.png' }}
          />
        )}

        {/* Numbered stop markers */}
        {stops.map((pt, i) => (
          <Marker
            key={`${pt.lat}-${pt.lng}-${i}`}
            position={pt}
            label={{ text: `${i + 2}`, color: 'white', fontWeight: 'bold', fontSize: '12px' }}
            icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png' }}
          />
        ))}
      </GoogleMap>
    </LoadScript>
  );
}
