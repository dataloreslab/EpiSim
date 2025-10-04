import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 text-white shadow-2xl border-b border-slate-700">
      <div className="container mx-auto px-4 lg:px-8 py-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-300 to-magenta-400 text-transparent bg-clip-text">
          EpiSim: The VibeBoost Investigation
        </h1>
        <p className="text-slate-400 mt-1">Design your study, find the truth.</p>
      </div>
    </header>
  );
};