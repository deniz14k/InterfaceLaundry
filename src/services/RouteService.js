// src/services/RouteService.js

import { jwtDecode } from "jwt-decode";  // dacă ai nevoie de decode la token, altfel poţi elimina
const API_BASE_URL = 'https://localhost:7223';



// DELETE rută
export async function deleteRoute(routeId) {
  const res = await fetch(`${API_BASE_URL}/api/deliveryroute/${routeId}`, {
    method: 'DELETE',
    headers: authHeaders()
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function autoGenerateRoute({ date, driverName }) {
  const res = await fetch(`${API_BASE_URL}/api/planner/auto-generate`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ date, driverName })
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}




/** Helper – atașează JWT la header */
function authHeaders(extra = {}) {
  const token = localStorage.getItem('token');
  return token
    ? { Authorization: `Bearer ${token}`, ...extra }
    : { ...extra };
}

/** ------------------------------- GET comenzile eligibile */
export async function getEligibleOrders() {
  const res = await fetch(`${API_BASE_URL}/api/deliveryroute/eligible-orders`, {
    headers: authHeaders()
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch eligible orders: ${text}`);
  }
  return res.json();
}

/** ------------------------------- GET toate rutele */
export async function getAllRoutes() {
  const res = await fetch(`${API_BASE_URL}/api/deliveryroute`, {
    headers: authHeaders()
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch routes: ${text}`);
  }
  return res.json();
}

/** ------------------------------- POST creare rută manuală */
export async function createRoute({ driverName, orderIds }) {
  const res = await fetch(`${API_BASE_URL}/api/planner/create-route`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ driverName, orderIds })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to create route: ${text}`);
  }
  return res.json(); // { id, driverName, orders }
}

/** ------------------------------- GET detalii rută */
export async function getRouteById(routeId) {
  const res = await fetch(`${API_BASE_URL}/api/deliveryroute/${routeId}`, {
    headers: authHeaders()
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch route details: ${text}`);
  }
  return res.json();
}

/** ------------------------------- PATCH marchează comanda finalizată */
export async function markOrderCompleted(routeId, orderId) {
  const res = await fetch(`${API_BASE_URL}/api/deliveryroute/${routeId}/complete/${orderId}`, {
    method: 'PATCH',
    headers: authHeaders()
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to mark order completed: ${text}`);
  }
  return res.json();
}
