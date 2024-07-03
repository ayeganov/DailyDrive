"use client";

import assert from 'assert';
import { useRouter } from 'next/navigation';
import ChoreForm from './ChoreForm';
import ChoreRow from './ChoreRow';
import React, { useState, useEffect } from 'react';
import WeekdayCell from './WeekdayCell';
import axios from 'axios';
import { Chore, DAYS } from '../types';
import ColoredText from '../ColoredText';
import Link from 'next/link';
import { useAuth } from '../AuthContext';
import { useConsistency } from '../ConsistencyContext';
import { AnimationProvider } from '../AnimationContext';
import { useAlert } from '../AlertContext';
import UserStatsCard from './UserStatsCard';


const ChoreChart: React.FC = () => {
  const [ chores, setChores ] = useState<Chore[]>([]);
  const { active_user, logout, user_initialized, switch_user } = useAuth();
  const { fetchConsistencyData, scores, reward, } = useConsistency();
  const router = useRouter();
  const { showAlert } = useAlert();

  useEffect(() => {
    if(active_user === null)
    {
      router.push('/');
      return;
    }
    fetchChores();
  }, [user_initialized]);

  const fetchChores = async () =>
  {
    try
    {
      if(user_initialized)
      {
        console.log('Fetching chores for user:', active_user);
        const response = await axios.get<Chore[]>('/backend/api/v1/chores');
        setChores(response.data);
        update_consistency_data(response.data);
      }
    }
    catch (error)
    {
      console.error('Error fetching chores:', error);
    }
  }

  const handleAddChore = (chore: Chore) => {
    setChores((prevChores) => [...prevChores, chore]);
  };

  const update_consistency_data = (chores_state: Chore[]) =>
  {
    const statuses = chores_state.map((chore) => DAYS.map((day) => chore.statuses[day]));
    fetchConsistencyData(statuses);
  }

  const handle_chore_change = async (id: string, new_chore: Chore) =>
  {
    const new_chores = chores.map((chore) => chore.id === id ? new_chore : chore);
    setChores(new_chores);

    update_consistency_data(new_chores);
  };


  const handle_week_end = async () =>
  {
    const response = await axios.post('/backend/api/v1/end_week');
    // handle http errors first
    if(response.status !== 200)
    {
      showAlert("Failed to process week end", 'error');
      return;
    }


    const result = response.data.result;
    console.log('Week end result:', result);
    if(result.ok)
    {
      const new_chores = result.ok;
      setChores(new_chores);
      update_consistency_data(new_chores);
    }
    else if(result.error)
    {
      showAlert(result.error.message, 'error');
    }
  }

  const handle_delete_chore = async (id: string) =>
  {
    await axios.delete(`/backend/api/v1/chores/${id}`);
    const new_chores = chores.filter((chore) => chore.id !== id);
    setChores(new_chores);
    update_consistency_data(new_chores);
  };

  const handle_log_out = () =>
  {
    if(active_user === null)
    {
      console.error('No active user to log out!')
      return;
    }
    console.log('Logging out user:', active_user);
    logout(active_user.email);
    router.push('/');
  };

  const go_back_to_user_select = () =>
  {
    switch_user(null);
  }

  if(active_user === null)
  {
    return <span className="loading loading-infinity loading-lg"></span>;
  }

  assert(active_user !== null, 'Active user must be set to render ChoreChart');

  const userData = {
    avatarUrl: "/path-to-user-avatar.jpg",
    totalPoints: reward.total_points,
    gameTime: reward.game_time,
    pendingGameTime: scores.totalMinutes,
    tvTime: reward.tv_time,
    pendingTvTime: scores.totalMinutes,
    pendingPoints: scores.totalPoints,
    moneyEquivalent: scores.moneyEquivalent
  };

  return (
    <AnimationProvider>
      <div id="chore-chart">
        <div className="flex flex-row justify-between">
          <Link href="/">
            <ColoredText className="superbubble-font text-8xl p-8" style={{WebkitTextStroke: "5px white"}} text="Daily Drive" onClick={() => go_back_to_user_select()}/>
          </Link>
          <UserStatsCard {...userData} />
          <div className="text-center sm:text-right whitespace-nowrap">
            <div onClick={handle_week_end} className="transition duration-200 mx-5 px-5 py-4 cursor-pointer font-normal text-4xl rounded-lg text-gray-500 focus:outline-none focus:bg-orange-400 hover:bg-orange-400 ring-inset inline-block">
              <span className="inline-block ml-1 lucky-font text-yellow-200">End Week</span>
            </div>
          </div>
          <div className="text-center sm:text-right whitespace-nowrap">
            <div onClick={handle_log_out} className="transition duration-200 mx-5 px-5 py-4 cursor-pointer font-normal text-4xl rounded-lg text-gray-500 focus:outline-none focus:bg-orange-400 hover:bg-orange-400 ring-inset inline-block">
              <span className="inline-block ml-1 lucky-font text-zinc-200">Logout</span>
            </div>
          </div>
        </div>
        <div className="chore-chart">
          <div className="header">
            <WeekdayCell key="Chore" day="Chore" color_class='bg-orange-500' />
            <WeekdayCell key="Monday" day="Monday" color_class='bg-blue-500' />
            <WeekdayCell key="Tuesday" day="Tuesday" color_class='bg-purple-500' />
            <WeekdayCell key="Wednesday" day="Wednesday" color_class='bg-red-400' />
            <WeekdayCell key="Thursday" day="Thursday" color_class='bg-orange-400' />
            <WeekdayCell key="Friday" day="Friday" color_class='bg-green-700' />
            <WeekdayCell key="Saturday" day="Saturday" color_class='bg-yellow-500' />
            <WeekdayCell key="Sunday" day="Sunday" color_class='bg-indigo-500' />
          </div>
          {chores.map((chore, index) => (
            <ChoreRow key={chore.id}
                      index={index}
                      chore={chore}
                      onDelete={handle_delete_chore}
                      onStatusChange={handle_chore_change} />
        ))}
        </div>
        <ChoreForm onAddChore={handleAddChore} />
      </div>
    </AnimationProvider>
  );
};

export default ChoreChart;
