import { test, expect } from 'vitest';

function buildAuthHeaders(token) {
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

test('Frontend network config attaches Bearer token if session exists', () => {
  // Guest user (No token)
  const guestHeaders = buildAuthHeaders(null);
  expect(guestHeaders['Authorization']).toBeUndefined();

  // Logged-in user (Has token)
  const authHeaders = buildAuthHeaders("super_secret_token");
  expect(authHeaders['Authorization']).toBe("Bearer super_secret_token");
});
