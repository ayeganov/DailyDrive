"use client";
import React, { useEffect } from 'react';
import ChoreChart from './ChoreChart';
import './App.css';
import Modal from 'react-modal';


const App: React.FC = () => {

  useEffect(() => {
    Modal.setAppElement('body');
  }, []);

  return (
    <div className="App">
      <ChoreChart />
    </div>
  );
};

export default App;
