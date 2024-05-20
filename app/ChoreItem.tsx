import React from 'react';
import './App.css';


const ChoreItem = ({ onClick, completed }) =>
{
  const url = `static/images/${completed ? 'star_alonka.png' : 'star.png'}`;
  return (
    <img
      className="star bg-rounded-full"
      onClick={onClick}
      src={url}
    />
  );
};

export default ChoreItem;
