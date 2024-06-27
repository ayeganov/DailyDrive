"use client";

import React from 'react';

interface UserStatsCardProps {
  name: string;
  totalPoints: number;
  gameTime: string;
  pendingGameTime: string;
  tvTime: string;
  pendingTvTime: string;
  pendingPoints: number;
  dollarEquivalent: number;
}


const UserStatsCard: React.FC<UserStatsCardProps> = ({
  name,
  totalPoints,
  gameTime,
  pendingGameTime,
  tvTime,
  pendingTvTime,
  pendingPoints,
  dollarEquivalent
}) => {

  return (
    <div className="card bg-gradient-to-r from-indigo-300 to-pink-400 shadow-lg rounded-3xl p-4 transition-all hover:shadow-xl">
      <div className="flex items-center space-x-4">
        <div className="avatar">
          <div className="w-16 h-16 rounded-full ring-2 ring-purple-300 ring-offset-2">
            <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" alt={`${name}'s Avatar`} className="w-full h-full object-cover" />
          </div>
        </div>
        <div className="flex-grow">
          <h2 className="text-xl font-bold text-white">{name}</h2>
          <p className="text-sm text-white opacity-80">Total Stars: {totalPoints.toLocaleString()}</p>
        </div>
        <div className="flex space-x-3 text-sm">
          <div className="bg-white bg-opacity-20 rounded-xl p-2 text-white">
            <div className="font-medium">🎮 Game</div>
            <div className="text-lg font-bold">{gameTime}</div>
            <div className="text-xs opacity-80">+{pendingGameTime}</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-xl p-2 text-white">
            <div className="font-medium">📺 TV</div>
            <div className="text-lg font-bold">{tvTime}</div>
            <div className="text-xs opacity-80">-{pendingTvTime}</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-xl p-2 text-white">
            <div className="font-medium">🏆 Stars</div>
            <div className="text-lg font-bold">+{pendingPoints}</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-xl p-2 text-white">
            <div className="font-medium">💵 Value</div>
            <div className="text-lg font-bold">${dollarEquivalent.toFixed(2)}</div>
          </div>
        </div>
      </div>
    </div>
  );

};

export default UserStatsCard;
