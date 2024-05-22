"use client";
import ChoreForm from './ChoreForm';
import ChoreRow from './ChoreRow';
import React, { useState, useEffect } from 'react';
import WeekdayCell from './WeekdayCell';
import axios from 'axios';
import { Chore, Days } from './types';


const ChoreChart: React.FC = () => {
  const [chores, setChores] = useState<Chore[]>([]);

  useEffect(() => {
    const fetchChores = async () =>
    {
      try
      {
        const response = await axios.get<Chore[]>('/backend/api/v1/chores');
        setChores(response.data);
      }
      catch (error)
      {
        console.error('Error fetching chores:', error);
      }
    };

    fetchChores();
  }, []);

  const handleAddChore = (chore: Chore) => {
    setChores((prevChores) => [...prevChores, chore]);
  };

  const handleStatusChange = async (id: number, day: Days) =>
  {
    setChores((prevChores) =>
      prevChores.map((chore) =>
        chore.id === id
          ? { ...chore, statuses: { ...chore.statuses, [day]: !chore.statuses[day] } }
          : chore
      )
    );
  };

  const handleDeleteChore = async (id: number) =>
  {
    await axios.delete(`/backend/api/v1/chores/${id}`);
    setChores((prevChores) => prevChores.filter((chore) => chore.id !== id));
  };

  return (
    <div id="chore-chart">
      <div className="bubblegum-sans-regular text-8xl p-8 " style={{WebkitTextStroke: "5px white"}}>Daily Drive</div>
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
                    onDelete={handleDeleteChore}
                    onStatusChange={handleStatusChange} />
      ))}
      </div>
    </div>
  );
};

export default ChoreChart;
