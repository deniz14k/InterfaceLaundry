// src/pages/ManualRoutesPage.js
import React, { useEffect, useState } from 'react';
import { getEligibleOrders, createRoute, autoGenerateRoute } from '../services/RouteService';
import { useNavigate } from 'react-router-dom';

export default function ManualRoutesPage() {
  const [eligibleOrders, setEligibleOrders] = useState([]);
  const [selectedIds,   setSelectedIds]   = useState([]);
  const [driverName,    setDriverName]    = useState('');
  const [date,          setDate]          = useState(new Date().toISOString().split('T')[0]);
  const navigate = useNavigate();

  useEffect(() => {
    // încarcă comenzile eligibile
    getEligibleOrders().then(setEligibleOrders).catch(console.error);
  }, []);

  // Comportament buton AUTO
  const handleAuto = async () => {
    try {
      const { id: routeId } = await autoGenerateRoute({ date, driverName });
      navigate(`/driver/route/${routeId}`);
    } catch (e) {
      alert('Eroare la generarea automată: ' + e.message);
    }
  };

  // Comportament buton MANUAL
  const handleManual = async () => {
    if (selectedIds.length < 2) {
      alert('Selectează măcar două comenzi.');
      return;
    }
    try {
      const { id: routeId } = await createRoute({ driverName, orderIds: selectedIds });
      navigate(`/driver/route/${routeId}`);
    } catch (e) {
      alert('Eroare la crearea manuală: ' + e.message);
    }
  };

  // toggle selecție
  const toggle = id =>
    setSelectedIds(s =>
      s.includes(id) ? s.filter(x => x !== id) : [...s, id]
    );

  return (
    <div style={{ padding: '1rem' }}>
      <h2>🛠️ Manual & Automat</h2>

      <section style={{ marginBottom: '2rem' }}>
        <h3>▶️ Generare automată</h3>
        <label>
          Data ruta:{' '}
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
        </label>
        <label style={{ marginLeft: '1rem' }}>
          Șofer:{' '}
          <input
            type="text"
            placeholder="Nume șofer"
            value={driverName}
            onChange={e => setDriverName(e.target.value)}
          />
        </label>
        <button
          onClick={handleAuto}
          style={{ marginLeft: '1rem', padding: '0.5em 1em' }}
        >
          Generează automat
        </button>
      </section>

      <section>
        <h3>✍️ Creare manuală</h3>
        <p>Selectează comenzile pe care vrei să le pui în rută:</p>
        <div style={{ maxHeight: 300, overflowY: 'scroll', border: '1px solid #ddd', padding: 10 }}>
          {eligibleOrders.map(o => (
            <label key={o.id} style={{ display: 'block', marginBottom: 4 }}>
              <input
                type="checkbox"
                checked={selectedIds.includes(o.id)}
                onChange={() => toggle(o.id)}
              />{' '}
              [{o.id}] {o.deliveryAddress} — {o.telephoneNumber}
            </label>
          ))}
        </div>
        <div style={{ marginTop: '1rem' }}>
          <label>
            Șofer:{' '}
            <input
              type="text"
              placeholder="Nume șofer"
              value={driverName}
              onChange={e => setDriverName(e.target.value)}
            />
          </label>
          <button
            onClick={handleManual}
            style={{ marginLeft: '1rem', padding: '0.5em 1em' }}
          >
            Crează rută manuală
          </button>
        </div>
      </section>
    </div>
  );
}
