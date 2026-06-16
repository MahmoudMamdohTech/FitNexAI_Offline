import { test, expect } from 'vitest';

function getPasswordStrength(password) {
  if (!password) return { level: 0, label: '' };

  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  if (score <= 2) return { level: 1, label: 'Weak' };
  if (score <= 3) return { level: 2, label: 'Fair' };
  if (score <= 4) return { level: 3, label: 'Good' };
  return { level: 4, label: 'Strong' };
}

test('getPasswordStrength rates passwords correctly', () => {
  expect(getPasswordStrength("abc").level).toBe(1);
  expect(getPasswordStrength("pass12345").level).toBe(2);
  expect(getPasswordStrength("MySecure@Pass1").level).toBe(4);
  expect(getPasswordStrength("").level).toBe(0);
});
