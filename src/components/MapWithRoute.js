// src/components/MapWithRoute.js

import React from 'react';
import { GoogleMap, LoadScript, Polyline, Marker } from '@react-google-maps/api';
import polyline from '@mapbox/polyline';

const containerStyle = { width: '100%', height: '500px' };
const defaultCenter   = { lat: 46.77, lng: 23.6 };

export default function MapWithRoute({ encodedPolyline, stops = [], headquarters }) {
  if (!encodedPolyline) {
    return <p>Nu există polilinie pentru această rută.</p>;
  }

  // decodează polilinia
  const path = polyline
    .decode(encodedPolyline)
    .map(([lat, lng]) => ({ lat, lng }));

  // centrează fie pe sediu, fie pe primul punct din rută
  const center = headquarters || path[0] || defaultCenter;

  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_KEY}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={13}
      >
        {/* traseul */}
        <Polyline
          path={path}
          options={{ strokeColor: '#FF0000', strokeWeight: 4 }}
        />

        {/* marker HQ */}
        {headquarters && (
          <Marker
            position={headquarters}
            label={{ text: 'HQ', color: 'white', fontWeight: 'bold', fontSize: '12px' }}
          />
        )}

        {/* marker-e stops */}
        {stops.map((pt, i) => (
          <Marker
            key={i}
            position={pt}
            label={{ text: `${i + 1}`, color: 'white', fontWeight: 'bold', fontSize: '12px' }}
          />
        ))}
      </GoogleMap>
    </LoadScript>
  );
}
