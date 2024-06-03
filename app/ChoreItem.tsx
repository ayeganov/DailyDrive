import React from 'react';
import './App.css';


const ChoreItem = ({ onClick, completed }) =>
{
  var image = 'empty.png';
  if(completed === "X")
  {
    image = 'star_alonka.png';
  }
  else if(completed === "O")
  {
    image = 'miss_day.png';
  }
  const url = `static/images/${image}`;
  return (
    <img
      className="star bg-rounded-full"
      onClick={onClick}
      src={url}
    />
  );
};

export default ChoreItem;
