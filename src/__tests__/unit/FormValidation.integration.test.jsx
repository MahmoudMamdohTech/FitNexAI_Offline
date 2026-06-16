import { test, expect } from 'vitest';

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateFullName(name) {
  return name.trim().length >= 3 && /^[a-zA-Z\s]+$/.test(name.trim());
}

function doPasswordsMatch(password, confirmPassword) {
  if (!password || !confirmPassword) return false;
  return password === confirmPassword;
}

function isUsernameValid(username) {
  return username.trim().length > 0;
}

test('Registration Form Pipeline Integration', () => {
  // 1. Email Format
  expect(validateEmail("user@example.com")).toBe(true);
  expect(validateEmail("invalid-email")).toBe(false);

  // 2. Full Name
  expect(validateFullName("Mahmoud Mamdouh")).toBe(true);
  expect(validateFullName("Mahmoud123")).toBe(false);

  // 3. Password Match
  expect(doPasswordsMatch("Secure123", "Secure123")).toBe(true);
  expect(doPasswordsMatch("Secure123", "Secure124")).toBe(false);

  // 4. Empty Fields (Whitespace)
  expect(isUsernameValid("Mahmoud")).toBe(true);
  expect(isUsernameValid("   ")).toBe(false);
});
