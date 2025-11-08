const API = 'https://localhost:7223';

function normalizePhone(raw) {
  let phone = raw.trim()
  if (/^0/.test(phone)) {
    // for making +40 to 07 automatically
    phone = "+40" + phone.slice(1)
  } else if (!/^\+/.test(phone)) {
    phone = "+" + phone
  }
  return phone
}


export async function sendOtp(rawPhone) {
  const phone = normalizePhone(rawPhone)
  const res = await fetch(`${API}/api/otp/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone })
  })
  if (!res.ok) throw new Error("Failed to send code")
  return res.json()
}

export async function verifyOtp(rawPhone, code, name) {
  const phone = normalizePhone(rawPhone)
  const res = await fetch(`${API}/api/otp/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, code, name })
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(txt || "Bad or expired code")
  }
  return res.json()  // { token }
}
