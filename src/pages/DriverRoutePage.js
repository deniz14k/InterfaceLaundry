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

  // HQ coordinates
  const HQ = { lat: 46.7551903, lng: 23.5665899 };

  // Refresh route data from API
  const refreshRoute = () => {
    if (!routeId) return;
    setLoading(true);
    getRouteById(routeId)
      .then(data => {
        setEncodedPolyline(data.polyline);
        setOrders(data.orders);
        setRouteStarted(data.isStarted);
      })
      .catch(() => toast({ status: 'error', title: 'Could not load route' }))
      .finally(() => setLoading(false));
  };

  // Initial load
  useEffect(() => {
    refreshRoute();
    getEligibleOrders()
      .then(setPendingOrders)
      .catch(() => console.error('Failed to load eligible orders'));
  }, [routeId]);

  // GPS tracking
  useEffect(() => {
    if (routeStarted && routeId && navigator.geolocation) {
      const id = navigator.geolocation.watchPosition(
        pos =>
          reportTracking(routeId, pos.coords.latitude, pos.coords.longitude).catch(
            console.error
          ),
        err => console.error('GPS error', err),
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
      );
      setWatchId(id);
    }
    return () => {
      if (watchId != null) navigator.geolocation.clearWatch(watchId);
    };
  }, [routeStarted, routeId]);

  // Handlers
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

        {/* Map with polyline & markers */}
        {encodedPolyline ? (
          <MapWithRoute
            encodedPolyline={encodedPolyline}
            stops={orders.map(o => ({ lat: o.lat, lng: o.lng }))}
            headquarters={HQ}
          />
        ) : (
          <Text>No map available for this route.</Text>
        )}

        {/* Current Stops List */}
        <Box>
          <Text fontSize="lg" fontWeight="bold" mb={2}>
            Stops on this route
          </Text>
          <VStack align="stretch" spacing={3}>
            {orders.map(o => (
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
                    # {o.index} — {o.customerName}
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
