import React, { useState } from 'react';
import axios from "axios";
import ChoreModal from './ChoreModal';
import ChoreItem from './ChoreItem';
import { Chore, Days } from './types';


interface ChoreRowProps
{
  chore: Chore;
  onStatusChange: (id: number, day: Days) => void;
  onDelete: (id: number) => void;
}


const ChoreRow: React.FC<ChoreRowProps> = ({ chore, onStatusChange, onDelete }) =>
{
  const [isModalOpen, setIsModalOpen] = useState(false);

  const days: Days[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleCheckboxChange = async (day: Days) =>
  {
    const updatedChore = {
      ...chore,
      statuses: {
        ...chore.statuses,
        [day]: !chore.statuses[day]
      }
    };

    try
    {
      await axios.put(`http://localhost:8000/api/chores/${chore.id}`, updatedChore);
      onStatusChange(chore.id, day);
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
      await axios.delete(`http://localhost:8000/api/chores/${chore.id}`);
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
      <span className={`text-white text-2xl font-bold rounded-2xl border-2 p-4 flex justify-left items-center bg-blue-400`} onClick={() => setIsModalOpen(true)} style={{ cursor: 'pointer' }}>
        {chore.name}
      </span>
      {days.map((day) => (
        <ChoreItem
          key={day}
          completed={chore.statuses[day]}
          onClick={() => handleCheckboxChange(day)}
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
