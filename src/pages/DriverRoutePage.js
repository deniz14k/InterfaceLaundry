// src/pages/DriverRoutePage.js

import React, { useEffect, useState } from 'react';
import { useParams }                          from 'react-router-dom';
import MapWithRoute                            from '../components/MapWithRoute';
import { getRouteById, markOrderCompleted }    from '../services/RouteService';

export default function DriverRoutePage() {
  const { routeId } = useParams();
  const [loading, setLoading] = useState(true);
  const [encodedPolyline, setEncodedPolyline] = useState('');
  const [orders, setOrders] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  // coordonatele sediului
  const HQ = { lat: 46.517151, lng: 24.5223398 };

  useEffect(() => {
    if (!routeId) return;
    setLoading(true);

    getRouteById(routeId)
      .then(data => {
        // aici data.polyline este stringul cu encodedPolyline
        setEncodedPolyline(data.polyline);
        // data.orders e lista cu { index, id, lat, lng, address, phone, price, customer, isCompleted }
        setOrders(data.orders);
        setTotalPrice(data.orders.reduce((sum, o) => sum + (o.price||0), 0));
      })
      .catch(() => alert('Nu am putut încărca ruta.'))
      .finally(() => setLoading(false));
  }, [routeId]);

  const handleMarkCompleted = (orderId) => {
    markOrderCompleted(routeId, orderId)
      .then(() => {
        setOrders(prev =>
          prev.map(o =>
            o.id === orderId ? { ...o, isCompleted: true } : o
          )
        );
      })
      .catch(() => alert('Nu am putut marca comanda ca finalizată.'));
  };

  if (loading) return <p>Se încarcă ruta…</p>;

  return (
    <div style={{ padding: '1rem' }}>
      <h2>🗺️ Driver Route Planner</h2>

      {encodedPolyline
        ? (
          <MapWithRoute
            encodedPolyline={encodedPolyline}
            stops={orders.map(o => ({ lat: o.lat, lng: o.lng }))}
            headquarters={HQ}
          />
        )
        : <p>Nu există polilinie pentru această rută.</p>
      }

      {orders.length > 0 && (
        <div style={{ margin: '1rem 0' }}>
          <h3>💰 Total route value: {totalPrice} RON</h3>
          <a
            href={`https://www.google.com/maps/dir/${[HQ, ...orders.map(o=>({lat:o.lat,lng:o.lng})), HQ]
              .map(p=>`${p.lat},${p.lng}`)
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
                onClick={() => handleMarkCompleted(order.id)}
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
