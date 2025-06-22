// src/pages/ManualRoutesPage.js
import React, { useEffect, useState } from 'react';
import {
  getEligibleOrders,
  getAllRoutes,
  createRoute,
  getRouteById,
  markOrderCompleted
} from '../services/RouteService';

import { useNavigate } from 'react-router-dom';

export default function ManualRoutesPage() {
  const navigate = useNavigate();
  const [eligibleOrders, setEligibleOrders] = useState([]);
  const [allRoutes, setAllRoutes] = useState([]);
  const [selectedOrderIds, setSelectedOrderIds] = useState(new Set());
  const [driverName, setDriverName] = useState('');
  const [activeTab, setActiveTab] = useState('manual'); // 'manual' or 'automatic'

  useEffect(() => {
    // load eligible orders and existing routes
    getEligibleOrders().then(setEligibleOrders);
    getAllRoutes().then(setAllRoutes);
  }, []);

  const toggleOrder = (id) => {
    setSelectedOrderIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCreateManual = async () => {
    if (!driverName || selectedOrderIds.size < 2) {
      alert('Introduceți nume șofer și selectați cel puțin 2 comenzi.');
      return;
    }
    const request = { driverName, orderIds: Array.from(selectedOrderIds) };
    const { id: newRouteId } = await createRoute(request);
    navigate(`/driver/route/${newRouteId}`);
  };

  const handleGenerateAutomatic = () => {
    // For automatic generation, navigate to planner page
    navigate('/planner/automatic');
  };

  return (
    <div className="manual-routes-page p-4">
      <h2>Planificare rute</h2>
      <div className="tabs my-4">
        <button onClick={() => setActiveTab('manual')} className={activeTab==='manual'?'active':''}>Manuală</button>
        <button onClick={() => setActiveTab('automatic')} className={activeTab==='automatic'?'active':''}>Automată</button>
      </div>

      {activeTab === 'manual' ? (
        <div>
          <div className="driver-input mb-4">
            <label>Nume șofer:</label>
            <input type="text" value={driverName} onChange={e => setDriverName(e.target.value)} />
          </div>
          <table className="eligible-orders-table w-full mb-4">
            <thead>
              <tr><th>Select</th><th>ID</th><th>Client</th><th>Adresa</th><th>Telefon</th><th>Data</th></tr>
            </thead>
            <tbody>
              {eligibleOrders.map(o => (
                <tr key={o.id}>
                  <td><input type="checkbox" onChange={() => toggleOrder(o.id)} /></td>
                  <td>{o.id}</td>
                  <td>{o.customerId}</td>
                  <td>{o.deliveryAddress}</td>
                  <td>{o.telephoneNumber}</td>
                  <td>{new Date(o.receivedDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={handleCreateManual} className="btn btn-primary">Creează rută manuală</button>
        </div>
      ) : (
        <div>
          <p>Generare automată rute pentru ziua curentă.</p>
          <button onClick={handleGenerateAutomatic} className="btn btn-secondary">Generează automat</button>
          {allRoutes.length > 0 && (
            <ul className="routes-list mt-4">
              {allRoutes.map(r => (
                <li key={r.id}>
                  Rută #{r.id} - Șofer: {r.driverName} ({new Date(r.createdAt).toLocaleString()})
                  <button onClick={() => navigate(`/driver/route/${r.id}`)}>Vizualizează</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
