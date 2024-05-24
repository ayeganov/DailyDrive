"use client";
import React, { useEffect, useState } from 'react';
import ChoreChart from './ChoreChart';
import './App.css';
import Modal from 'react-modal';
import { useAuth } from './AuthContext';
import LoginPage from './login/page';
import { User } from './types';
import AvatarCarousel from './UserAvatars';


const App: React.FC = () =>
{
  const { users, active_user, switch_user } = useAuth();
  const [hydrated, setHydrated] = useState(false);


  const handle_user_choice = (user: User) => {
    console.log('Clicked user:', user);
    switch_user(user.username);
  };

  useEffect(() => {
    setHydrated(true);
    Modal.setAppElement('body');
  }, []);

  const show_carousel = hydrated && active_user === null && users.length > 0;
  const show_login = hydrated && active_user === null && users.length === 0;
  const show_chore_chart = hydrated && active_user !== null;

  return (
    <div className="App">
      {show_carousel && (
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold text-center my-8">User Avatars</h1>
            <AvatarCarousel users={users} on_user_click={handle_user_choice} />
        </div>
      )}
      {show_login && <LoginPage />}
      {show_chore_chart && <ChoreChart />}
    </div>
  );
};

export default App;
