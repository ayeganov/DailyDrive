import React, { useEffect, useState } from 'react';
import { AlertType } from './types';

interface AlertProps {
  message: string;
  type: AlertType;
  onClose: () => void;
  duration: number; // Add duration prop to show progress bar
}

const Alert: React.FC<AlertProps> = ({ message, type = 'info', onClose, duration }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev > 0 ? prev - 1 : 0));
    }, duration / 100);

    const timeout = setTimeout(() => {
      onClose();
    }, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [duration, onClose]);

  const getAlertClass = (): string => {
    switch (type) {
      case 'success':
        return 'alert-success';
      case 'error':
        return 'alert-error';
      case 'warning':
        return 'alert-warning';
      default:
        return 'alert-info';
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className={`alert ${getAlertClass()} shadow-lg rounded-full mb-4 animate-fadeIn bg-gradient-to-r from-blue-400 to-purple-500 max-w-md mx-auto`}>
        <div className="flex flex-col items-center">
          <div className="text-white superbubble-font text-lg">
            <span>{message}</span>
          </div>
          <progress className="progress progress-primary w-full mt-2" value={progress} max="100"></progress>
        </div>
        <div className="flex-none">
          <button className="btn btn-circle btn-xs text-white" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Alert;
