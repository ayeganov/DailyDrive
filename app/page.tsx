"use client";
import React, { useEffect } from 'react';
import ChoreChart from './ChoreChart';
import './App.css';
import Modal from 'react-modal';
import { useAuth } from './AuthContext';
import LoginPage from './login/page';
import { User } from './types';
import AvatarCarousel from './UserAvatars';


const App: React.FC = () =>
{
  const users: User[] = [
    { username: 'abc', token: 'abc123' },
    { username: 'def', token: 'abc123' },
    { username: 'ghi', token: 'abc123' },
    { username: 'jql', token: 'abc123' },
    { username: 'mn', token: 'abc123' },
    { username: 'op', token: 'abc123' },
    { username: 'qr', token: 'abc123' },
    { username: 'st', token: 'abc123' },
    { username: 'uv', token: 'abc123' },
    { username: 'wx', token: 'abc123' },
    { username: 'yz', token: 'abc123' },
    // Add more users as needed
  ];

  const handleUserClick = (user: User) => {
    console.log('Clicked user:', user);
  };


  const { activeUser } = useAuth();

  useEffect(() => {
    Modal.setAppElement('body');
  }, []);

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold text-center my-8">User Avatars</h1>
        <AvatarCarousel users={users} on_user_click={handleUserClick} />
    </div>
  );


//  return (
//    <div className="App">
//      {activeUser ? <ChoreChart /> : <LoginPage />}
//    </div>
//  );
};

export default App;
