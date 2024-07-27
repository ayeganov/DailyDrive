"use client";

import React from 'react';
import Image from "next/image";
import { User } from '../types';
import { IoIosArrowDropright, IoIosArrowDropleft } from "react-icons/io";


import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";


interface AvatarCarouselProps {
  users: User[];
  on_user_click: (user: User) => void;
}


const responsive = {
  superLargeDesktop: {
    breakpoint: { max: 4000, min: 3000 },
    items: 5,
  },
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 3,
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 2,
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1,
  },
};


interface UserCardProps {
  user: User;
  on_user_click: (user: User) => void;
}


const UserCard: React.FC<UserCardProps> = ({ user, on_user_click }) => {
  return (

    <div className='p-4'>
      <div className="lucky-font user-select-avatar three-d-style w-full max-w-xs bg-gradient-to-r from-purple-300 via-yellow-500 to-cyan-400 text-white shadow-lg rounded-lg transform hover:scale-105 transition duration-200">

        <figure className="px-10 pt-14 pb-0 flex justify-center">
          <Image  onClick={() => on_user_click(user)}  src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" alt={user.name} className="rounded-full border-4 border-white" width={100} height={100} />
        </figure>
        <div className="card-body items-center text-center ">
          <h2 className="card-title bubblegum-sans-regular text-2xl p-2 rounded-md">{user.name}</h2>
        </div>
      </div>
    </div>

  );
};


const CustomLeftArrow = ({ onClick }: { onClick?: () => void }) => {
  return (
    <button onClick={onClick} className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 left-arrow-style absolute left-0 bg-white p-2 rounded-full shadow-lg">
      <IoIosArrowDropleft size="40" color="white" />

    </button>
  );
};

const CustomRightArrow = ({ onClick }: { onClick?: () => void }) => {
  return (
    <button onClick={onClick} className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 right-arrow-style absolute right-0 bg-white p-2 rounded-full shadow-lg">
      <IoIosArrowDropright size="40" color="white" />

    </button>
  );
};



const AvatarCarousel: React.FC<AvatarCarouselProps> = ({ users, on_user_click }) => {
  return (
    <div className='container mx-auto'>
      <Carousel
        responsive={responsive}
        customLeftArrow={<CustomLeftArrow />}
        customRightArrow={<CustomRightArrow />}
        swipeable
      >
        {users.map((user) => (
          <UserCard key={user.token} user={user} on_user_click={on_user_click} />
        ))}
      </Carousel>
    </div>
  );

};



export default AvatarCarousel;
