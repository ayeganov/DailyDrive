"use client";
import React, { useEffect } from 'react';
import ChoreChart from './ChoreChart';
import './App.css';
import Modal from 'react-modal';
import { useAuth } from './AuthContext';
import LoginPage from './login/page';


const App: React.FC = () =>
{
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    Modal.setAppElement('body');
  }, []);

  return (
    <div className="App">
      {isAuthenticated ? <ChoreChart /> : <LoginPage />}
    </div>
  );
};

export default App;
