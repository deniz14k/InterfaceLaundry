// src/services/ordersService.js

import { jwtDecode } from "jwt-decode";
const API_BASE_URL = 'https://localhost:7223';

/** ----------------------------------------------------------------
 *  Helper – always attach JWT if it exists in localStorage
 * ----------------------------------------------------------------*/
function authHeaders(extra = {}) {
  const token = localStorage.getItem('token');
  return token
    ? { Authorization: `Bearer ${token}`, ...extra }
    : { ...extra };
}

/** ------------------------------- GET all orders */
export async function getAllOrders() {
  const res = await fetch(`${API_BASE_URL}/api/orders`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch orders.');
  return res.json();
}

/** ------------------------------- GET single order */
export async function getOrderById(id) {
  const res = await fetch(`${API_BASE_URL}/api/orders/${id}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch order.');
  return res.json();
}

/** ------------------------------- POST create order */
export async function createOrder(orderData) {
  // 1️⃣ Grab token + decode
  const token = localStorage.getItem('token');
  if (token) {
    const decoded = jwtDecode(token);

    // 2️⃣ Extract the ASP.NET claim URIs
    const role = decoded[
      'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
    ];
    // NameIdentifier was set to the phone in your OTP flow
    const phone = decoded[
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
    ];
    // Name was set to the real customer name
    const name  = decoded[
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'
    ];

    // 3️⃣ If it’s a customer, override the form values
    if (role === 'Customer') {
      orderData = {
        ...orderData,
        customerId:      name,
        telephoneNumber: phone,
      };
    }
  }

  // 4️⃣ Send to API with authHeaders
  const res = await fetch(`${API_BASE_URL}/api/orders`, {
    method:  'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body:    JSON.stringify(orderData),
  });
  if (!res.ok) throw new Error('Failed to create order.');
  return res.json();
}

/** ------------------------------- PUT update order */
export async function updateOrder(id, orderData) {
  const res = await fetch(`${API_BASE_URL}/api/orders/${id}`, {
    method: 'PUT',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(orderData),
  });
  if (!res.ok) throw new Error('Failed to update order.');
  return res;
}

/** ------------------------------- DELETE order */
export async function deleteOrder(id) {
  const res = await fetch(`${API_BASE_URL}/api/orders/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete order.');
  return res;
}

export async function verifyOtp(phone, code, name) {
  const r = await fetch(`${API_BASE_URL}/api/otp/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, code, name })
  });
  if (!r.ok) throw new Error('Invalid or expired code');
  return await r.json();   // { token }
}

/** ------------------------------- GET filtered orders */
export async function getFilteredOrders({ searchTerm, status, fromDate, toDate }) {
  const params = new URLSearchParams();
  if (searchTerm) params.append('searchTerm', searchTerm);
  if (status)     params.append('status', status);
  if (fromDate)   params.append('fromDate', fromDate);
  if (toDate)     params.append('toDate', toDate);

  const res = await fetch(`${API_BASE_URL}/api/orders?${params.toString()}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch filtered orders.');
  return res.json();
}
