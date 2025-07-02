import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate }               from 'react-router-dom';
import {
  Box, Heading, Text, Table, Thead, Tbody,
  Tr, Th, Td, Button, Spinner
} from '@chakra-ui/react';
import {
  LoadScript,
  GoogleMap,
  Marker,
  DirectionsService
} from '@react-google-maps/api';
import { AuthContext } from '../contexts/authContext';
import { getRouteById as fetchRoute } from '../services/RouteService';

const MAP_LIBRARIES = ['places'];
// Simulated service time per stop (in seconds) — e.g. 5 minutes = 300s
const SERVICE_TIME_SECONDS = 5 * 60;

export default function MyOrderDetailsPage() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const { user }     = useContext(AuthContext);

  const [order, setOrder]               = useState(null);
  const [routeId, setRouteId]           = useState(null);
  const [routeStarted, setRouteStarted] = useState(false);

  const [driverLoc, setDriverLoc] = useState(null);
  const [stops, setStops]         = useState([]);
  const [eta, setEta]             = useState('');
  const [loading, setLoading]     = useState(true);

  // 1️⃣ Load the order details
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

  // 2️⃣ Poll the driver's real-time location every 5s
  useEffect(() => {
    if (!routeStarted || !routeId) return;
    const timer = setInterval(() => {
      fetch(`https://localhost:7223/api/tracking/${routeId}/latest`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
        .then(r => r.status === 204 ? null : (r.ok ? r.json() : Promise.reject()))
        .then(loc => loc && setDriverLoc({ lat: loc.lat, lng: loc.lng }))
        .catch(console.error);
    }, 5000);
    return () => clearInterval(timer);
  }, [routeStarted, routeId]);

  // 3️⃣ Fetch full list of stops for this route when it starts
  useEffect(() => {
    if (!routeStarted || !routeId) return;
    fetchRoute(routeId)
      .then(r => setStops(r.orders))
      .catch(console.error);
  }, [routeStarted, routeId]);

  // 4️⃣ DirectionsService callback — compute travel + service times
  const handleFullRoute = (response, status) => {
    if (status !== 'OK' || !response.routes.length) return;

    const legs = response.routes[0].legs;
    // find this order's stop index
    const idx = stops.findIndex(s => s.id === order.id);
    if (idx < 0) return;

    // travel time in seconds from driver → this stop
    const travelSecs = legs
      .slice(0, idx + 1)
      .reduce((sum, leg) => sum + leg.duration.value, 0);

    // service time for each *previous* stop (exclude current)
    const serviceSecs = idx * SERVICE_TIME_SECONDS;

    const totalSecs = travelSecs + serviceSecs;
    setEta(`${Math.ceil(totalSecs / 60)} min`);
  };

  if (loading || !order) {
    return (
      <Box p={6} textAlign="center">
        <Spinner size="lg" /> <Text>Loading order…</Text>
      </Box>
    );
  }

  const isDelivery = order.serviceType === 'PickupDelivery';

  return (
    <Box p={6}>
      <Button mb={4} onClick={() => navigate(-1)}>← Back</Button>
      <Text fontSize="lg" mb={4}>Hello, {user.name}!</Text>

      <Heading size="lg" mb={2}>Order #{order.id}</Heading>
      <Text>Status: {order.status}</Text>
      <Text>Received: {new Date(order.receivedDate).toLocaleString()}</Text>
      {order.completedDate && <Text>Completed: {new Date(order.completedDate).toLocaleString()}</Text>}
      {isDelivery && <Text>Address: {order.deliveryAddress}</Text>}
      {order.observation && <Text>Notes: {order.observation}</Text>}

      <Heading size="md" mt={6} mb={2}>Items</Heading>
      <Table variant="simple">
        <Thead>
          <Tr><Th>Type</Th><Th>Dimensions</Th><Th>Price (RON)</Th></Tr>
        </Thead>
        <Tbody>
          {order.items.map(item => (
            <Tr key={item.id}>
              <Td>{item.type}</Td>
              <Td>{item.length && item.width ? `${item.length}×${item.width}` : '–'}</Td>
              <Td>{item.price}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Heading size="md" mt={4}>Total: {order.items.reduce((sum, i) => sum + i.price, 0)} RON</Heading>

      {isDelivery && routeStarted && driverLoc && stops.length > 0 && (
        <>
          <Heading size="md" mt={6} mb={2}>Estimated Arrival: {eta || '…calculating'}</Heading>

          <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_KEY} libraries={MAP_LIBRARIES}>
            <DirectionsService
              options={{
                origin: driverLoc,
                destination: {
                  lat: stops[stops.length - 1].lat,
                  lng: stops[stops.length - 1].lng
                },
                waypoints: stops
                  .slice(0, stops.length - 1)
                  .map(s => ({ location: { lat: s.lat, lng: s.lng }, stopover: true })),
                travelMode: 'DRIVING',
                drivingOptions: { departureTime: new Date(), trafficModel: 'bestguess' }
              }}
              callback={handleFullRoute}
            />

            <GoogleMap mapContainerStyle={{ width: '100%', height: '300px' }} center={driverLoc} zoom={12}>
              <Marker position={driverLoc} label="🚗" />
            </GoogleMap>
          </LoadScript>
        </>
      )}

      {isDelivery && !routeStarted && (
        <Text mt={6} color="gray.500">The driver has not yet started their route.</Text>
      )}
    </Box>
  );
}
