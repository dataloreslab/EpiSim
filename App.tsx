import React, { useState, useCallback } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { ResultsDisplay } from './components/ResultsDisplay';
import { Header } from './components/Header';
import type { StudyParameters, SimulationResult, StudyType } from './types';
import { runSimulation } from './services/simulationService';

const App: React.FC = () => {
  const [parameters, setParameters] = useState<StudyParameters>({
    studyType: 'Cohort',
    populationSize: 10000,
    sampleSize: 1000,
    exposurePrevalence: 0.3,
    outcomePrevalenceUnexposed: 0.05,
    trueEffectRR: 2.5, // The "ground truth" the student must uncover
    confounderPrevalence: 0.2,
    confounderEffectRR: 1.5,
    confounderExposureCorr: 0.4,
    exposureMisclassification: 0.05,
    outcomeMisclassification: 0.05,
    monteCarloRuns: 1,
  });

  const [results, setResults] = useState<SimulationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSimulate = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setResults(null);
    // Use setTimeout to allow the UI to update to the loading state before the heavy computation starts
    setTimeout(() => {
        try {
            const simulationResult = runSimulation(parameters);
            setResults(simulationResult);
        } catch (e) {
            if (e instanceof Error) {
                setError(e.message);
            } else {
                setError("An unknown error occurred during simulation.");
            }
        } finally {
            setIsLoading(false);
        }
    }, 50);
  }, [parameters]);

  return (
    <div className="min-h-screen bg-slate-900 text-gray-200 font-sans flex flex-col">
      <Header />
      <main className="container mx-auto p-4 lg:p-8 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <div className="lg:col-span-1 xl:col-span-1">
            <ControlPanel 
              parameters={parameters} 
              setParameters={setParameters} 
              onSimulate={handleSimulate} 
              isLoading={isLoading}
            />
          </div>
          <div className="lg:col-span-2 xl:col-span-3">
            <ResultsDisplay 
              results={results}
              isLoading={isLoading}
              error={error}
              studyType={parameters.studyType}
              trueEffectRR={parameters.trueEffectRR}
            />
          </div>
        </div>
      </main>
      <footer className="text-center p-4 text-slate-500 text-sm">
        &copy; Design and built by Andrew Kingston PhD CStat SFHEA
      </footer>
    </div>
  );
};

export default App;