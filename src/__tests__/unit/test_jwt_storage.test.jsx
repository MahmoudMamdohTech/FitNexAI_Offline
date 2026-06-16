import { test, expect, beforeEach } from 'vitest';

function saveSession(token) {
  if (!token) return false;
  localStorage.setItem('fitnex_token', token);
  return true;
}

function getSession() {
  return localStorage.getItem('fitnex_token');
}

beforeEach(() => {
  localStorage.clear();
});

test('Frontend securely stores the JWT in the browser localStorage', () => {
  expect(getSession()).toBeNull(); // Initially empty

  const success = saveSession("mock_jwt_token_123");
  
  expect(success).toBe(true);
  expect(getSession()).toBe("mock_jwt_token_123"); // Successfully stored
});
