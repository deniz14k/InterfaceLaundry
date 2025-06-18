import React, { useEffect, useState } from 'react';
import { getRouteForDate } from '../services/ordersService';
import MapWithRoute from '../components/MapWithRoute';

function buildMobileRouteURL(points) {
  const encodedStops = points
    .filter(p => p?.lat !== undefined && p?.lng !== undefined)
    .map(p => `${p.lat},${p.lng}`)
    .join('/');
  return `https://www.google.com/maps/dir/${encodedStops}`;
}

function DriverRoutePage() {
  const [route, setRoute] = useState(null);
  const [orders, setOrders] = useState([]);
  const [coords, setCoords] = useState([]);

  useEffect(() => {
    const today = '2025-06-18'; // hardcoded for testing

    getRouteForDate(today)
      .then(data => {
        const mainRoute = data.route;
        const orderList = data.orders;

        setRoute(mainRoute);
        setOrders(orderList);

        const coordsFromOrders = orderList.map(o => ({
          lat: o.lat,
          lng: o.lng
        }));

        setCoords(coordsFromOrders);
      })
      .catch(e => console.error('Failed to load route:', e));
  }, []);

  return (
    <div style={{ padding: '1rem' }}>
      <h2>🗺️ Driver Route Planner</h2>

      {route && <MapWithRoute route={route} stops={coords} />}

      {coords.length > 0 && (
        <div style={{ margin: '1rem 0' }}>
          <a
            href={buildMobileRouteURL(coords)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <button style={{ background: 'green', color: 'white', padding: '10px', margin: '10px 0' }}>
              🚚 Navigate Entire Route
            </button>
          </a>
        </div>
      )}

      <div>
        {orders.map(order => (
          <div
            key={order.index}
            style={{
              border: '1px solid #ccc',
              borderRadius: '8px',
              margin: '1rem 0',
              padding: '1rem'
            }}
          >
            <h4>📍 Stop {order.index}</h4>
            <p><strong>Customer:</strong> {order.customer}</p>
            <p><strong>Address:</strong> {order.address}</p>
            <p><strong>Phone:</strong> {order.phone}</p>
            <a href={`tel:${order.phone}`}>
              <button>📞 Call Customer</button>
            </a>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${order.lat},${order.lng}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <button style={{ marginLeft: '1rem' }}>🧭 Directions</button>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DriverRoutePage;
