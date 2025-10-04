import React from 'react';

interface SliderProps {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  format?: 'number' | 'percent';
  disabled?: boolean;
  tooltip?: string;
}

const Tooltip: React.FC<{ text: string }> = ({ text }) => (
  <div className="group relative flex items-center">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 text-gray-400 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-3 bg-slate-700 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);


export const Slider: React.FC<SliderProps> = ({ label, min, max, step, value, onChange, format = 'number', disabled = false, tooltip }) => {
  const displayValue = format === 'percent' ? `${(value * 100).toFixed(0)}%` : value.toLocaleString();

  return (
    <div>
      <label className="flex justify-between items-center text-sm font-medium text-gray-300">
        <span className="flex items-center">
            {label}
            {tooltip && <Tooltip text={tooltip} />}
        </span>
        <span className="font-semibold text-teal-300 text-base">{displayValue}</span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        disabled={disabled}
        className={`w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer mt-1 accent-magenta-500 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      />
    </div>
  );
};