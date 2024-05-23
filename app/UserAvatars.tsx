"use client";

import React, { useState } from 'react';
import { User } from './types';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';


interface AvatarCarouselProps
{
  users: User[];
  on_user_click: (user: User) => void;
}

const AvatarCarousel: React.FC<AvatarCarouselProps> = ({ users }) => {
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
  );
};


export default AvatarCarousel;
