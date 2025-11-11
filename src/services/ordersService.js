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

// Helper function to parse existing full addresses back to components
export const parseAddressComponents = (fullAddress, apartmentNumber = null) => {
  if (!fullAddress) {
    return {
      deliveryCity: "",
      deliveryStreet: "",
      deliveryStreetNumber: "",
      apartmentNumber: apartmentNumber || "",
    }
  }

  // Try to parse the address using common Romanian patterns
  // Example: "Cluj-Napoca, Strada Memorandumului 28" or "Strada Lunii 22, Cluj-Napoca"

  const components = {
    deliveryCity: "",
    deliveryStreet: "",
    deliveryStreetNumber: "",
    apartmentNumber: apartmentNumber || "",
  }

  // Common Romanian cities
  const romanianCities = [
    "Cluj-Napoca",
    "București",
    "Timișoara",
    "Iași",
    "Constanța",
    "Craiova",
    "Brașov",
    "Galați",
    "Ploiești",
    "Oradea",
    "Braila",
    "Arad",
    "Pitești",
    "Sibiu",
    "Bacău",
    "Târgu Mureș",
    "Baia Mare",
    "Buzău",
    "Botoșani",
    "Satu Mare",
    "Râmnicu Vâlcea",
    "Suceava",
    "Piatra Neamț",
  ]

  // Try to find city in the address
  const foundCity = romanianCities.find((city) => fullAddress.toLowerCase().includes(city.toLowerCase()))

  if (foundCity) {
    components.deliveryCity = foundCity
    // Remove city from address to parse street
    const addressWithoutCity = fullAddress.replace(new RegExp(foundCity, "gi"), "").replace(/,\s*/g, "").trim()

    // Try to parse street and number from remaining text
    // Pattern: "Strada/Str./Bd./Bulevardul [Name] [Number]"
    const streetPattern = /^(Strada|Str\.|Bulevardul|Bd\.|Aleea|Calea|Piața)\s+(.+?)\s+(\d+[A-Za-z]?)$/i
    const match = addressWithoutCity.match(streetPattern)

    if (match) {
      components.deliveryStreet = `${match[1]} ${match[2]}`.trim()
      components.deliveryStreetNumber = match[3]
    } else {
      // Fallback: try to extract number from end
      const numberMatch = addressWithoutCity.match(/^(.+?)\s+(\d+[A-Za-z]?)$/)
      if (numberMatch) {
        components.deliveryStreet = numberMatch[1].trim()
        components.deliveryStreetNumber = numberMatch[2]
      } else {
        components.deliveryStreet = addressWithoutCity
      }
    }
  } else {
    // No city found, try to parse street and number
    const streetPattern = /^(Strada|Str\.|Bulevardul|Bd\.|Aleea|Calea|Piața)\s+(.+?)\s+(\d+[A-Za-z]?)$/i
    const match = fullAddress.match(streetPattern)

    if (match) {
      components.deliveryStreet = `${match[1]} ${match[2]}`.trim()
      components.deliveryStreetNumber = match[3]
    } else {
      // Fallback: try to extract number from end
      const numberMatch = fullAddress.match(/^(.+?)\s+(\d+[A-Za-z]?)$/)
      if (numberMatch) {
        components.deliveryStreet = numberMatch[1].trim()
        components.deliveryStreetNumber = numberMatch[2]
      } else {
        components.deliveryStreet = fullAddress
      }
    }
  }

  return components
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
  // Transform order data to match new API format with address components
  const transformedData = {
    id: id,
    customerId: orderData.customerId,
    telephoneNumber: orderData.telephoneNumber,
    receivedDate: orderData.receivedDate,
    status: orderData.status,
    serviceType: orderData.serviceType,
    observation: orderData.observation || "",
    items: orderData.items || [],

    // Handle address components for pickup/delivery
    ...(orderData.serviceType === "PickupDelivery" && {
      addressComponents: {
        street: orderData.deliveryStreet || "",
        streetNumber: orderData.deliveryStreetNumber || "",
        city: orderData.deliveryCity || "",
        apartmentNumber: orderData.apartmentNumber || null,
      },
    }),
  }

  const res = await fetch(`${API_BASE_URL}/api/orders/${id}`, {
    method: "PUT",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(transformedData),
  })
  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(`Failed to update order: ${errorText}`)
  }
  return res
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
export async function getFilteredOrders({ searchTerm, searchType,status, fromDate, toDate, serviceType }) {
  const params = new URLSearchParams();
  if (searchTerm) params.append('searchTerm', searchTerm);
  if (searchType) params.append("searchType", searchType);
  if (status)     params.append('status', status);
  if (fromDate)   params.append('fromDate', fromDate);
  if (toDate)     params.append('toDate', toDate);
  if (serviceType) params.append("serviceType", serviceType)

  const res = await fetch(`${API_BASE_URL}/api/orders?${params.toString()}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch filtered orders.');
  return res.json();
}
