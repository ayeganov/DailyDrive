"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../AuthContext';
import Link from 'next/link';

import AvatarCarousel from './UserAvatars';
import "./user_select.css";
import {User} from '../types';


const UserSelection: React.FC = () =>
{
  const { users, switch_user } = useAuth();
  const router = useRouter();

  const handle_user_choice = (user: User) => {
    switch_user(user.username);
    router.push('/chore-chart');
  };

  return (
    <div id="user-selection" className="min-h-screen flex flex-col items-center justify-center">
      <div className="w-full flex justify-between items-center mb-8">

        <div className="text-center sm:text-right whitespace-nowrap">
          <Link href="/login" className="transition duration-200 mx-5 px-5 py-4 cursor-pointer font-normal text-4xl rounded-lg text-gray-500 focus:outline-none focus:bg-orange-400 hover:bg-orange-400 ring-inset inline-block">
            <span className="inline-block ml-1 lucky-font text-zinc-200">Login</span>
          </Link>
        </div>
        <div className="text-center sm:text-center whitespace-nowrap mb-8">
          <div className="transition duration-200 mx-5 px-5 py-4 font-bold text-5xl rounded-lg bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white shadow-lg inline-block transform hover:scale-105">
            <span className="inline-block ml-1 lucky-font">Who Are You?</span>
          </div>
        </div>
        <div className="text-center sm:text-right whitespace-nowrap">
          <Link href="/register" className="transition duration-200 mx-5 px-5 py-4 cursor-pointer font-normal text-4xl rounded-lg text-gray-500 focus:outline-none focus:bg-orange-400 hover:bg-orange-400 ring-inset inline-block">
            <span className="inline-block ml-1 lucky-font text-zinc-200">Register</span>
          </Link>
        </div>
      </div>
      <AvatarCarousel users={Array.from(users.values())} on_user_click={handle_user_choice} />
    </div>
  );
};


export default UserSelection;
