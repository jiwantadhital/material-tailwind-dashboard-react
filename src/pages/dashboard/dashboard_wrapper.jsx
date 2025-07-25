import React from 'react';
import { Home } from './home';
import { LawyerDashboard } from './lawyer_dashboard';

export function DashboardWrapper() {
  // Get user role from localStorage
  const user = localStorage.getItem('user');
  const userRole = user ? JSON.parse(user).role : null;

  // Render appropriate dashboard based on user role
  if (userRole === "lawyer") {
    return <LawyerDashboard />;
  } else {
    return <Home />;
  }
} 