import assert from 'assert';
import React, { useState, useEffect } from 'react';


interface TimePickerProps
{
  onChange?: (time: string) => void;
  initialTime?: string | number;
  className?: string;
  clockClassName?: string;
  rangeClassName?: string;
  maxHours?: number;
}


const TimePicker: React.FC<TimePickerProps> = ({
  onChange,
  initialTime = '00:00',
  className = '',
  clockClassName = '',
  rangeClassName = '',
  maxHours = 23
}) => {
  assert (typeof initialTime === 'string', "initialTime must be a string");

  const [hours, setHours] = useState(parseInt(initialTime.split(':')[0]));
  const [minutes, setMinutes] = useState(parseInt(initialTime.split(':')[1]));

  useEffect(() => {
    const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    if (onChange) {
      onChange(timeString);
    }
  }, [hours, minutes, onChange]);

  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHours(parseInt(e.target.value));
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMinutes(parseInt(e.target.value));
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className={`${clockClassName}`}>
        {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}
      </div>
      <div className={`w-full max-w-xs ${rangeClassName}`}>
        <label className="label">
          <span className="label-text text-2xl text-orange-500 matcha-font">Hours</span>
        </label>
        <input
          type="range"
          min="0"
          max={maxHours}
          value={hours}
          onChange={handleHourChange}
          className="range range-primary w-full"
          step="1"
        />
      </div>
      <div className={`w-full max-w-xs mt-4 ${rangeClassName}`}>
        <label className="label">
          <span className="label-text text-2xl text-orange-600 matcha-font">Minutes</span>
        </label>
        <input
          type="range"
          min="0"
          max="59"
          value={minutes}
          onChange={handleMinuteChange}
          className="range range-secondary w-full"
          step="1"
        />
      </div>
    </div>
  );
};

export default TimePicker;


//        <TimePicker onChange={(time) => console.log('Time selected:', time)}
//                    initialTime='01:00'
//                    maxHours={8}
//                    clockClassName="bg-opacity-70 p-2 rounded-2xl bg-accent bg-base-100 matcha-font text-4xl "
//                    rangeClassName="opacity-90 p-2 rounded-lg bg-gradient-to-r from-indigo-300 to-red-100 shadow-xl"
//                    />
