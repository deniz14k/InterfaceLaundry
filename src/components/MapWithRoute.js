// src/components/MapWithRoute.js

import React from 'react';
import { GoogleMap, LoadScript, Polyline } from '@react-google-maps/api';
import polyline from '@mapbox/polyline';


const containerStyle = {
  width: '100%',
  height: '500px'
};

const center = {
  lat: 46.77,
  lng: 23.6
};

const decodePolyline = (encoded) => {
  return polyline.decode(encoded).map(([lat, lng]) => ({ lat, lng }));
};

const MapWithRoute = ({ route }) => {
  const path = decodePolyline(route.polyline.encodedPolyline);

  console.log('GOOGLE KEY:', process.env.REACT_APP_GOOGLE_MAPS_KEY); // This will log correctly

  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_KEY}>
      <GoogleMap mapContainerStyle={containerStyle} center={path[0] || center} zoom={13}>
        <Polyline path={path} options={{ strokeColor: '#FF0000', strokeWeight: 4 }} />
      </GoogleMap>
    </LoadScript>
  );
};

export default MapWithRoute;
