"use client";

import React, { useState } from 'react';
import { User } from './types';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import Link from 'next/link';


interface AvatarCarouselProps
{
  users: User[];
  on_user_click: (user: User) => void;
}


const AvatarCarousel: React.FC<AvatarCarouselProps> = ({ users, on_user_click }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + users.length) % users.length);
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % users.length);
  };

  const getVisibleUsers = () => {
    if (users.length <= 3) {
      return users;
    }
    const start = (currentIndex - 1 + users.length) % users.length;
    const middle = currentIndex;
    const end = (currentIndex + 1) % users.length;
    return [users[start], users[middle], users[end]];
  };

  return (
    <>
    <div className="flex items-center justify-center w-full h-20 bg-gray-100">
      <div className="text-center sm:text-left whitespace-nowrap">
        <Link href="/login" className="transition duration-200 mx-5 px-5 py-4 cursor-pointer font-normal text-6xl rounded-lg text-gray-500 focus:outline-none focus:bg-orange-400 hover:bg-orange-400 ring-inset inline-block">
          <span className="inline-block ml-1 lucky-font text-green-300">Login</span>
        </Link>
      </div>
      <div className="text-center sm:text-right whitespace-nowrap">
        <Link href="/register" className="transition duration-200 mx-5 px-5 py-4 cursor-pointer font-normal text-6xl rounded-lg text-gray-500 focus:outline-none focus:bg-orange-400 hover:bg-orange-400 ring-inset inline-block">
          <span className="inline-block ml-1 lucky-font text-blue-300">Register</span>
        </Link>
      </div>
    </div>
    <div className="relative flex items-center justify-center w-full h-screen bg-gray-100">
      <button
        className="absolute left-5 z-10 p-2 text-white bg-gray-600 rounded-l-full rounded-r-3xl focus:outline-none"
        onClick={handlePrev}
        style={{ width: '100px', height: '200px' }}
      >
        <FaArrowLeft size={40} className="absolute left-2 top-1/2 transform -translate-y-1/2" />
      </button>
      <div className="flex overflow-visible justify-center items-center space-x-10">
        {getVisibleUsers().map((user, index) => (
          <div
            key={user.username}
            onClick={() => on_user_click(user)}
            className={`transition-transform duration-300 ease-in-out ${
              index === 1 ? 'scale-150' : 'scale-100'
            }`}
          >
            <div className="w-60 h-60 rounded-full overflow-visible ring ring-primary ring-offset-base-100 ring-offset-2">
              <img src={`https://api.dicebear.com/5.x/initials/svg?seed=${user.username}`} alt={user.username} className="w-full h-full object-cover rounded-full" />
            </div>
          </div>
        ))}
      </div>
      <button
        className="absolute right-5 z-10 p-2 text-white bg-gray-600 rounded-r-full rounded-l-3xl focus:outline-none"
        onClick={handleNext}
        style={{ width: '100px', height: '200px' }}
      >
        <FaArrowRight size={40} className="absolute right-2 top-1/2 transform -translate-y-1/2" />
      </button>
    </div>
    </>
  );
};


export default AvatarCarousel;
