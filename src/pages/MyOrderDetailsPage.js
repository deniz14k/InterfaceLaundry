// src/pages/MyOrderDetailsPage.js

import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate }       from 'react-router-dom';
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
  Spinner,
  Center
} from '@chakra-ui/react';
import {
  useJsApiLoader,
  GoogleMap,
  Marker,
  Polyline,
  DistanceMatrixService
} from '@react-google-maps/api';
import { AuthContext } from '../contexts/authContext';

const MAP_LIBRARIES = ['places'];
const HQ = { lat: 46.7551903, lng: 23.5665899 };

export default function MyOrderDetailsPage() {
  const { id }        = useParams();
  const navigate      = useNavigate();
  const { user }      = useContext(AuthContext);

  const [order, setOrder]               = useState(null);
  const [routeId, setRouteId]           = useState(null);
  const [routeStarted, setRouteStarted] = useState(false);
  const [driverLoc, setDriverLoc]       = useState(null);
  const [eta, setEta]                   = useState('');
  const [loading, setLoading]           = useState(true);

  // 1️⃣ Load order + route metadata
  useEffect(() => {
    fetch(`https://localhost:7223/api/orders/my/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(r => {
        if (!r.ok) throw new Error('Order not found');
        return r.json();
      })
      .then(o => {
        setOrder(o);
        setRouteId(o.routeId);
        setRouteStarted(o.routeStarted);
      })
      .catch(() => navigate('/my-orders'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  // 2️⃣ Poll driver’s latest GPS every 5s once route started
  useEffect(() => {
    if (!routeStarted || !routeId) return;
    const iv = setInterval(() => {
      fetch(`https://localhost:7223/api/tracking/${routeId}/latest`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
        .then(r => (r.status === 204 ? null : r.json()))
        .then(loc => {
          if (loc) setDriverLoc({ lat: loc.lat, lng: loc.lng });
        })
        .catch(console.error);
    }, 5000);
    return () => clearInterval(iv);
  }, [routeStarted, routeId]);

  // 3️⃣ Load Google Maps JS once
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_KEY,
    libraries:        MAP_LIBRARIES
  });

  // 4️⃣ Distance Matrix callback
  const onMatrix = (resp, status) => {
    if (
      status === 'OK' &&
      resp.rows?.[0]?.elements?.[0]?.status === 'OK'
    ) {
      setEta(resp.rows[0].elements[0].duration.text);
    }
  };

  if (loading || !order) {
    return (
      <Center p={10}>
        <Spinner size="lg" /> <Text ml={2}>Loading order…</Text>
      </Center>
    );
  }

  const isDelivery     = order.serviceType === 'PickupDelivery';
  const customerPos    = isDelivery
    ? { lat: order.deliveryLatitude, lng: order.deliveryLongitude }
    : null;

  return (
    <Box p={6}>
      <Button mb={4} onClick={() => navigate(-1)}>← Back</Button>
      <Text fontSize="md" mb={4}>Hello, {user.name}!</Text>

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
          <Tr><Th>Type</Th><Th>Dimensions</Th><Th>Price</Th></Tr>
        </Thead>
        <Tbody>
          {order.items.map(i => (
            <Tr key={i.id}>
              <Td>{i.type}</Td>
              <Td>{i.length && i.width ? `${i.length}×${i.width}` : '–'}</Td>
              <Td>{i.price} RON</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Heading size="md" mt={4}>
        Total: {order.items.reduce((sum, i) => sum + i.price, 0)} RON
      </Heading>

      {isDelivery && !routeStarted && (
        <Text mt={6} color="gray.500">
          The driver has not yet started their route.
        </Text>
      )}

      {isDelivery && routeStarted && driverLoc && customerPos && (
        <>
          <Heading size="md" mt={6}>
            Estimated Arrival: {eta || '…calculating'}
          </Heading>

          {loadError && (
            <Text color="red.500" mt={2}>
              Google Maps failed to load.
            </Text>
          )}

          {!isLoaded ? (
            <Center mt={4}><Spinner /> Loading map…</Center>
          ) : (
            <>
              {/* trigger the distance matrix */}
              <DistanceMatrixService
                options={{
                  origins:      [driverLoc],
                  destinations: [customerPos],
                  travelMode:   'DRIVING'
                }}
                callback={onMatrix}
              />

              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '300px', marginTop: '1rem' }}
                center={driverLoc}
                zoom={12}
              >
                <Marker position={driverLoc} label="🚗" />
                <Marker position={customerPos} label="📍" />
                <Polyline
                  path={[driverLoc, customerPos]}
                  options={{ strokeColor: '#007aff', strokeWeight: 3 }}
                />
              </GoogleMap>
            </>
          )}
        </>
      )}
    </Box>
  );
}
