import React, { useState } from 'react';
import axios from "axios";
import ChoreModal from './ChoreModal';
import ChoreItem from './ChoreItem';
import { Chore, Days } from './types';


const DAYS: Days[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface ChoreRowProps
{
  chore: Chore;
  onStatusChange: (id: string, new_chore: Chore) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}


function get_previous_days(day: Days): Days[]
{
  const index = DAYS.indexOf(day);
  return DAYS.slice(0, index);
}


function get_current_week_day(): Days
{
  const current_date = new Date();
  let day_index = current_date.getDay();
  day_index = (day_index + 6) % 7;
  console.info('day_index:', day_index);
  return DAYS[day_index];
}


const ChoreRow: React.FC<ChoreRowProps> = ({ chore, onStatusChange, onDelete }) =>
{
  const [isModalOpen, setIsModalOpen] = useState(false);


  const handle_chore_click = async (day: Days) =>
  {
    const current_day = get_current_week_day();
    const previous_days = get_previous_days(current_day);
    const current_status = chore.statuses[day];
    let new_status = "_";

    const is_today = day === current_day;
    const is_marking_today = current_status === "_";
    const is_marking_previous = previous_days.includes(day);
    const is_future = !is_today && !is_marking_previous;


    if(is_today)
    {
      new_status = is_marking_today ? "X" : "_";
    }
    else if(is_marking_previous)
    {
      new_status = current_status === "X" ? "O" : "X";
    }
    else if(is_future)
    {
      new_status = "_";
    }

    const updatedChore = {
      ...chore,
      statuses: {
        ...chore.statuses,
        [day]: new_status
      }
    };

    try
    {
      await axios.put(`/backend/api/v1/chores/${chore.id}`, updatedChore);
      onStatusChange(chore.id, updatedChore);
    }
    catch (error)
    {
      console.error('Error updating chore:', error);
    }
  };

  const handleDelete = async () =>
  {
    try
    {
      onDelete(chore.id);
      setIsModalOpen(false);
    }
    catch (error)
    {
      console.error('Error deleting chore:', error);
    }
  };

  return (
    <div className="chore-row">
      <span className={`text-white text-2xl font-bold rounded-2xl border-2 p-4 flex justify-left items-center bg-blue-400 matcha-font`}
            onClick={() => setIsModalOpen(true)}
            style={{ cursor: 'pointer' }}>
        {chore.name}
      </span>
      {DAYS.map((day) => (
        <ChoreItem
          key={day}
          completed={chore.statuses[day]}
          onClick={() => handle_chore_click(day)}
        />
      ))}
      <ChoreModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        onDelete={handleDelete}
        choreName={chore.name}
      />
    </div>
  );
};


export default ChoreRow;
