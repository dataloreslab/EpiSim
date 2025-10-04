import React, { useState } from 'react';
import type { StudyParameters, StudyType } from '../types';
import { Slider } from './Slider';
import { Button } from './Button';

interface ControlPanelProps {
  parameters: StudyParameters;
  setParameters: React.Dispatch<React.SetStateAction<StudyParameters>>;
  onSimulate: () => void;
  isLoading: boolean;
}

const SectionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h3 className="text-xl font-semibold text-teal-300 border-b-2 border-slate-600 pt-4 pb-2 mb-4">{children}</h3>
);

const StepIndicator: React.FC<{ current: number, total: number }> = ({ current, total }) => (
    <div className="flex justify-center space-x-2 mb-4">
        {Array.from({ length: total }, (_, i) => (
            <div key={i} className={`w-1/4 h-2 rounded-full ${i < current ? 'bg-magenta-500' : 'bg-slate-600'}`}></div>
        ))}
    </div>
);

const PopulationIntel: React.FC<{ parameters: StudyParameters }> = ({ parameters }) => (
    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 space-y-3">
        <h4 className="text-lg font-bold text-amber-300">Population Intel</h4>
        <p className="text-sm text-gray-400">This is the background information your team has already gathered. These are facts about the world, not part of your study design.</p>
        <div className="flex justify-between text-sm"><span className="text-gray-300">VibeBoost Prevalence:</span> <span className="font-bold text-white">{(parameters.exposurePrevalence * 100).toFixed(0)}%</span></div>
        <div className="flex justify-between text-sm"><span className="text-gray-300">Baseline RHR Risk:</span> <span className="font-bold text-white">{(parameters.outcomePrevalenceUnexposed * 100).toFixed(0)}%</span></div>
        <div className="flex justify-between text-sm"><span className="text-gray-300">Coffee Drinker Prevalence:</span> <span className="font-bold text-white">{(parameters.confounderPrevalence * 100).toFixed(0)}%</span></div>
    </div>
);


export const ControlPanel: React.FC<ControlPanelProps> = ({ parameters, setParameters, onSimulate, isLoading }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  
  const handleParamChange = <K extends keyof StudyParameters,>(param: K, value: StudyParameters[K]) => {
    setParameters(prev => ({ ...prev, [param]: value }));
  };

  const nextStep = () => setStep(s => Math.min(s + 1, totalSteps + 1));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const isMonteCarlo = parameters.monteCarloRuns > 1;

  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-2xl space-y-6 sticky top-8 border border-slate-700">
      <h2 className="text-2xl font-bold text-white border-b-2 border-slate-600 pb-3">Investigation Guide</h2>
      <StepIndicator current={step} total={totalSteps} />
      
      {step === 1 && (
        <div className="animate-fade-in">
          <SectionHeader>Step 1: The Approach</SectionHeader>
          <p className="text-sm text-gray-400 mb-3">How will you conduct your investigation? Each method has different strengths and weaknesses.</p>
          <select
            value={parameters.studyType}
            onChange={(e) => handleParamChange('studyType', e.target.value as StudyType)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-slate-700 border-slate-600 text-white focus:outline-none focus:ring-magenta-500 focus:border-magenta-500 sm:text-sm rounded-md"
          >
            <option value="Cohort">Cohort Study</option>
            <option value="Case-Control">Case-Control Study</option>
            <option value="RCT">Randomized Trial (RCT)</option>
          </select>
          <div className="text-xs text-slate-500 mt-2 p-2 bg-slate-900/50 rounded">
            {parameters.studyType === 'Cohort' && 'Follow a group forward in time to see who develops RHR. Good for calculating true risk, but can be slow and expensive.'}
            {parameters.studyType === 'Case-Control' && 'Start with people who have RHR (cases) and those who don\'t (controls), then look back to see who drank VibeBoost. Fast and cheap, but vulnerable to bias.'}
            {parameters.studyType === 'RCT' && 'The "gold standard." Randomly assign people to drink VibeBoost or a placebo. Eliminates confounding, but may be unethical or impractical.'}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="animate-fade-in">
          <SectionHeader>Step 2: Resources & Scale</SectionHeader>
           <p className="text-sm text-gray-400 mb-3">How big is your study? This is a key budgetary decision. Larger samples give you more statistical power but cost more.</p>
          <Slider label="Sample Size" min={100} max={5000} step={100} value={parameters.sampleSize} onChange={(v) => handleParamChange('sampleSize', v)} tooltip="How many people can you afford to enroll in your study?"/>
        </div>
      )}

      {step === 3 && (
        <div className="animate-fade-in">
          <SectionHeader>Step 3: Anticipate Errors</SectionHeader>
           <p className="text-sm text-gray-400 mb-3">Real-world data is messy. People forget what they drank, and medical records can be wrong. How much error do you expect in your data collection?</p>
          <Slider label="VibeBoost Misclassification" min={0} max={0.5} step={0.01} value={parameters.exposureMisclassification} onChange={(v) => handleParamChange('exposureMisclassification', v)} format="percent" tooltip="How often do your study records get it wrong? E.g., a participant says they don't drink VibeBoost but they actually do. This 'information bias' can weaken the observed effect."/>
          <Slider label="RHR Misclassification" min={0} max={0.5} step={0.01} value={parameters.outcomeMisclassification} onChange={(v) => handleParamChange('outcomeMisclassification', v)} format="percent" tooltip="How often is RHR misdiagnosed or misreported in your data? This can also obscure the true relationship."/>
        </div>
      )}
      
      {step === 4 && (
        <div className="animate-fade-in">
            <SectionHeader>Step 4: The Coffee Problem</SectionHeader>
            <p className="text-sm text-gray-400 mb-3">What if coffee drinkers, who are already at higher risk for RHR, are also more likely to drink VibeBoost? We need to account for this confounding factor.</p>
            <Slider label="Coffee-RHR RR" min={1} max={5} step={0.1} value={parameters.confounderEffectRR} onChange={(v) => handleParamChange('confounderEffectRR', v)} disabled={parameters.studyType === 'RCT'} tooltip="How much does coffee drinking increase the risk of RHR on its own? This is the strength of the confounder."/>
            <Slider label="Coffee-VibeBoost Corr." min={0} max={0.8} step={0.05} value={parameters.confounderExposureCorr} onChange={(v) => handleParamChange('confounderExposureCorr', v)} disabled={parameters.studyType === 'RCT'} tooltip="How strongly are coffee drinking and VibeBoost drinking linked? If coffee drinkers are much more likely to also drink VibeBoost, it's very hard to separate their effects."/>
        </div>
      )}

      {step > 1 && <div className="pt-4"><PopulationIntel parameters={parameters} /></div>}

      <div className="flex items-center pt-4 space-x-2">
        {step > 1 && <Button onClick={prevStep} disabled={isLoading} className="bg-slate-600 hover:bg-slate-700">Back</Button>}
        {step <= totalSteps && <Button onClick={nextStep} disabled={isLoading} fullWidth>{step === totalSteps ? 'Proceed to Final Review' : 'Next Step'}</Button>}
        {step > totalSteps && (
            <Button onClick={onSimulate} disabled={isLoading} fullWidth>
                {isLoading ? 'Analyzing Data...' : `Launch Investigation`}
            </Button>
        )}
      </div>
    </div>
  );
};