"use client";

import assert from 'assert';
import React from 'react';
import { useAuth } from '../AuthContext';
import { useRouter } from 'next/navigation';
import { StatBox, TimeModifier, PositiveIntegerPicker, timeOperation, starsOperation } from '../StatBox';


interface UserStatsCardProps {
  totalPoints: number;
  gameTime: number;
  pendingGameTime: number;
  tvTime: number;
  pendingTvTime: number;
  pendingPoints: number;
  moneyEquivalent: number;
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


const UserStatsCard: React.FC<UserStatsCardProps> = ({
  totalPoints,
  gameTime,
  pendingGameTime,
  tvTime,
  pendingTvTime,
  pendingPoints,
  moneyEquivalent
}) => {

  const router = useRouter();
  const { active_user } = useAuth();

  assert (active_user !== null, "Active user is null");

  const pendingGameTimeClass = pendingGameTime >= 0 ? 'font-bold' : 'text-red-500';
  const pendingGameTimeDisplay = convert_minutes_to_display_time(pendingGameTime);
  const pendingTimeClass = pendingTvTime >= 0 ? 'font-bold' : 'text-red-500';
  const pendingTVTimeDisplay = convert_minutes_to_display_time(pendingTvTime);
  const gameTimeDisplay: string = convert_minutes_to_display_time(gameTime, false);
  const tvTimeDisplay = convert_minutes_to_display_time(tvTime, false);


  const handleAvatarClick = () => {
    if(active_user === null || active_user === undefined)
    {
      return;
    }

    if(active_user.is_superuser)
    {
      router.push('/dashboard');
    }
  };

  return (
    <div className="card bg-gradient-to-r from-indigo-300 to-pink-400 shadow-lg rounded-3xl p-4 transition-all hover:shadow-xl">
      <div className="flex items-center space-x-4">
        <div className="avatar" onClick={handleAvatarClick}>
          <div className="w-16 h-16 rounded-full ring-2 ring-purple-300 ring-offset-2">
            <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" alt={`${active_user.name}'s Avatar`} className="w-full h-full object-cover" />
          </div>
        </div>
        <div className="flex-grow">
          <h2 className="text-xl font-bold text-white">{active_user.name}</h2>
          <p className="text-sm text-white opacity-80">{active_user.email}</p>
        </div>

        <StatBox icon="🎮"
                 label="Game"
                 initialValue={gameTimeDisplay}
                 defaultValue="00:00"
                 renderPicker={TimeModifier}
                 applyOperation={timeOperation}
                 renderContent={({ value }) => (
                   <div className="flex flex-col items-center">
                     <div className="font-bold text-white text-lg">{value}</div>
                     <div className={`text-xs text-white opacity-80 ${pendingGameTimeClass}`}>{pendingGameTimeDisplay}</div>
                   </div>)}
        />

        <StatBox icon="📺"
                 label="TV"
                 initialValue={tvTimeDisplay}
                 defaultValue="00:00"
                 renderPicker={TimeModifier}
                 applyOperation={timeOperation}
                 renderContent={({ value }) => (
                   <div className="flex flex-col items-center">
                     <div className="font-bold text-white text-lg">{value}</div>
                     <div className={`text-xs text-white opacity-80 ${pendingTimeClass}`}>{pendingTVTimeDisplay}</div>
                   </div>)}
        />

        <StatBox icon="🌟"
                 label="Stars"
                 initialValue={totalPoints}
                 defaultValue={0}
                 renderPicker={PositiveIntegerPicker}
                 applyOperation={starsOperation}
                 renderContent={({ value }) => (
                   <div className="flex flex-col items-center">
                     <div className="font-bold text-white text-lg">{value}</div>
                     <div className={`text-xs text-white opacity-80`}>{pendingPoints}</div>
                   </div>)}
        />

          <div className="bg-white bg-opacity-20 rounded-xl p-2 text-white">
            <div className="font-medium">💵 Value</div>
            <div className="text-lg font-bold">${moneyEquivalent.toFixed(2)}</div>
            <span className={`text-xs text-white opacity-80`}>USD</span>
          </div>
      </div>
    </div>
  );
};


export default UserStatsCard;
