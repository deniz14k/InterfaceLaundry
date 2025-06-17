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
    //const today = new Date().toISOString().split('T')[0];
    const today = '2025-06-18'; // hardcoded for testing

    getRouteForDate(today)
      .then(data => {
        const mainRoute = data.routes[0]; // this assumes backend sends full route response
        setRoute(mainRoute);

        const legs = mainRoute.legs;
        const points = [];

        legs.forEach(leg => {
          if (leg.startLocation?.latLng) {
            const { latitude, longitude } = leg.startLocation.latLng;
            points.push({ lat: latitude, lng: longitude });
          }
        });

        const lastLeg = legs[legs.length - 1];
        if (lastLeg?.endLocation?.latLng) {
          const { latitude, longitude } = lastLeg.endLocation.latLng;
          points.push({ lat: latitude, lng: longitude });
        }

        setCoords(points);

        const fakeOrders = points.map((p, i) => ({
          index: i + 1,
          lat: p.lat,
          lng: p.lng,
          address: `Stop ${i + 1}`,
          phone: `07${i + 1}000000`
        }));

        setOrders(fakeOrders);
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
          <div key={order.index} style={{ border: '1px solid #ccc', borderRadius: '8px', margin: '1rem 0', padding: '1rem' }}>
            <h4>📍 Stop {order.index}</h4>
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
