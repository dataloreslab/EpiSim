
import React from 'react';

interface TwoByTwoTableProps {
  data: {
    exposedCases: number;
    exposedNonCases: number;
    unexposedCases: number;
    unexposedNonCases: number;
  };
}

export const TwoByTwoTable: React.FC<TwoByTwoTableProps> = ({ data }) => {
  const { exposedCases: a, exposedNonCases: b, unexposedCases: c, unexposedNonCases: d } = data;
  const totalExposed = a + b;
  const totalUnexposed = c + d;
  const totalCases = a + c;
  const totalNonCases = b + d;
  const total = a + b + c + d;

  return (
    <div>
      <h3 className="text-lg font-medium leading-6 text-gray-200 mb-4">2x2 Contingency Table</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y-2 divide-slate-700 border border-slate-700">
          <thead className="bg-slate-800">
            <tr>
              <th className="p-3 text-left text-sm font-semibold text-gray-300"></th>
              <th className="p-3 text-center text-sm font-semibold text-red-300 border-l border-slate-700">Outcome + (Cases)</th>
              <th className="p-3 text-center text-sm font-semibold text-blue-300 border-l border-slate-700">Outcome - (Non-Cases)</th>
              <th className="p-3 text-center text-sm font-semibold text-gray-300 bg-slate-900/50 border-l border-slate-700">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700 bg-slate-800/50">
            <tr>
              <td className="p-3 text-sm font-medium text-gray-300">Exposure + (VibeBoost)</td>
              <td className="p-3 text-center text-lg text-gray-200 border-l border-slate-700">{a.toLocaleString()}</td>
              <td className="p-3 text-center text-lg text-gray-200 border-l border-slate-700">{b.toLocaleString()}</td>
              <td className="p-3 text-center text-sm font-semibold text-gray-300 bg-slate-800 border-l border-slate-700">{totalExposed.toLocaleString()}</td>
            </tr>
            <tr>
              <td className="p-3 text-sm font-medium text-gray-300">Exposure - (None)</td>
              <td className="p-3 text-center text-lg text-gray-200 border-l border-slate-700">{c.toLocaleString()}</td>
              <td className="p-3 text-center text-lg text-gray-200 border-l border-slate-700">{d.toLocaleString()}</td>
              <td className="p-3 text-center text-sm font-semibold text-gray-300 bg-slate-800 border-l border-slate-700">{totalUnexposed.toLocaleString()}</td>
            </tr>
          </tbody>
          <tfoot className="bg-slate-900/50">
            <tr>
              <td className="p-3 text-sm font-semibold text-gray-300">Total</td>
              <td className="p-3 text-center text-sm font-semibold text-gray-300 border-l border-slate-700">{totalCases.toLocaleString()}</td>
              <td className="p-3 text-center text-sm font-semibold text-gray-300 border-l border-slate-700">{totalNonCases.toLocaleString()}</td>
              <td className="p-3 text-center text-sm font-bold text-white border-l border-slate-700">{total.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};