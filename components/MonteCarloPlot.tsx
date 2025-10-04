import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { SimulationResult } from '../types';

interface MonteCarloPlotProps {
  results: SimulationResult;
}

// D3-like histogram function
const createHistogramData = (values: number[], tickCount = 20) => {
    if (values.length === 0) return [];
    const finiteValues = values.filter(v => isFinite(v) && v > 0);
    if (finiteValues.length === 0) return [];
    const min = Math.min(...finiteValues);
    const max = Math.max(...finiteValues);
    const binSize = (max - min) / tickCount;

    if (binSize === 0) { // Handle case where all values are the same
        return [{
            range: `${min.toFixed(2)}-${max.toFixed(2)}`,
            count: finiteValues.length,
            midpoint: min
        }];
    }

    const bins = new Array(tickCount).fill(0).map((_, i) => ({
        range: `${(min + i * binSize).toFixed(2)}-${(min + (i + 1) * binSize).toFixed(2)}`,
        count: 0,
        midpoint: min + (i + 0.5) * binSize,
    }));

    for (const value of finiteValues) {
        const binIndex = Math.floor((value - min) / binSize);
        if (bins[binIndex]) {
            bins[binIndex].count++;
        } else if (value === max) { // Edge case for max value
            bins[tickCount - 1].count++;
        }
    }
    return bins;
};


export const MonteCarloPlot: React.FC<MonteCarloPlotProps> = ({ results }) => {
  if (!results.monteCarlo) return null;
  const isCaseControl = results.parameters.studyType === 'Case-Control';
  const data = isCaseControl ? results.monteCarlo.estimatedORs : results.monteCarlo.estimatedRRs;
  const histogramData = createHistogramData(data);
  const meanEstimate = data.reduce((a, b) => a + (isFinite(b) ? b : 0), 0) / data.filter(isFinite).length;

  return (
    <div>
      <h3 className="text-lg font-medium leading-6 text-gray-200 mb-4">Distribution of Estimates ({results.parameters.monteCarloRuns} runs)</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={histogramData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
          <XAxis dataKey="midpoint" type="number" domain={['dataMin', 'dataMax']} tickFormatter={(tick) => tick.toFixed(1)} label={{ value: "Estimated RR / OR", position: "insideBottom", offset: -10, fill: '#9ca3af' }} stroke="#9ca3af"/>
          <YAxis label={{ value: 'Frequency', angle: -90, position: 'insideLeft', fill: '#9ca3af' }} stroke="#9ca3af"/>
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
            labelStyle={{ color: '#cbd5e1' }}
          />
          <Legend wrapperStyle={{top: -5, color: '#9ca3af'}}/>
          <Bar dataKey="count" fill="#2dd4bf" name="Frequency" />
          <ReferenceLine x={results.parameters.trueEffectRR} stroke="#f97316" strokeWidth={2} label={{ value: 'True RR', fill: '#f97316', position: 'insideTop', fontWeight: 'bold' }}/>
          {isFinite(meanEstimate) && <ReferenceLine x={meanEstimate} stroke="#4ade80" strokeDasharray="3 3" label={{ value: `Mean: ${meanEstimate.toFixed(2)}`, fill: '#4ade80', position: 'insideTopRight' }}/>}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};