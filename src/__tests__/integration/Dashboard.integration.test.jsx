import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// 1. Mock API Response Data
const mockApiData = {
  calories: 2150,
  workoutsCompleted: 4,
  activeMinutes: 120
};

// 2. Isolated Dashboard UI Component
function DashboardOverview({ data }) {
  if (!data) return <div data-testid="loading-state">Loading user data...</div>;

  return (
    <div data-testid="dashboard-container">
      <h2>Welcome Back!</h2>
      <div data-testid="calories-display">{data.calories} kcal</div>
      <div data-testid="workouts-display">{data.workoutsCompleted} sessions</div>
      <div data-testid="minutes-display">{data.activeMinutes} mins</div>
    </div>
  );
}

// 3. Integration Test
test('Dashboard integration: renders API data correctly into the UI', () => {
  // Step A: Component mounts without data (fetching state)
  const { rerender } = render(<DashboardOverview data={null} />);
  expect(screen.getByTestId("loading-state").textContent).toBe("Loading user data...");

  // Step B: Backend API returns data and component re-renders (Integration Point)
  rerender(<DashboardOverview data={mockApiData} />);

  // Step C: Verify the UI successfully injected and rendered the backend data
  expect(screen.getByTestId("calories-display").textContent).toBe("2150 kcal");
  expect(screen.getByTestId("workouts-display").textContent).toBe("4 sessions");
  expect(screen.getByTestId("minutes-display").textContent).toBe("120 mins");
});
