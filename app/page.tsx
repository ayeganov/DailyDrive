"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import './App.css';
import Modal from 'react-modal';
import { useAuth } from './AuthContext';
import LoginPage from './login/page';
import UserSelection from './user_select/page';
import { ConsistencyProvider, } from './ConsistencyContext';


const App: React.FC = () =>
{
  const { users, active_user } = useAuth();
  const [hydrated, setHydrated] = useState(false);
  const router = useRouter();


  useEffect(() => {
    setHydrated(true);
    Modal.setAppElement('body');

    if (hydrated)
    {
      if (active_user === null)
      {
        if (users.size > 0)
        {
          console.info("user select");
          router.push('/user_select');
        }
        else
        {
          console.info("login");
          router.push('/login');
        }
      }
      else
      {
        console.info("chore chart");
        router.push('/chore-chart');
      }
    }
  }, [hydrated, active_user, users, router]);

  return null;
};

export default App;
