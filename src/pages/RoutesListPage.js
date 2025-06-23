// src/pages/RoutesListPage.js

import React, { useEffect, useState } from 'react';
import { getAllRoutes, deleteRoute } from '../services/RouteService';

export default function RoutesListPage() {
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    loadRoutes();
  }, []);

  async function loadRoutes() {
    try {
      const data = await getAllRoutes();
      setRoutes(data);
    } catch (e) {
      console.error('Error loading routes:', e);
      alert('Could not load routes');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm(`Ștergi ruta #${id}?`)) return;
    try {
      await deleteRoute(id);
      setRoutes(rs => rs.filter(r => r.id !== id));
    } catch (e) {
      console.error('Delete failed:', e);
      alert(e.message);
    }
  }

  return (
    <div style={{ padding: '1rem' }}>
      <h2>🚚 Lista rutelor</h2>
      {routes.length === 0 && <p>Nu există rute.</p>}
      {routes.map(r => (
        <div key={r.id} style={{
          border: '1px solid #ccc',
          borderRadius: '6px',
          padding: '0.75rem',
          marginBottom: '0.75rem'
        }}>
          <strong>ID:</strong> {r.id} &nbsp;
          <strong>Șofer:</strong> {r.driverName} &nbsp;
          <strong>Creată la:</strong> {new Date(r.createdAt).toLocaleString()}
          <div style={{ marginTop: '0.5rem' }}>
            <strong>Stop-uri:</strong> {r.orders.length} &nbsp;
            <button
              onClick={() => handleDelete(r.id)}
              style={{
                background: '#c00',
                color: 'white',
                border: 'none',
                padding: '0.3rem 0.6rem',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              🗑️ Șterge ruta
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
