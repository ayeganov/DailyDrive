"use client";

import React, {useEffect, useState} from 'react';
import axios from 'axios';
import { FamilyMember } from '../types';
import { StatBox, TimeModifier, PositiveIntegerPicker } from '../StatBox';
import { update_reward_stars, update_reward_time } from '../Utils';
import {MONEY_PER_STAR_POINT} from '../Constants';
import { useAlert } from '../AlertContext';


interface DashboardUserStatsProps {
  user: FamilyMember;
  gameTime: number;
  tvTime: number;
  stars: number;
  onWeekEnd: (user_id: string) => void;
}


function convert_minutes_to_display_time(minutes: number, show_sign: boolean = true): string
{
  const sign = minutes < 0 ? '-' : '+';
  const absMinutes = Math.abs(minutes);
  const hours = Math.floor((absMinutes % (24 * 60)) / 60);
  const mins = absMinutes % 60;

  const hoursString = hours.toString().padStart(2, '0');
  const minutesString = mins.toString().padStart(2, '0');
  if (show_sign) {
    return `${sign}${hoursString}:${minutesString}`.trim();
  }

  return `${hoursString}:${minutesString}`.trim();
}


const DashboardUserStats: React.FC<DashboardUserStatsProps> = ({
  user,
  gameTime,
  tvTime,
  stars,
  onWeekEnd
}) => {

  const [ money, setMoney ] = useState(stars !== undefined ? stars * MONEY_PER_STAR_POINT : 0);
  const { showAlert } = useAlert();
  const gameTimeDisplay: string = convert_minutes_to_display_time(gameTime, false);
  const tvTimeDisplay = convert_minutes_to_display_time(tvTime, false);

  useEffect(() => {
    if(stars !== undefined && stars !== null)
    {
      setMoney(stars * MONEY_PER_STAR_POINT);
    }
  }, [stars]);

  const update_star_points = async (value: number, operation: string, amount: number) =>   {
    const new_stars_str = await update_reward_stars(user.id, 'star_points', value, operation, amount);
    const new_stars = parseInt(new_stars_str);
    setMoney(new_stars * MONEY_PER_STAR_POINT);
    return new_stars_str;
  }

  const handle_week_end = async () =>
  {
    const params = { user_id: user.id };
    const response = await axios.post('/backend/api/v1/end_week', {}, { params });
    // handle http errors first
    if(response.status !== 200)
    {
      showAlert("Failed to process week end", 'error');
      return;
    }


    const result = response.data.result;
    if(result.error)
    {
      showAlert(result.error.message, 'error');
    }
    else if(result.ok)
    {
      onWeekEnd(user.id);
    }
  }

  return (
    <div className="card bg-gradient-to-r from-indigo-300 to-pink-400 shadow-lg rounded-3xl p-4 transition-all hover:shadow-xl">
      <div className="flex items-center space-x-4">
        <div className="avatar">
          <div className="w-16 h-16 rounded-full ring-2 ring-purple-300 ring-offset-2">
            <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" alt={`${user.name}'s Avatar`} className="w-full h-full object-cover" />
          </div>
        </div>
        <div className="flex-grow">
          <h2 className="text-xl font-bold text-white">{user.name}</h2>
          <p className="text-sm text-white opacity-80">{user.email}</p>
        </div>

        <StatBox icon="🎮"
                 label="Game"
                 initialValue={gameTimeDisplay}
                 defaultValue="00:00"
                 renderPicker={TimeModifier}
                 applyOperation={(...args: any[]) => update_reward_time(user.id, 'game_time', ...args)}
                 renderContent={({ value }) => (
                   <div className="flex flex-col items-center">
                     <div className="font-bold text-white text-lg">{value}</div>
                   </div>)}
        />

        <StatBox icon="📺"
                 label="TV"
                 initialValue={tvTimeDisplay}
                 defaultValue="00:00"
                 renderPicker={TimeModifier}
                 applyOperation={(...args: any[]) => update_reward_time(user.id, 'tv_time', ...args)}
                 renderContent={({ value }) => (
                   <div className="flex flex-col items-center">
                     <div className="font-bold text-white text-lg">{value}</div>
                   </div>)}
        />

        <StatBox icon="🌟"
                 label="Stars"
                 initialValue={stars}
                 defaultValue={0}
                 renderPicker={PositiveIntegerPicker}
                 applyOperation={update_star_points}
                 renderContent={({ value }) => (
                   <div className="flex flex-col items-center">
                     <div className="font-bold text-white text-lg">{value}</div>
                   </div>)}
        />

        <div className="bg-white bg-opacity-20 rounded-xl p-2 text-white">
          <div className="font-medium">💵 Value</div>
          <div className="text-lg font-bold">${money.toFixed(2)}</div>
        </div>

        <div className="text-center sm:text-right whitespace-nowrap">
          <div onClick={handle_week_end} className="transition duration-200 mx-5 px-5 py-5 cursor-pointer font-normal text-4xl rounded-lg text-gray-500 focus:outline-none focus:bg-orange-400 hover:bg-orange-400 ring-inset inline-block">
            <span className="inline-block ml-1 lucky-font text-yellow-200">End Week</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default DashboardUserStats;
