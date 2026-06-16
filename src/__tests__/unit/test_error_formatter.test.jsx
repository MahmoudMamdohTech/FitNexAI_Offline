import { test, expect } from 'vitest';

function formatApiError(errorResponse) {
  if (!errorResponse) return "An unknown error occurred.";
  if (errorResponse.status === 401) return "Session expired. Please log in again.";
  if (errorResponse.status === 409) return "That email is already registered.";
  return errorResponse.message || "Network error. Try again.";
}

test('Frontend error formatter translates backend codes to UI alerts', () => {
  expect(formatApiError({ status: 401 })).toBe("Session expired. Please log in again.");
  expect(formatApiError({ status: 409 })).toBe("That email is already registered.");
  expect(formatApiError({ status: 500, message: "Server down" })).toBe("Server down");
  expect(formatApiError(null)).toBe("An unknown error occurred.");
});
