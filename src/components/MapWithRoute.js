// src/components/MapWithRoute.js
import React from 'react';
import { GoogleMap, LoadScript, Polyline, Marker } from '@react-google-maps/api';
import polyline from '@mapbox/polyline';

const containerStyle = { width: '100%', height: '500px' };
const center = { lat: 46.77, lng: 23.6 };

const decodePolyline = (encoded) =>
  polyline.decode(encoded).map(([lat, lng]) => ({ lat, lng }));

const MapWithRoute = ({ route, stops = [] }) => {
  const path = route?.polyline?.encodedPolyline
    ? decodePolyline(route.polyline.encodedPolyline)
    : [];

  const mapCenter = path.length > 0 ? path[0] : center;

  if (!route?.polyline?.encodedPolyline) {
    console.log("❌ No polyline provided in route.");
    return <p>Loading map...</p>;
  }

  console.log("✅ Route received:", route);
  console.log("✅ Stops:", stops);
  console.log("✅ Decoded polyline path:", path);

  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_KEY}>
      <GoogleMap mapContainerStyle={containerStyle} center={mapCenter} zoom={13}>
        <Polyline path={path} options={{ strokeColor: '#FF0000', strokeWeight: 4 }} />
        {stops.map((point, index) => (
          <Marker
            key={index}
            position={point}
            label={{ text: `${index + 1}`, color: 'white', fontWeight: 'bold' }}
          />
        ))}
      </GoogleMap>
    </LoadScript>
  );
};

export default MapWithRoute;
