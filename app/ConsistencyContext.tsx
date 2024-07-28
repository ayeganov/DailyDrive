"use client";

import axios from 'axios';
import React, { createContext, useContext, useState } from 'react';
import { Rewards } from './types';


interface ConsistencyScores
{
  fullXColumns: number[];
  horizontalOTriplets: number[][][];
  horizontalXTriplets: number[][][];
  verticalXTriplets: number[][][];
  totalPoints: number;
  totalMinutes: number;
};


interface ConsistencyContextProps
{
  scores: ConsistencyScores;
  reward: Rewards;
  fetchConsistencyData: (statuses: string[][]) => void;
  loading: boolean;
}


const ConsistencyContext = createContext<ConsistencyContextProps | undefined>(undefined);


const useConsistencyState = () =>
{
  const [scores, setScores] = useState<ConsistencyScores>({
    fullXColumns: [],
    horizontalOTriplets: [],
    horizontalXTriplets: [],
    verticalXTriplets: [],
    totalPoints: 0,
    totalMinutes: 0,
  });

  const [reward, setReward] = useState<Rewards>({
    star_points: 0,
    tv_time: 0,
    game_time: 0,
  });

  const [loading, setLoading] = useState<boolean>(true);

  const fetchConsistencyData = async (statuses: string[][]) => {
    try
    {
      const response = await axios.post('/backend/api/v1/get_scores', { table: statuses });
      const data = response.data;
      const week_scores = data.scores;

      setScores({
        fullXColumns: week_scores.full_X_columns,
        horizontalOTriplets: week_scores.horizontal_O_triplets,
        horizontalXTriplets: week_scores.horizontal_X_triplets,
        verticalXTriplets: week_scores.vertical_X_triplets,
        totalPoints: week_scores.total_points,
        totalMinutes: week_scores.total_minutes,
      });

      setReward({
        star_points: data.reward.star_points,
        tv_time: data.reward.tv_time_points,
        game_time: data.reward.game_time_points,
      });

    }
    finally
    {
      setLoading(false);
    }
  };

  return { scores, reward, fetchConsistencyData, loading };
};


export const ConsistencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { scores, reward, fetchConsistencyData, loading } = useConsistencyState();

  return (
    <ConsistencyContext.Provider value={{ scores, reward, fetchConsistencyData, loading }}>
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
