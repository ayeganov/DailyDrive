"use client";
import ChoreForm from './ChoreForm';
import ChoreRow from './ChoreRow';
import React, { useState, useEffect } from 'react';
import WeekdayCell from './WeekdayCell';
import axios from 'axios';
import { Chore, Days } from './types';
import Link from 'next/link';
import { useAuth } from './AuthContext';


const ChoreChart: React.FC = () => {
  const [chores, setChores] = useState<Chore[]>([]);
  const { active_user, logout, user_initialized } = useAuth();

  useEffect(() => {
    const fetchChores = async () =>
    {
      try
      {
        if(user_initialized)
        {
          const response = await axios.get<Chore[]>('/backend/api/v1/chores');
          setChores(response.data);
        }
      }
      catch (error)
      {
        console.error('Error fetching chores:', error);
      }
    };

    fetchChores();
  }, [active_user, user_initialized]);

  const handleAddChore = (chore: Chore) => {
    setChores((prevChores) => [...prevChores, chore]);
  };

  const handle_chore_change = async (id: number, day: Days) =>
  {
    setChores((prevChores) =>
      prevChores.map((chore) =>
        chore.id === id
          ? { ...chore, statuses: { ...chore.statuses, [day]: !chore.statuses[day] } }
          : chore
      )
    );
  };

  const handle_delete_chore = async (id: number) =>
  {
    await axios.delete(`/backend/api/v1/chores/${id}`);
    setChores((prevChores) => prevChores.filter((chore) => chore.id !== id));
  };

  const handle_log_out = () =>
  {
    if(active_user === null)
    {
      console.error('No active user to log out!')
      return;
    }
    console.log('Logging out user:', active_user);
    logout(active_user);
  };

  return (
    <div id="chore-chart">
      <div className="flex flex-row justify-between">
        <div className="bubblegum-sans-regular text-8xl p-8 " style={{WebkitTextStroke: "5px white"}}>Daily Drive</div>
        <div className="text-center sm:text-right whitespace-nowrap">
          <div onClick={handle_log_out} className="transition duration-200 mx-5 px-5 py-4 cursor-pointer font-normal text-4xl rounded-lg text-gray-500 focus:outline-none focus:bg-orange-400 hover:bg-orange-400 ring-inset inline-block">
            <span className="inline-block ml-1 lucky-font text-zinc-200">Logout</span>
          </div>
        </div>
      </div>
      <ChoreForm onAddChore={handleAddChore} />
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
        {chores.map((chore) => (
          <ChoreRow key={chore.id}
                    chore={chore}
                    onDelete={handle_delete_chore}
                    onStatusChange={handle_chore_change} />
      ))}
      </div>
      <ChoreForm onAddChore={handleAddChore} />

    </div>
  );
};

export default ChoreChart;
