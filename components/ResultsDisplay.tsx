import React, { useState } from 'react';
import type { SimulationResult, StudyType } from '../types';
import { Tabs } from './Tabs';
import { TwoByTwoTable } from './TwoByTwoTable';
import { ForestPlot } from './ForestPlot';
import { MonteCarloPlot } from './MonteCarloPlot';
import { DAG } from './DAG';

interface ResultsDisplayProps {
  results: SimulationResult | null;
  isLoading: boolean;
  error: string | null;
  studyType: StudyType;
  trueEffectRR: number;
}

const formatNumber = (num: number | undefined) => num?.toFixed(2) ?? 'N/A';
const formatPercent = (bias: number) => {
    if (isNaN(bias) || !isFinite(bias)) return 'N/A';
    const sign = bias > 0 ? '+' : '';
    return `${sign}${(bias * 100).toFixed(0)}%`;
};

const SUCCESS_THRESHOLD = 0.10; // 10% tolerance for a successful investigation

const Summary: React.FC<{ results: SimulationResult }> = ({ results }) => {
    const trueEffect = results.parameters.trueEffectRR;
    const isCaseControl = results.parameters.studyType === 'Case-Control';
    const estimatedEffect = isCaseControl ? results.singleRun.adjustedOR : results.singleRun.crudeRR;
    const bias = (estimatedEffect - trueEffect) / trueEffect;
    const isSuccess = Math.abs(bias) <= SUCCESS_THRESHOLD;

    const measures = [
        { label: 'Crude Risk Ratio (RR)', value: results.singleRun.crudeRR, ci: results.singleRun.crudeRR_CI, show: !isCaseControl },
        { label: 'Crude Odds Ratio (OR)', value: results.singleRun.crudeOR, ci: results.singleRun.crudeOR_CI, show: true },
        { label: 'Adjusted Odds Ratio (OR)', value: results.singleRun.adjustedOR, ci: results.singleRun.adjustedOR_CI, show: true },
    ];
    
    return (
        <div className="space-y-6">
            <div className={`p-6 bg-slate-800 border-l-8 rounded-r-lg ${isSuccess ? 'border-green-500' : 'border-red-500'}`}>
                <h3 className="text-xl font-semibold text-gray-300">Investigation Verdict</h3>
                {isSuccess ? (
                    <h2 className="text-4xl font-bold text-green-400 mt-2 animate-pulse">MISSION SUCCESS</h2>
                ) : (
                    <h2 className="text-4xl font-bold text-red-400 mt-2">MISSION FAILED</h2>
                )}
                <p className="mt-3 text-gray-400">
                    {isSuccess 
                        ? "Your study design was robust enough to accurately measure the effect of VibeBoost. Your estimate is within the 10% margin of error required for a conclusive result."
                        : "Your study's estimate was too far from the ground truth. This level of error means the results are unreliable for making a public health decision. Consider how sample size, bias, or confounding may have impacted your result."
                    }
                </p>
            </div>
            
            <div className="p-6 bg-slate-800 rounded-lg border border-slate-700">
                <h3 className="text-xl font-semibold text-teal-300">Debriefing</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <p className="text-gray-300">
                        Your study found an effect of <br/>
                        <span className="font-bold text-teal-300 text-3xl">{formatNumber(estimatedEffect)}</span>
                    </p>
                    <p className="text-gray-300">
                        The Ground Truth was <br/>
                        <span className="font-bold text-white text-3xl">{formatNumber(trueEffect)}</span>
                    </p>
                </div>
                <p className="mt-4 text-lg font-semibold">
                    This means your estimate was off by: <span className={`font-bold text-2xl ${Math.abs(bias) > SUCCESS_THRESHOLD ? 'text-red-400' : 'text-green-400'}`}>{formatPercent(bias)}</span>
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {measures.filter(m => m.show && m.value > 0).map(m => (
                    <div key={m.label} className="bg-slate-800 p-4 rounded-lg shadow-md border border-slate-700">
                        <h4 className="font-semibold text-gray-400">{m.label}</h4>
                        <p className="text-3xl font-bold text-white">{formatNumber(m.value)}</p>
                        <p className="text-sm text-gray-500">95% CI: [{formatNumber(m.ci[0])}, {formatNumber(m.ci[1])}]</p>
                    </div>
                ))}
            </div>
        </div>
    );
};


export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, isLoading, error, studyType, trueEffectRR }) => {
  const [activeTab, setActiveTab] = useState('Summary');
  const isMonteCarlo = !!results?.monteCarlo;
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-slate-800 rounded-xl shadow-2xl border border-slate-700">
        <div className="text-center">
            <svg className="animate-spin h-12 w-12 text-magenta-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4 text-lg font-semibold text-gray-300">Collecting data... analyzing samples...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
     return (
        <div className="p-6 bg-red-900/50 border-l-4 border-red-500 rounded-r-lg shadow-lg">
            <h3 className="text-xl font-semibold text-red-300">Investigation Failed</h3>
            <p className="mt-2 text-red-400">{error}</p>
            <p className="mt-2 text-sm text-red-500">Your study design was unable to produce a valid result. Please adjust your parameters and try again.</p>
        </div>
    );
  }

  if (!results) {
    return (
      <div className="flex items-center justify-center h-96 bg-slate-800 rounded-xl shadow-2xl border border-slate-700">
        <div className="text-center p-8 max-w-2xl mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-teal-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            <h2 className="text-3xl font-bold text-white">Your Mission Briefing</h2>
            <p className="mt-4 text-lg text-gray-300 leading-relaxed">
              Welcome, Lead Investigator. The Public Health Dept. requires a definitive answer on the VibeBoost case. Our intel suggests the true <span className="font-bold text-white">Relative Risk (RR) is <span className="text-3xl text-teal-300">{trueEffectRR}</span></span>.
            </p>
            <div className="mt-6 p-4 bg-amber-900/40 border border-amber-500 rounded-lg">
                <h3 className="text-xl font-bold text-amber-300">Primary Objective</h3>
                <p className="mt-2 text-amber-200">
                    Design and run a study that estimates the VibeBoost RR with less than <span className="font-bold">10% error</span>. Success is crucial—a flawed study could lead to public panic or, worse, inaction.
                </p>
            </div>
            <p className="mt-6 text-gray-400">
              Use the <span className="font-semibold text-gray-200">Investigation Guide</span> to make your design choices. Good luck.
            </p>
        </div>
      </div>
    );
  }
  
  const tabNames = ['Summary', '2x2 Table', 'Forest Plot', 'DAG'];
  if(isMonteCarlo) tabNames.splice(3, 0, 'Monte Carlo');


  return (
    <div className="bg-slate-800/50 p-6 rounded-xl shadow-2xl border border-slate-700">
      <Tabs tabs={tabNames} activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="mt-6">
        {activeTab === 'Summary' && <Summary results={results} />}
        {activeTab === '2x2 Table' && <TwoByTwoTable data={results.singleRun.twoByTwoTable} />}
        {activeTab === 'Forest Plot' && <ForestPlot results={results} />}
        {activeTab === 'DAG' && <DAG studyType={studyType} />}
        {activeTab === 'Monte Carlo' && isMonteCarlo && <MonteCarloPlot results={results} />}
      </div>
    </div>
  );
};