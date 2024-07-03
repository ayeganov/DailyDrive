"use client";

import assert from 'assert';
import React from 'react';
import { useAuth } from '../AuthContext';
import { useRouter } from 'next/navigation';


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
  const days = Math.floor(absMinutes / (24 * 60));
  const hours = Math.floor((absMinutes % (24 * 60)) / 60);
  const mins = absMinutes % 60;

  const daysString = days > 0 ? `${days}d ` : '';
  const hoursString = hours >= 0 ? `${hours}h ` : '';
  const minutesString = mins >= 0 ? `${mins}m` : '';

  if (show_sign) {
    return `${sign}${daysString}${hoursString}${minutesString}`.trim();
  }

  return `${daysString}${hoursString}${minutesString}`.trim();
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
  const gameTimeDisplay = convert_minutes_to_display_time(gameTime, false);
  const tvTimeDisplay = convert_minutes_to_display_time(tvTime, false);

  const handleAvatarClick = () => {
    console.log(`Avatar of ${active_user.username} clicked!`);
    router.push('/dashboard');
  };

  return (
    <div className="card bg-gradient-to-r from-indigo-300 to-pink-400 shadow-lg rounded-3xl p-4 transition-all hover:shadow-xl">
      <div className="flex items-center space-x-4">
        <div className="avatar" onClick={handleAvatarClick}>
          <div className="w-16 h-16 rounded-full ring-2 ring-purple-300 ring-offset-2">
            <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" alt={`${active_user.username}'s Avatar`} className="w-full h-full object-cover" />
          </div>
        </div>
        <div className="flex-grow">
          <h2 className="text-xl font-bold text-white">{active_user.username}</h2>
          <p className="text-sm text-white opacity-80">Total Stars: {totalPoints.toLocaleString()}</p>
        </div>
        <div className="flex space-x-3 text-sm">
          <div className="bg-white bg-opacity-20 rounded-xl p-2 text-white">
            <div className="font-medium">🎮 Game</div>
            <div className="text-lg font-bold">{gameTimeDisplay}</div>
            <div className={`text-xs opacity-80 ${pendingGameTimeClass}`}>{pendingGameTimeDisplay}</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-xl p-2 text-white">
            <div className="font-medium">📺 TV</div>
            <div className="text-lg font-bold">{tvTimeDisplay}</div>
            <div className={`text-xs opacity-80 ${pendingTimeClass}`}>{pendingTVTimeDisplay}</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-xl p-2 text-white">
            <div className="font-medium">🏆 Stars</div>
            <div className="text-lg font-bold">{pendingPoints}</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-xl p-2 text-white">
            <div className="font-medium">💵 Value</div>
            <div className="text-lg font-bold">${moneyEquivalent.toFixed(2)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default UserStatsCard;
