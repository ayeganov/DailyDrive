import React, { useState, useRef, useEffect } from 'react';
import TimePicker from './TimePicker';
import { useAuth } from './AuthContext';


interface StatBoxProps {
  icon: string;
  label: string;
  initialValue: string | number;
  defaultValue: string | number;
  renderContent?: (props: { value: string | number }) => React.ReactNode;
  renderPicker: (props: PickerProps) => React.ReactNode;
  applyOperation: (currentValue: string | number, operation: 'add' | 'subtract', amount: string | number) => Promise<string | number>;
}


interface PickerProps {
  value: string | number;
  onChange: (newValue: string | number) => void;
  onApply: () => void;
  operation: 'add' | 'subtract';
  onToggleOperation: () => void;
}


export function timeOperation(currentValue: string, operation: 'add' | 'subtract', amount: string): string
{
  const is_negative = currentValue.startsWith('-');
  const [currentHours, currentMinutes] = currentValue.split(':').map(Number);
  const [amountHours, amountMinutes] = amount.split(':').map(Number);

  const currentTotalMinutes = is_negative
                              ? (currentHours * -1) * 60 + (currentMinutes * -1)
                              : currentHours * 60 + currentMinutes;
  const amountTotalMinutes = amountHours * 60 + amountMinutes;

  let newTotalMinutes = operation === 'add'
                        ? currentTotalMinutes + amountTotalMinutes
                        : currentTotalMinutes - amountTotalMinutes;

  const sign = newTotalMinutes < 0 ? '-' : '';
  const newHours = Math.floor(Math.abs(newTotalMinutes) / 60);
  const newMinutes = Math.abs(newTotalMinutes % 60);

  return `${sign}${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
};


export function starsOperation(current: number, operation: 'add' | 'subtract', amount: number): string
{
  return operation === 'add' ? (current + amount).toFixed(0)
                             : (current - amount).toFixed(0);
}


export const StatBox: React.FC<StatBoxProps> = ({
  icon,
  label,
  initialValue,
  defaultValue,
  renderContent,
  renderPicker,
  applyOperation
}) => {
  const [value, setValue] = useState<string | number>(initialValue);
  const [tempValue, setTempValue] = useState<string | number>(defaultValue);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [operation, setOperation] = useState<'add' | 'subtract'>('subtract');
  const pickerRef = useRef<HTMLDivElement>(null);
  const { active_user } = useAuth();

  const is_superuser = active_user?.is_superuser || false;


  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handlePickerChange = (newValue: string | number) => {
    setTempValue(newValue);
  };

  const handleApply = async () => {
    const result = await applyOperation(value, operation, tempValue);
    setValue(result);
    setIsPickerOpen(false);
  };

  const toggleOperation = () => {

    const is_switching_to_add = operation === 'subtract';
    if (is_switching_to_add && !is_superuser)
    {
      return
    }

    setOperation(prev => prev === 'add' ? 'subtract' : 'add');
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsPickerOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [value]);

  const togglePicker = () => {
    setIsPickerOpen(prev => !prev);
    setTempValue(defaultValue);
  };

  return (
    <div className="relative">
      <div
        role="button"
        aria-haspopup="dialog"
        aria-expanded={isPickerOpen}
        className="bg-white bg-opacity-20 rounded-lg p-2 text-center flex flex-col justify-center items-center w-auto min-w-[4rem] cursor-pointer"
        onClick={togglePicker}
        onKeyUp={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            togglePicker();
          }
        }}
        tabIndex={0}
      >
        <div className="text-lg flex items-center justify-center mb-1">
          <span className="mr-1">{icon}</span>
          <span className='text-white'>{label}</span>
        </div>
        {renderContent && renderContent({ value })}
      </div>
      {isPickerOpen && (
        <div
          ref={pickerRef}
          role="dialog"
          aria-labelledby={`${label}-picker-title`}
          className="absolute z-10 bg-white p-4 rounded shadow-lg"
        >
          <h2 id={`${label}-picker-title`} className="sr-only">{`${label} Picker`}</h2>
          {renderPicker({
            value: tempValue,
            onChange: handlePickerChange,
            onApply: handleApply,
            operation,
            onToggleOperation: toggleOperation
          })}
        </div>
      )}
    </div>
  );
};


interface ToggleSwitchProps {
  checked: boolean;
  onChange: () => void;
  addLabel: string;
  subtractLabel: string;
}


export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, addLabel, subtractLabel }) => (
  <label className="flex items-center cursor-pointer">
    <div className="relative">
      <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
      <div className={`block w-14 h-8 rounded-full transition-colors ${checked ? 'bg-green-500' : 'bg-red-500'}`}></div>
      <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition transform ${checked ? 'translate-x-6' : ''}`}></div>
    </div>
    <div className="ml-3 text-lg font-medium matcha-font text-orange-500">
      {checked ? addLabel : subtractLabel}
    </div>
  </label>
);


