"use client";

import axios from 'axios';
import React, { createContext, useContext, useState, useEffect } from 'react';

interface ConsistencyContextProps
{
  fullXColumns: number[];
  horizontalOTriplets: number[][][];
  horizontalXTriplets: number[][][];
  verticalXTriplets: number[][][];
  totalPoints: number;
  fetchConsistencyData: (statuses: string[][]) => void;
  loading: boolean;
};


const ConsistencyContext = createContext<ConsistencyContextProps | undefined>(undefined);


export const ConsistencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) =>
{
  const [fullXColumns, setFullXColumns] = useState<number[]>([]);
  const [horizontalOTriplets, setHorizontalOTriplets] = useState<number[][][]>([]);
  const [horizontalXTriplets, setHorizontalXTriplets] = useState<number[][][]>([]);
  const [verticalXTriplets, setVerticalXTriplets] = useState<number[][][]>([]);
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchConsistencyData = async (statuses: string[][]) =>
  {
    // Replace with actual API call
    const response = await axios.post('/backend/api/v1/get_scores', { table: statuses });
    const data = response.data;
    setFullXColumns(data.full_X_columns);
    setHorizontalOTriplets(data.horizontal_O_triplets);
    setHorizontalXTriplets(data.horizontal_X_triplets);
    setVerticalXTriplets(data.vertical_X_triplets);
    setTotalPoints(data.total_points);
    setLoading(false);
  };

  return (
    <ConsistencyContext.Provider value={{ fullXColumns, horizontalOTriplets, horizontalXTriplets, verticalXTriplets, totalPoints, fetchConsistencyData, loading }}>
      {children}
    </ConsistencyContext.Provider>
  );
};


export const useConsistency = () =>
{
  const context = useContext(ConsistencyContext);
  if (!context)
  {
    throw new Error('useConsistency must be used within a ConsistencyProvider');
  }
  return context;
};

export { ConsistencyContext };
