"use client";

import React from 'react';
import ChoreChart from './ChoreChart';
import { ConsistencyProvider } from '../ConsistencyContext';
import { AlertProvider } from '../AlertContext';

const ChoreChartPage: React.FC = () => {
  return (
    <ConsistencyProvider>
      <ChoreChart />
    </ConsistencyProvider>
  );
};

export default ChoreChartPage;

