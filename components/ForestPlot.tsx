import React from 'react';
import {
  ComposedChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ErrorBar
} from 'recharts';
import type { SimulationResult } from '../types';

interface ForestPlotProps {
  results: SimulationResult;
}

export const ForestPlot: React.FC<ForestPlotProps> = ({ results }) => {
  const isCaseControl = results.parameters.studyType === 'Case-Control';
  
  const data = [
    { 
      name: 'Crude RR',
      value: results.singleRun.crudeRR,
      ci: results.singleRun.crudeRR_CI,
      show: !isCaseControl,
    },
    { 
      name: 'Crude OR',
      value: results.singleRun.crudeOR,
      ci: results.singleRun.crudeOR_CI,
      show: true,
    },
    { 
      name: 'Adjusted OR',
      value: results.singleRun.adjustedOR,
      ci: results.singleRun.adjustedOR_CI,
      show: true,
    },
  ].filter(d => d.show && d.value > 0).map(d => ({
    ...d,
    error: [d.value - d.ci[0], d.ci[1] - d.value]
  }));

  const domainMax = Math.max(
    results.parameters.trueEffectRR * 1.5,
    ...data.map(d => d.ci[1]),
    3
  );
  
  return (
    <div>
        <h3 className="text-lg font-medium leading-6 text-gray-200 mb-4">Effect Measure Estimates</h3>
        <ResponsiveContainer width="100%" height={300}>
        <ComposedChart
          layout="vertical"
          data={data}
          margin={{ top: 20, right: 80, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
          <XAxis 
            type="number" 
            scale="log" 
            domain={[0.25, domainMax]} 
            allowDataOverflow
            ticks={[0.25, 0.5, 1, 2, 4, 8]}
            label={{ value: "RR / OR (log scale)", position: "insideBottom", offset: -10, fill: '#9ca3af' }}
            stroke="#9ca3af"
          />
          <YAxis dataKey="name" type="category" width={100} stroke="#9ca3af" />
          <Tooltip 
             contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
             labelStyle={{ color: '#cbd5e1' }}
             formatter={(value: number) => value.toFixed(2)} 
          />
          <Legend wrapperStyle={{ color: '#9ca3af' }}/>
          <ReferenceLine x={1} stroke="#6b7280" strokeDasharray="3 3" />
          <ReferenceLine x={results.parameters.trueEffectRR} stroke="#f97316" strokeDasharray="4 4" label={{ value: 'True RR', fill: '#f97316', position: 'insideTopLeft' }} />
          
          <Scatter name="Estimate" dataKey="value" fill="#2dd4bf">
            <ErrorBar dataKey="error" width={8} strokeWidth={2} stroke="#2dd4bf" direction="x" />
          </Scatter>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};