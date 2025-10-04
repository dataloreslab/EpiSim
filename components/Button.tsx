import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({ children, fullWidth = false, className, ...props }) => {
  return (
    <button
      {...props}
      className={`
        px-4 py-3 text-lg font-bold text-white rounded-md shadow-lg
        bg-magenta-600 hover:bg-magenta-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-magenta-500
        disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {children}
    </button>
  );
};

// Add magenta to Tailwind's color palette (conceptual)
/*
tailwind.config = {
  theme: {
    extend: {
      colors: {
        magenta: {
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
        }
      }
    }
  }
}
*/