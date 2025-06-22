// src/components/MapWithRoute.js
import React from 'react';
import { GoogleMap, LoadScript, Polyline, Marker } from '@react-google-maps/api';
import polyline from '@mapbox/polyline';

const containerStyle = { width: '100%', height: '500px' };
const center = { lat: 46.77, lng: 23.6 };

const MapWithRoute = ({ encodedPolyline, stops }) => {
  const path = encodedPolyline ? polyline.decode(encodedPolyline).map(([lat, lng]) => ({ lat, lng })) : [];

  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_KEY}>
      <GoogleMap mapContainerStyle={containerStyle} center={path[0] || center} zoom={13}>
        {path.length > 0 && <Polyline path={path} options={{ strokeColor: '#FF0000', strokeWeight: 4 }} />}
        {stops.map((point, index) => (
          <Marker key={index} position={point} label={{ text: `${index + 1}`, color: 'white' }} />
        ))}
      </GoogleMap>
    </LoadScript>
  );
};

export default MapWithRoute;
