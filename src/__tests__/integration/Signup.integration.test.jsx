import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { test, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Signup from '../../pages/auth/Signup';
import { AuthProvider } from '../../context/AuthContext';

test('Signup Form UI Integration: Users can type into inputs', () => {
  // Step 1: Render the Signup page wrapped in necessary providers (Router & Auth Context)
  const { container } = render(
    <BrowserRouter>
      <AuthProvider>
        <Signup />
      </AuthProvider>
    </BrowserRouter>
  );

  // Step 2: Query the virtual DOM to find all the input fields and checkboxes by their ID
  const usernameInput = container.querySelector('#username');
  const emailInput = container.querySelector('#email');
  const passwordInput = container.querySelector('#password');
  const confirmPasswordInput = container.querySelector('#confirmPassword');
  const termsCheckbox = container.querySelector('#terms');

  // Step 3: Simulate a user actively typing in their credentials and checking the Terms box
  fireEvent.change(usernameInput, { target: { value: 'MahmoudMamdouh' } });
  fireEvent.change(emailInput, { target: { value: 'mahmoud@fitnex.com' } });
  fireEvent.change(passwordInput, { target: { value: 'MyPassword123' } });
  fireEvent.change(confirmPasswordInput, { target: { value: 'MyPassword123' } });
  fireEvent.click(termsCheckbox);

  // Step 4: Verify that React correctly captured and saved the user's input into its state
  expect(usernameInput.value).toBe('MahmoudMamdouh');
  expect(emailInput.value).toBe('mahmoud@fitnex.com');
  expect(passwordInput.value).toBe('MyPassword123');
  expect(confirmPasswordInput.value).toBe('MyPassword123');
  expect(termsCheckbox.checked).toBe(true);
});
