const API = 'https://localhost:7223';

export async function sendOtp(phone) {
  const r = await fetch(`${API}/api/otp/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone })
  });
  if (!r.ok) throw new Error('Failed to send code');
  return await r.json();     // dev build returns {code: '123456'}
}

export async function verifyOtp(phone, code, name) {
  const res = await fetch(`${API}/api/otp/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, code, name })
  });
  if (!res.ok) throw new Error(await res.text() || 'Bad or expired code');
  return await res.json();  // { token }
}
