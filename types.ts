
export type StudyType = 'Cohort' | 'Case-Control' | 'RCT';

export interface StudyParameters {
  studyType: StudyType;
  populationSize: number;
  sampleSize: number;
  exposurePrevalence: number;
  outcomePrevalenceUnexposed: number;
  trueEffectRR: number;
  confounderPrevalence: number;
  confounderEffectRR: number;
  confounderExposureCorr: number; // Correlation between 0 and 1
  exposureMisclassification: number;
  outcomeMisclassification: number;
  monteCarloRuns: number;
}

export interface Individual {
  id: number;
  trueConfounder: 0 | 1;
  trueExposure: 0 | 1;
  trueOutcome: 0 | 1;
  obsExposure: 0 | 1;
  obsOutcome: 0 | 1;
}

export interface AnalysisResults {
  crudeOR: number;
  crudeOR_CI: [number, number];
  crudeRR: number;
  crudeRR_CI: [number, number];
  adjustedOR: number;
  adjustedOR_CI: [number, number];
  twoByTwoTable: {
    exposedCases: number;
    exposedNonCases: number;
    unexposedCases: number;
    unexposedNonCases: number;
  };
}

export interface SimulationResult {
  parameters: StudyParameters;
  singleRun: AnalysisResults;
  monteCarlo?: {
    estimatedORs: number[];
    estimatedRRs: number[];
  };
}
