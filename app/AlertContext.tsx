import React, { createContext, useContext, useState, ReactNode } from 'react';
import Alert from './Alert';
import { AlertProps, AlertType } from './types';


interface AlertContextType
{
  showAlert: (message: string, type?: AlertType, duration?: number) => void;
}


const AlertContext = createContext<AlertContextType | undefined>(undefined);


export const useAlert = (): AlertContextType => {
  const context = useContext(AlertContext);
  if (!context)
  {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};


interface AlertProviderProps {
  children: ReactNode;
}


export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
  const [alerts, setAlerts] = useState<AlertProps[]>([]);

  const showAlert = (message: string, type: AlertType = 'info', duration: number = 3000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setAlerts((prevAlerts) => [...prevAlerts, { id, message, type }]);
    setTimeout(() => {
      setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.id !== id));
    }, duration);
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <div className="fixed top-4 right-4 z-50">
        {alerts.map((alert) => (
          <Alert
            key={alert.id}
            message={alert.message}
            type={alert.type}
            onClose={() => setAlerts((prevAlerts) => prevAlerts.filter((a) => a.id !== alert.id))}
            duration={3000}
          />
        ))}
      </div>
    </AlertContext.Provider>
  );
};
