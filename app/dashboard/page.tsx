'use client';

import React from 'react';
import Dashboard from './Dashboard';
import { ConsistencyProvider } from '../ConsistencyContext';


const DashboardPage: React.FC = () => {
  return (
    <ConsistencyProvider>
      <Dashboard />
    </ConsistencyProvider>
  );
};

export default DashboardPage;
