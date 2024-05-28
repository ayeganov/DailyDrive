"use client";

import React from 'react';

import { Days } from './types';


interface WeekdayCellProps
{
  day: Days;
  color_class: string;
}


const WeekdayCell: React.FC<WeekdayCellProps> = ({ day, color_class }) =>
{
  return (
    <div className={`${color_class} bubblegum-sans-regular text-white text-3xl rounded-t-2xl border-2 p-4 flex justify-center`}
    >{day}</div>
  );
};

export default WeekdayCell;

// style={{ "clip-path": "polygon(4% 0, 91% 4%, 100% 100%, 0% 100%)" }}
