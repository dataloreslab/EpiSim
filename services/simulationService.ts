import type { StudyParameters, Individual, SimulationResult, AnalysisResults, StudyType } from '../types';

// Helper to calculate ln(x)
const ln = (x: number): number => Math.log(x);

// Helper to calculate confidence intervals for OR and RR
const calculateCI = (estimate: number, a: number, b: number, c: number, d: number, isOR: boolean): [number, number] => {
    if (a === 0 || b === 0 || c === 0 || d === 0) return [NaN, NaN];
    const logEstimate = ln(estimate);
    const se_log_estimate = isOR
        ? Math.sqrt(1/a + 1/b + 1/c + 1/d)
        : Math.sqrt((1/a - 1/(a+b)) + (1/c - 1/(c+d)));

    const lower = Math.exp(logEstimate - 1.96 * se_log_estimate);
    const upper = Math.exp(logEstimate + 1.96 * se_log_estimate);
    return [lower, upper];
};

const analyzeData = (sample: Individual[], studyType: StudyType): AnalysisResults => {
    const table = { exposedCases: 0, exposedNonCases: 0, unexposedCases: 0, unexposedNonCases: 0 };
    const strata = {
        c1: { exposedCases: 0, exposedNonCases: 0, unexposedCases: 0, unexposedNonCases: 0 },
        c0: { exposedCases: 0, exposedNonCases: 0, unexposedCases: 0, unexposedNonCases: 0 }
    };

    for (const p of sample) {
        if (p.obsExposure === 1 && p.obsOutcome === 1) table.exposedCases++;
        else if (p.obsExposure === 1 && p.obsOutcome === 0) table.exposedNonCases++;
        else if (p.obsExposure === 0 && p.obsOutcome === 1) table.unexposedCases++;
        else if (p.obsExposure === 0 && p.obsOutcome === 0) table.unexposedNonCases++;

        const stratum = p.trueConfounder === 1 ? strata.c1 : strata.c0;
        if (p.obsExposure === 1 && p.obsOutcome === 1) stratum.exposedCases++;
        else if (p.obsExposure === 1 && p.obsOutcome === 0) stratum.exposedNonCases++;
        else if (p.obsExposure === 0 && p.obsOutcome === 1) stratum.unexposedCases++;
        else if (p.obsExposure === 0 && p.obsOutcome === 0) stratum.unexposedNonCases++;
    }

    const { exposedCases: a, exposedNonCases: b, unexposedCases: c, unexposedNonCases: d } = table;
    const crudeOR = (a * d) / (b * c);
    const crudeRR = studyType !== 'Case-Control' ? (a / (a + b)) / (c / (c + d)) : NaN;
    
    const crudeOR_CI = calculateCI(crudeOR, a, b, c, d, true);
    // FIX: The ternary operator caused `crudeRR_CI` to be inferred as `number[]` instead of `[number, number]`.
    // Explicitly typing it as a tuple `[number, number]` resolves the type mismatch with the `AnalysisResults` interface.
    const crudeRR_CI: [number, number] = studyType !== 'Case-Control' ? calculateCI(crudeRR, a, b, c, d, false) : [NaN, NaN];

    // Mantel-Haenszel Odds Ratio
    let mh_num = 0;
    let mh_den = 0;
    for (const stratum of [strata.c0, strata.c1]) {
        const { exposedCases: ai, exposedNonCases: bi, unexposedCases: ci, unexposedNonCases: di } = stratum;
        const ni = ai + bi + ci + di;
        if (ni > 0) {
            mh_num += (ai * di) / ni;
            mh_den += (bi * ci) / ni;
        }
    }
    const adjustedOR = mh_num / mh_den;

    // FIX: Explicitly typed `adjustedOR_CI` as a `[number, number]` tuple.
    // Without this annotation, TypeScript infers its type as `number[]`, which is
    // not assignable to the tuple type required by the `AnalysisResults` interface.
    let adjustedOR_CI: [number, number] = [NaN, NaN];
    if (a > 0 && b > 0 && c > 0 && d > 0 && isFinite(adjustedOR) && adjustedOR > 0) {
        const adj_se = Math.sqrt(1/a + 1/b + 1/c + 1/d) * 1.1; // Fudge factor to approximate
        adjustedOR_CI = [Math.exp(ln(adjustedOR) - 1.96 * adj_se), Math.exp(ln(adjustedOR) + 1.96 * adj_se)];
    }

    return {
        crudeOR: isFinite(crudeOR) ? crudeOR : 0,
        crudeOR_CI,
        crudeRR: isFinite(crudeRR) ? crudeRR : 0,
        crudeRR_CI,
        adjustedOR: isFinite(adjustedOR) ? adjustedOR : 0,
        adjustedOR_CI,
        twoByTwoTable: table
    };
};


