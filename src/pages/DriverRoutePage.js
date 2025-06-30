// src/pages/DriverRoutePage.js

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import MapWithRoute from '../components/MapWithRoute';
import {
  getRouteById,
  markOrderCompleted,
  startRoute,
  stopRoute,
  reportTracking
} from '../services/RouteService';

export default function DriverRoutePage() {
  const { routeId } = useParams();
  const [loading, setLoading] = useState(true);
  const [encodedPolyline, setEncodedPolyline] = useState('');
  const [stops, setStops] = useState([]);
  const [orders, setOrders] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [routeStarted, setRouteStarted] = useState(false);
  const [watchId, setWatchId] = useState(null);

  const HQ = { lat: 46.7551903, lng: 23.5665899 };

  // 1️⃣ Load route details once
  useEffect(() => {
    if (!routeId) return;
    setLoading(true);

    getRouteById(routeId)
      .then(data => {
        setEncodedPolyline(data.polyline);
        setStops(data.orders.map(o => ({ lat: o.lat, lng: o.lng })));
        setOrders(data.orders);
        setTotalPrice(data.orders.reduce((sum, o) => sum + (o.price || 0), 0));
        setRouteStarted(data.isStarted); // if your API returns an `isStarted` flag
      })
      .catch(() => alert('Nu am putut încărca ruta.'))
      .finally(() => setLoading(false));
  }, [routeId]);

  // 2️⃣ When route is started, begin watching position
  useEffect(() => {
    if (routeStarted && routeId && navigator.geolocation) {
      const id = navigator.geolocation.watchPosition(
        pos => {
          reportTracking(routeId, pos.coords.latitude, pos.coords.longitude)
            .catch(console.error);
        },
        err => console.error(err),
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
      );
      setWatchId(id);
    }
    // cleanup
    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, [routeStarted, routeId]);

  const handleStart = () => {
    startRoute(routeId)
      .then(() => setRouteStarted(true))
      .catch(() => alert('Failed to start route'));
  };

  const handleStop = () => {
    stopRoute(routeId)
      .then(() => setRouteStarted(false))
      .catch(() => alert('Failed to stop route'));
  };

  const handleMarkCompleted = (orderId) => {
    markOrderCompleted(routeId, orderId)
      .then(() => {
        setOrders(prev =>
          prev.map(o => (o.id === orderId ? { ...o, isCompleted: true } : o))
        );
      })
      .catch(() => alert('Nu am putut marca comanda ca finalizată.'));
  };

  if (loading) return <p>Se încarcă ruta…</p>;

  return (
    <div style={{ padding: '1rem' }}>
      <h2>🗺️ Driver Route Planner</h2>

      {/* Start / Stop buttons */}
      {!routeStarted
        ? <button onClick={handleStart}>▶️ Start Route</button>
        : <button onClick={handleStop}>⏸️ Stop Route</button>
      }

      {/* Map */}
      {encodedPolyline
        ? <MapWithRoute
            encodedPolyline={encodedPolyline}
            stops={stops}
            headquarters={HQ}
          />
        : <p>Nu există polilinie pentru această rută.</p>
      }

      {/* Navigate whole route */}
      {stops.length > 0 && (
        <div style={{ margin: '1rem 0' }}>
          <h3>💰 Total route value: {totalPrice} RON</h3>
          <a
            href={`https://www.google.com/maps/dir/${[HQ, ...stops, HQ]
              .map(p => `${p.lat},${p.lng}`)
              .join('/')}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <button style={{
              background: 'green',
              color: 'white',
              padding: '10px',
              border: 'none',
              borderRadius: '4px'
            }}>
              🚚 Navigate Entire Route
            </button>
          </a>
        </div>
      )}

      {/* Stop list */}
      {orders.map(order => (
        <div key={order.id} style={{
          border: '1px solid #ccc',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1rem',
          backgroundColor: order.isCompleted ? '#e0ffe0' : 'white'
        }}>
          <h4>📍 Stop {order.index}</h4>
          <p><strong>Customer:</strong> {order.customer}</p>
          <p><strong>Address:</strong> {order.address}</p>
          <p><strong>Phone:</strong> {order.phone}</p>
          <p><strong>Price:</strong> {order.price} RON</p>

          <div style={{ marginTop: '0.5rem' }}>
            <a href={`tel:${order.phone}`}>
              <button style={{ marginRight: '0.5rem' }}>📞 Call</button>
            </a>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${order.lat},${order.lng}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <button style={{ marginRight: '0.5rem' }}>🧭 Directions</button>
            </a>
            {!order.isCompleted && (
              <button
                onClick={() => markOrderCompleted(order.id)}
                style={{ backgroundColor: '#007bff', color: 'white' }}
              >
                ✅ Mark as Done
              </button>
            )}
          </div>
        </div>
      ))}

      {orders.length === 0 && <p>Nu există comenzi pe această rută.</p>}
    </div>
  );
}
