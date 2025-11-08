const API_BASE_URL = "https://localhost:7223"

/** Helper – always attach JWT if it exists in localStorage */
function authHeaders(extra = {}) {
  const token = localStorage.getItem("token")
  return token ? { Authorization: `Bearer ${token}`, ...extra } : { ...extra }
}

/** Get available time slots for a specific date */
export async function getAvailableTimeSlots(date, slotType = "Both") {
  const dateStr = date.toISOString().split("T")[0] // YYYY-MM-DD format
  const params = new URLSearchParams({
    date: dateStr,
    slotType: slotType,
  })

  const res = await fetch(`${API_BASE_URL}/api/scheduling/timeslots?${params}`, {
    headers: authHeaders(),
  })

  if (!res.ok) throw new Error("Failed to fetch available time slots")
  return res.json()
}

/** Create a new scheduling request */
export async function createSchedulingRequest(requestData) {
  const res = await fetch(`${API_BASE_URL}/api/scheduling/request`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(requestData),
  })

  if (!res.ok) {
    const errorText = await res.text()
    
  }
  return res.json()
}

/** Get scheduling requests for a specific order */
export async function getOrderSchedulingRequests(orderId) {
  const res = await fetch(`${API_BASE_URL}/api/scheduling/order/${orderId}/requests`, {
    headers: authHeaders(),
  })

  if (!res.ok) throw new Error("Failed to fetch scheduling requests")
  return res.json()
}

/** Get all pending scheduling requests (Staff only) */
export async function getPendingSchedulingRequests() {
  const res = await fetch(`${API_BASE_URL}/api/scheduling/pending`, {
    headers: authHeaders(),
  })

  if (!res.ok) throw new Error("Failed to fetch pending requests")
  return res.json()
}

/** Confirm or reject a scheduling request (Staff only) */
export async function confirmSchedulingRequest(confirmData) {
  const res = await fetch(`${API_BASE_URL}/api/scheduling/confirm`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(confirmData),
  })

  if (!res.ok) {
    const errorText = await res.text()
    //throw new Error(errorText || "Failed to confirm scheduling request")
  }
  return res.json()
}

/** Send notification for a scheduling request (Staff only) */
export async function sendSchedulingNotification(requestId, messageType = "Update") {
  const res = await fetch(`${API_BASE_URL}/api/scheduling/notify/${requestId}?messageType=${messageType}`, {
    method: "POST",
    headers: authHeaders(),
  })

  if (!res.ok) throw new Error("Failed to send notification")
  return res.json()
}
