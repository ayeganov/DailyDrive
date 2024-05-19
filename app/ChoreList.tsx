import React from 'react';
import { Chore } from './types';

interface ChoreListProps {
  chores: Chore[];
}

const ChoreList: React.FC<ChoreListProps> = ({ chores }) => {
  return (
    <ul>
      {chores.map((chore) => (
        <li key={chore.id}>
          {chore.name} - "Pending"
        </li>
      ))}
    </ul>
  );
};

export default ChoreList;