export const TimeModifier: React.FC<PickerProps> = ({ value, onChange, onApply, operation, onToggleOperation }) => {
  return (
    <div className="w-full h-full min-w-64 relative overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/time_change2.jpeg')",
        }}
      ></div>

      {/* Overlay to dim the background */}
      <div className="absolute inset-0 bg-black opacity-10"></div>

      {/* Content */}
      <div className="relative z-10 p-4">
        <TimePicker
          initialTime={value}
          onChange={onChange}
          className="mb-4"
          maxHours={8}
          clockClassName="matcha-font text-primary text-4xl font-bold mb-4 bg-opacity-70 p-2 rounded-2xl bg-accent bg-base-100 matcha-font text-4xl "
          rangeClassName="opacity-90 p-2 rounded-lg bg-gradient-to-r from-indigo-300 to-red-100 shadow-xl"
        />
        <div className="mb-2 bg-white bg-opacity-70 rounded p-2">
          <ToggleSwitch
            checked={operation === 'add'}
            onChange={onToggleOperation}
            addLabel="Add Time"
            subtractLabel="Subtract Time"
          />
        </div>
        <button
          onClick={onApply}
          className="rounded-lg transform hover:scale-105 three-d-style bg-gradient-to-r from-purple-400 via-blue-500 to-green-500 transition duration-200 mx-5 px-5 py-4 cursor-pointer font-normal text-4xl btn-radius text-gray-500 focus:outline-none focus:bg-orange-400 hover:bg-orange-400 ring-inset inline-block">
          <span className="inline-block ml-1 lucky-font text-zinc-200">Apply</span>
        </button>
      </div>
    </div>
  );
};


export const PositiveIntegerPicker: React.FC<PickerProps> = ({ value, onChange, onApply, operation, onToggleOperation }) => (
  <div className="w-48">
    <input
      type="number"
      min="0"
      value={value as number}
      onChange={(e) => onChange(parseInt(e.target.value))}
      step="1"
      className="border rounded p-1 w-full mb-2"
    />
    <div className="mb-2">
      <ToggleSwitch
        checked={operation === 'add'}
        onChange={onToggleOperation}
        addLabel="Increase Value"
        subtractLabel="Decrease Value"
      />
    </div>
    <button
      onClick={onApply}
      className="rounded-lg transform hover:scale-105 three-d-style bg-gradient-to-r from-purple-400 via-blue-500 to-green-500 transition duration-200 mx-5 px-5 py-4 cursor-pointer font-normal text-4xl btn-radius text-gray-500 focus:outline-none focus:bg-orange-400 hover:bg-orange-400 ring-inset inline-block">
      <span className="inline-block ml-1 lucky-font text-zinc-200">Apply</span>
    </button>
  </div>
);

const App: React.FC = () => {
  const timeOperation = (currentValue: string, operation: 'add' | 'subtract', amount: string): string => {
    const [currentHours, currentMinutes] = currentValue.split(':').map(Number);
    const [amountHours, amountMinutes] = amount.split(':').map(Number);
    let newHours = currentHours;
    let newMinutes = currentMinutes;

    if (operation === 'add') {
      newHours += amountHours;
      newMinutes += amountMinutes;
    } else {
      newHours -= amountHours;
      newMinutes -= amountMinutes;
    }

    newHours = (newHours + Math.floor(newMinutes / 60) + 24) % 24;
    newMinutes = (newMinutes + 60) % 60;

    return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
  };

  const distanceOperation = (current: number, operation: 'add' | 'subtract', amount: number): string => 
    operation === 'add' ? (current + amount).toFixed(1) 
                        : (current - amount).toFixed(1);

  return (
    <div className="p-4 flex space-x-4">
      <StatBox
        icon="⏰"
        label="Time"
        initialValue="09:00"
        renderContent={({ value }) => (
          <div className="flex flex-col items-center">
            <div className="font-bold text-lg">{value}</div>
            <div className="text-xs text-gray-500">Start Time</div>
          </div>
        )}
        renderPicker={TimeModifier}
        applyOperation={timeOperation}
      />

      <StatBox
        icon="🏃"
        label="Run"
        initialValue={5.0}
        renderContent={({ value }) => (
          <div className="flex flex-col items-center">
            <div className="font-bold text-lg">{value}</div>
            <div className="text-xs text-gray-500">km</div>
            <div className="text-xs text-blue-500 mt-1">Daily Goal: 5km</div>
          </div>
        )}
        renderPicker={PositiveIntegerPicker}
        applyOperation={distanceOperation}
      />
    </div>
  );
};

export default App;
