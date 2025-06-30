// src/pages/MyOrderDetailsPage.js
import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Spinner
} from '@chakra-ui/react';
import { LoadScript, GoogleMap, Marker, Polyline, DistanceMatrixService } from '@react-google-maps/api';
import { AuthContext } from '../contexts/authContext';

const MAP_LIBRARIES = ['places'];
const HQ = { lat: 46.7551903, lng: 23.5665899 };

export default function MyOrderDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [order, setOrder]             = useState(null);
  const [routeId, setRouteId]         = useState(null);
  const [routeStarted, setRouteStarted] = useState(false);
  const [driverLoc, setDriverLoc]     = useState(null);
  const [eta, setEta]                 = useState('');
  const [loading, setLoading]         = useState(true);

  // 1️⃣ Fetch the order + route metadata
  useEffect(() => {
    fetch(`https://localhost:7223/api/orders/my/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(r => {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .then(o => {
        setOrder(o);
        setRouteId(o.RouteId);
        setRouteStarted(o.RouteStarted);
      })
      .catch(() => navigate('/my-orders'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  // 2️⃣ Poll the driver's latest position every 5s once routeStarted
  useEffect(() => {
    if (!routeStarted || !routeId) return;
    const interval = setInterval(() => {
      fetch(`https://localhost:7223/api/tracking/${routeId}/latest`)
        .then(r => {
          if (r.status === 204) return null;      // no tracking yet
          if (!r.ok) throw new Error();
          return r.json();
        })
        .then(loc => {
          if (loc) setDriverLoc({ lat: loc.lat, lng: loc.lng });
        })
        .catch(console.error);
    }, 5000);
    return () => clearInterval(interval);
  }, [routeStarted, routeId]);

  // 3️⃣ Distance‐Matrix callback
  const handleMatrix = (response, status) => {
    if (
      status === 'OK' &&
      response.rows[0].elements[0].status === 'OK'
    ) {
      setEta(response.rows[0].elements[0].duration.text);
    }
  };

  if (loading) {
    return (
      <Box p={6} textAlign="center">
        <Spinner size="lg" /> <Text>Loading order…</Text>
      </Box>
    );
  }

  const isDelivery = order.serviceType === 'PickupDelivery';
  const customerLatLng = isDelivery && {
    lat: order.deliveryLatitude,
    lng: order.deliveryLongitude
  };

  return (
    <Box p={6}>
      <Button mb={4} onClick={() => navigate(-1)}>← Back</Button>
      <Text fontSize="lg" mb={4}>Hello, {user.name}!</Text>

      <Heading size="lg" mb={2}>Order #{order.id}</Heading>
      <Text>Status: {order.status}</Text>
      <Text>Received: {new Date(order.receivedDate).toLocaleString()}</Text>
      {order.completedDate && (
        <Text>Completed: {new Date(order.completedDate).toLocaleString()}</Text>
      )}
      {isDelivery && <Text>Address: {order.deliveryAddress}</Text>}
      {order.observation && <Text>Notes: {order.observation}</Text>}

      <Heading size="md" mt={6} mb={2}>Items</Heading>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Type</Th>
            <Th>Dimensions</Th>
            <Th>Price (RON)</Th>
          </Tr>
        </Thead>
        <Tbody>
          {order.items.map(item => (
            <Tr key={item.id}>
              <Td>{item.type}</Td>
              <Td>
                {item.length && item.width
                  ? `${item.length}×${item.width}`
                  : '–'}
              </Td>
              <Td>{item.price}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Heading size="md" mt={4}>
        Total: {order.items.reduce((sum, i) => sum + i.price, 0)} RON
      </Heading>

      {/* ➡️ Only once driver has hit “Start Route” */}
      {isDelivery && routeStarted && driverLoc && customerLatLng && (
        <>
          <Heading size="md" mt={6} mb={2}>
            Estimated Arrival: {eta || '…calculating'}
          </Heading>

          <LoadScript
            googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_KEY}
            libraries={MAP_LIBRARIES}
          >
            {/* kick off ETA calc */}
            <DistanceMatrixService
              options={{
                origins:      [driverLoc],
                destinations: [customerLatLng],
                travelMode:   'DRIVE'
              }}
              callback={handleMatrix}
            />

            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '300px' }}
              center={driverLoc}
              zoom={12}
            >
              <Marker position={driverLoc} label="🚗" />
              <Marker position={customerLatLng} label="📍" />
              <Polyline
                path={[driverLoc, customerLatLng]}
                options={{ strokeColor: '#007aff', strokeWeight: 2 }}
              />
            </GoogleMap>
          </LoadScript>
        </>
      )}

      {/* if route not started yet */}
      {isDelivery && !routeStarted && (
        <Text mt={6} color="gray.500">
          The driver has not yet started their route.
        </Text>
      )}
    </Box>
  );
}