const generatePopulation = (params: StudyParameters): Individual[] => {
    const population: Individual[] = [];
    
    const p_c = params.confounderPrevalence;
    const p_e_given_not_c = params.exposurePrevalence - params.confounderPrevalence * params.confounderExposureCorr;
    const p_e_given_c = p_e_given_not_c + params.confounderExposureCorr;

    if (p_e_given_c < 0 || p_e_given_c > 1 || p_e_given_not_c < 0 || p_e_given_not_c > 1) {
        throw new Error("Invalid parameter combination for exposure-confounder correlation. Try reducing the correlation or adjusting prevalences.");
    }
    
    for (let i = 0; i < params.populationSize; i++) {
        const trueConfounder = Math.random() < p_c ? 1 : 0;
        
        let trueExposure: 0 | 1;
        if (params.studyType === 'RCT') {
            trueExposure = Math.random() < 0.5 ? 1 : 0; // Randomization
        } else {
            const p_e = trueConfounder === 1 ? p_e_given_c : p_e_given_not_c;
            trueExposure = Math.random() < p_e ? 1 : 0;
        }

        const baseline_risk = params.outcomePrevalenceUnexposed;
        let risk = baseline_risk;
        if (trueExposure === 1) risk *= params.trueEffectRR;
        if (trueConfounder === 1) risk *= params.confounderEffectRR;

        const trueOutcome = Math.random() < risk ? 1 : 0;
        
        // FIX (line 113): The expression `1 - trueExposure` is inferred as type `number`, which is not assignable to `0 | 1`.
        // Using a ternary operator ensures the type is correctly inferred as `0 | 1`.
        const obsExposure: 0 | 1 = Math.random() < params.exposureMisclassification ? (trueExposure === 1 ? 0 : 1) : trueExposure;
        // FIX (line 114): The expression `1 - trueOutcome` is inferred as type `number`, which is not assignable to `0 | 1`.
        // Using a ternary operator ensures the type is correctly inferred as `0 | 1`.
        const obsOutcome: 0 | 1 = Math.random() < params.outcomeMisclassification ? (trueOutcome === 1 ? 0 : 1) : trueOutcome;
        
        population.push({ id: i, trueConfounder, trueExposure, trueOutcome, obsExposure, obsOutcome });
    }
    return population;
};

const sampleFromPopulation = (population: Individual[], params: StudyParameters): Individual[] => {
    switch (params.studyType) {
        case 'Cohort':
        case 'RCT': {
            const shuffled = population.sort(() => 0.5 - Math.random());
            return shuffled.slice(0, params.sampleSize);
        }
        case 'Case-Control': {
            const cases = population.filter(p => p.obsOutcome === 1);
            const controls = population.filter(p => p.obsOutcome === 0);
            
            const numCasesToSample = Math.min(cases.length, Math.floor(params.sampleSize / 2));
            const numControlsToSample = Math.min(controls.length, params.sampleSize - numCasesToSample);

            if(numCasesToSample === 0) throw new Error("No cases generated in the population. Try increasing population size or outcome prevalence.");

            const sampledCases = cases.sort(() => 0.5 - Math.random()).slice(0, numCasesToSample);
            const sampledControls = controls.sort(() => 0.5 - Math.random()).slice(0, numControlsToSample);
            
            return [...sampledCases, ...sampledControls];
        }
    }
};

export const runSimulation = (params: StudyParameters): SimulationResult => {
    const isMonteCarlo = params.monteCarloRuns > 1;
    const results: SimulationResult = {
        parameters: params,
        singleRun: null!,
        monteCarlo: isMonteCarlo ? { estimatedORs: [], estimatedRRs: [] } : undefined,
    };

    for (let i = 0; i < params.monteCarloRuns; i++) {
        const population = generatePopulation(params);
        const sample = sampleFromPopulation(population, params);
        if (sample.length === 0) {
            throw new Error("Sample size is zero. This might be due to no cases or controls being generated in a case-control study design. Please adjust parameters.");
        }
        const analysis = analyzeData(sample, params.studyType);

        if (i === 0) {
            results.singleRun = analysis;
        }
        if (isMonteCarlo && results.monteCarlo) {
            results.monteCarlo.estimatedORs.push(analysis.adjustedOR || analysis.crudeOR);
            results.monteCarlo.estimatedRRs.push(analysis.crudeRR);
        }
    }
    
    return results;
};