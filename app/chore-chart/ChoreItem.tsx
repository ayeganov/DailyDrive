"use client";

import React, { useEffect, useReducer, } from 'react';
import '../App.css';

import { Chore, } from '../types';
import { useConsistency } from '../ConsistencyContext';
import icon_reducer, { IconState, IconAction } from '../icon_reducer';
import { useAnimation } from '../AnimationContext';


interface ChoreItemProps
{
  chore: Chore;
  onClick: () => void;
  completed: string;
  x: number;
  y: number;
}


function is_in_full_x_columns(x: number, fullXColumns: number[]): boolean
{
  return fullXColumns.includes(x);
}


const coordinateExistsInArray = (coordinate: [number, number], array: number[][][]) => {
  return array.some(subArray => subArray.some(innerArray => innerArray[0] === coordinate[0] && innerArray[1] === coordinate[1]));
};


function animate_to_icon(dispatch: React.Dispatch<IconAction>, icon_name: string, animating_setter: CallableFunction): void
{
  animating_setter(true);
  dispatch({ type: 'SET_ICON', payload: "explosion2.gif"});
  setTimeout(() =>
  {
    dispatch({ type: 'SET_ICON', payload: icon_name });
    animating_setter(false);
  }, 1200);
}


function completed_to_icon(completed: string, is_perfect: boolean, is_triplet: boolean): string
{
  if(is_perfect)
  {
    return 'perfect_day.gif';
  }
  else if(is_triplet)
  {
    return 'earned_reward.gif';
  }

  switch(completed)
  {
    case "X":
      return 'star_alonka.png';
    case "O":
      return 'miss_day.png';
    case "_":
      return 'empty.png';
    default:
      return 'empty.png';
  }
}


const ChoreItem: React.FC<ChoreItemProps> = ({ chore, onClick, completed, x, y }) =>
{
  const { fullXColumns, horizontalOTriplets, horizontalXTriplets, verticalXTriplets, loading } = useConsistency();
  const [ state, dispatch ] = useReducer(icon_reducer, initial_state);
  const { setAnimating } = useAnimation();

  useEffect(() => {
    if(loading) return;

    const in_horizontal_x = coordinateExistsInArray([x, y], horizontalXTriplets);
    const in_vertical_x = coordinateExistsInArray([x, y], verticalXTriplets);
    const in_full_x = is_in_full_x_columns(y, fullXColumns);

    const i_am_special = in_full_x || in_horizontal_x || in_vertical_x;
    const icon = completed_to_icon(completed, in_full_x, in_horizontal_x || in_vertical_x);

    if (state.initialization)
    {
      dispatch({ type: 'SET_INITIAL', payload: false });
      dispatch({ type: 'SET_ICON', payload: icon });
      dispatch({ type: 'SET_AM_I_SPECIAL', payload: i_am_special });
    }
    else
    {
      const my_specialness_changed = i_am_special !== state.am_i_special;
      const my_icon_changed = icon !== state.icon;

      if(my_specialness_changed)
      {
        animate_to_icon(dispatch, icon, setAnimating);
      }
      else if (my_icon_changed)
      {
        if(i_am_special)
        {
          animate_to_icon(dispatch, icon, setAnimating);
        }
        else
        {
          dispatch({ type: 'SET_ICON', payload: icon });
        }
      }
    }

    dispatch({ type: 'SET_FULL_X_COLUMNS', payload: fullXColumns });
    dispatch({ type: 'SET_HORIZONTAL_O_TRIPLETS', payload: horizontalOTriplets });
    dispatch({ type: 'SET_HORIZONTAL_X_TRIPLETS', payload: horizontalXTriplets });
    dispatch({ type: 'SET_VERTICAL_X_TRIPLETS', payload: verticalXTriplets });
    dispatch({ type: 'SET_AM_I_SPECIAL', payload: i_am_special });

  }, [fullXColumns, horizontalOTriplets, horizontalXTriplets, verticalXTriplets]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const url = `static/images/${state.icon}`;
  return (
    <img className="icon bg-rounded-full" onClick={onClick} src={url} alt="chore icon" />
  );

};

export default ChoreItem;


const initial_state: IconState = {
  fullXColumns: [],
  horizontalOTriplets: [],
  horizontalXTriplets: [],
  verticalXTriplets: [],
  am_i_special: false,
  initialization: true,
  icon: 'empty.png',
};
