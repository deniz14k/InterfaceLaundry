// src/components/OrderEtaMap.js
import React, { useEffect, useState, useRef } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const HQ = { lat: 46.7551903, lng: 23.5665899 }; // your depot

export default function OrderEtaMap({ customerLat, customerLng }) {
  const [eta, setEta] = useState<string|null>(null);
  const mapRef = useRef<google.maps.Map|null>(null);

  // Once the map API is loaded, compute the ETA
  useEffect(() => {
    if (!customerLat || !window.google || !mapRef.current) return;

    const service = new window.google.maps.DistanceMatrixService();
    service.getDistanceMatrix({
      origins: [HQ],
      destinations: [{ lat: customerLat, lng: customerLng }],
      travelMode: window.google.maps.TravelMode.DRIVING,
      drivingOptions: { departureTime: new Date() }
    }, (response, status) => {
      if (status === 'OK') {
        const elem = response.rows[0].elements[0];
        if (elem.status === 'OK') setEta(elem.duration?.text ?? null);
      }
    });
  }, [customerLat, customerLng, mapRef.current]);

  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_KEY}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '300px' }}
        center={HQ}
        zoom={12}
        onLoad={map => mapRef.current = map}
      >
        <Marker position={HQ} label="HQ" />
        <Marker position={{ lat: customerLat, lng: customerLng }} label="You" />
      </GoogleMap>
      {eta
        ? <p><strong>Estimated arrival:</strong> {eta} from depot</p>
        : <p>Calculating ETA…</p>}
    </LoadScript>
  );
}
