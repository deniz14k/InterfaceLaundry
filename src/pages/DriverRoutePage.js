// src/pages/DriverRoutePage.js

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Text,
  Button,
  Select,
  VStack,
  HStack,
  useToast
} from '@chakra-ui/react';
import { useJsApiLoader } from '@react-google-maps/api';
import MapWithRoute from '../components/MapWithRoute';
import {
  getRouteById,
  markOrderCompleted,
  startRoute,
  stopRoute,
  reportTracking,
  removeOrderFromRoute,
  addOrderToRoute,
  getEligibleOrders
} from '../services/RouteService';

export default function DriverRoutePage() {
  const { routeId } = useParams();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [encodedPolyline, setEncodedPolyline] = useState('');
  const [orders, setOrders] = useState([]);
  const [routeStarted, setRouteStarted] = useState(false);
  const [watchId, setWatchId] = useState(null);

  const [pendingOrders, setPendingOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [isOptimized, setIsOptimized] = useState(false);

  // HQ coordinates
  const HQ = { lat: 46.7551903, lng: 23.5665899 };

  // Load Google Maps JS API once
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_KEY,
    libraries: ['places']
  });

  // Fetch the route details from backend
  const refreshRoute = () => {
    if (!routeId) return;
    setLoading(true);
    getRouteById(routeId)
      .then(data => {
        setEncodedPolyline(data.polyline);
        setOrders(data.orders);
        setRouteStarted(data.isStarted);
        setIsOptimized(false);            // mark that we need to re-optimize
      })
      .catch(() => {
        toast({ status: 'error', title: 'Could not load route' });
      })
      .finally(() => setLoading(false));
  };

  // Initial load: route + eligible orders
  useEffect(() => {
    refreshRoute();
    getEligibleOrders()
      .then(setPendingOrders)
      .catch(() => console.error('Failed to load eligible orders'));
  }, [routeId]);

  // GPS tracking when route is started
  useEffect(() => {
    if (routeStarted && routeId && navigator.geolocation) {
      const id = navigator.geolocation.watchPosition(
        pos => reportTracking(routeId, pos.coords.latitude, pos.coords.longitude).catch(console.error),
        err => console.error('GPS error', err),
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
      );
      setWatchId(id);
    }
    return () => {
      if (watchId != null) navigator.geolocation.clearWatch(watchId);
    };
  }, [routeStarted, routeId]);

  // CRUD handlers
  const handleStart = () => {
    startRoute(routeId)
      .then(() => {
        setRouteStarted(true);
        toast({ status: 'success', title: 'Route started' });
      })
      .catch(() => toast({ status: 'error', title: 'Failed to start route' }));
  };

  const handleStop = () => {
    stopRoute(routeId)
      .then(() => {
        setRouteStarted(false);
        toast({ status: 'success', title: 'Route stopped' });
      })
      .catch(() => toast({ status: 'error', title: 'Failed to stop route' }));
  };

  const handleMarkCompleted = orderId => {
    markOrderCompleted(routeId, orderId)
      .then(() => {
        setOrders(prev =>
          prev.map(o => (o.id === orderId ? { ...o, isCompleted: true } : o))
        );
        toast({ status: 'success', title: 'Order marked done' });
      })
      .catch(() => toast({ status: 'error', title: 'Could not mark done' }));
  };

  const handleRemove = orderId => {
    removeOrderFromRoute(routeId, orderId)
      .then(() => {
        toast({ status: 'success', title: 'Order removed' });
        refreshRoute();
      })
      .catch(() => toast({ status: 'error', title: 'Could not remove order' }));
  };

  const handleAdd = () => {
    if (!selectedOrderId) return;
    addOrderToRoute(routeId, selectedOrderId)
      .then(() => {
        toast({ status: 'success', title: 'Order added' });
        setSelectedOrderId('');
        refreshRoute();
      })
      .catch(() => toast({ status: 'error', title: 'Could not add order' }));
  };

  // Once Maps API is loaded and we haven't yet optimized, do one DirectionsService request
  useEffect(() => {
    if (!isLoaded || isOptimized || orders.length === 0) return;
    const service = new window.google.maps.DirectionsService();
    service.route(
      {
        origin: HQ,
        destination: HQ,
        waypoints: orders.map(o => ({
          location: { lat: o.lat, lng: o.lng },
          stopover: true
        })),
        optimizeWaypoints: true,
        travelMode: 'DRIVING'
      },
      (response, status) => {
        if (status === 'OK' && response.routes.length) {
          const seq = response.routes[0].waypoint_order;
          // reorder orders array
          setOrders(seq.map(i => orders[i]));
          setIsOptimized(true);
        }
      }
    );
  }, [isLoaded, orders, isOptimized, HQ]);

  if (loading) return <Text>Loading route…</Text>;

  return (
    <Box p={6}>
      <VStack align="stretch" spacing={6}>

        {/* Start / Stop controls */}
        <HStack>
          {!routeStarted ? (
            <Button colorScheme="green" onClick={handleStart}>
              ▶️ Start Route
            </Button>
          ) : (
            <Button colorScheme="red" onClick={handleStop}>
              ⏹ Stop Route
            </Button>
          )}
        </HStack>

        {/* Map (once API is loaded) */}
        {orders.length > 0 && isLoaded ? (
          <MapWithRoute
            encodedPolyline={encodedPolyline}
            stops={orders.map(o => ({ lat: o.lat, lng: o.lng }))}
            headquarters={HQ}
          />
        ) : (
          <Text>Loading map…</Text>
        )}

        {/* Current Stops List */}
        <Box>
          <Text fontSize="lg" fontWeight="bold" mb={2}>
            Stops on this route
          </Text>
          <VStack align="stretch" spacing={3}>
            {orders.map((o, idx) => (
              <HStack
                key={o.id}
                justify="space-between"
                p={3}
                borderWidth="1px"
                borderRadius="md"
                bg={o.isCompleted ? 'green.50' : 'white'}
              >
                <Box>
                  <Text>
                    # {idx + 1} — {o.customerName}
                  </Text>
                  <Text fontSize="sm">{o.address}</Text>
                </Box>
                <HStack>
                  {!o.isCompleted && (
                    <Button
                      size="sm"
                      colorScheme="blue"
                      onClick={() => handleMarkCompleted(o.id)}
                    >
                      ✅ Done
                    </Button>
                  )}
                  <Button
                    size="sm"
                    colorScheme="orange"
                    onClick={() => handleRemove(o.id)}
                  >
                    🗑 Remove
                  </Button>
                </HStack>
              </HStack>
            ))}
            {orders.length === 0 && <Text>No stops on this route.</Text>}
          </VStack>
        </Box>

        {/* Add a new stop */}
        <Box>
          <Text fontSize="lg" fontWeight="bold" mb={2}>
            Add an order to this route
          </Text>
          <HStack>
            <Select
              placeholder="Select from pending orders"
              value={selectedOrderId}
              onChange={e => setSelectedOrderId(e.target.value)}
            >
              {pendingOrders.map(o => (
                <option key={o.id} value={o.id}>
                  #{o.id} — {o.customerName}
                </option>
              ))}
            </Select>
            <Button colorScheme="teal" onClick={handleAdd}>
              ➕ Add
            </Button>
          </HStack>
        </Box>

      </VStack>
    </Box>
  );
}
