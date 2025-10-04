import React from 'react';
import type { StudyType } from '../types';

interface DAGProps {
  studyType: StudyType;
}

export const DAG: React.FC<DAGProps> = ({ studyType }) => {
  const isRCT = studyType === 'RCT';

  return (
    <div>
        <h3 className="text-lg font-medium leading-6 text-gray-200 mb-4">Causal Structure (DAG)</h3>
        <div className="flex justify-center items-center p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <svg width="400" height="200" viewBox="0 0 400 200">
                {/* Nodes */}
                <g>
                    <circle cx="200" cy="50" r="25" fill="#1e293b" stroke="#f97316" strokeWidth="2" />
                    <text x="200" y="55" textAnchor="middle" fill="#fb923c" fontWeight="bold">C</text>
                    <text x="200" y="85" textAnchor="middle" fill="#9ca3af" fontSize="12">Coffee</text>
                </g>
                <g>
                    <circle cx="50" cy="150" r="25" fill="#1e293b" stroke="#2dd4bf" strokeWidth="2" />
                    <text x="50" y="155" textAnchor="middle" fill="#5eead4" fontWeight="bold">E</text>
                    <text x="50" y="185" textAnchor="middle" fill="#9ca3af" fontSize="12">VibeBoost</text>
                </g>
                 <g>
                    <circle cx="350" cy="150" r="25" fill="#1e293b" stroke="#f43f5e" strokeWidth="2" />
                    <text x="350" y="155" textAnchor="middle" fill="#fb7185" fontWeight="bold">O</text>
                    <text x="350" y="185" textAnchor="middle" fill="#9ca3af" fontSize="12">RHR</text>
                </g>
                
                {/* Arrow Definitions */}
                <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#9ca3af" />
                    </marker>
                     <marker id="arrowhead-confounder" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill={isRCT ? "#475569" : "#f97316"} />
                    </marker>
                </defs>
                
                {/* Arrows */}
                {/* C -> E */}
                <line x1="180" y1="70" x2="75" y2="140" stroke={isRCT ? "#475569" : "#f97316"} strokeWidth="3" markerEnd="url(#arrowhead-confounder)" />
                {isRCT && <line x1="120" y1="95" x2="140" y2="115" stroke="#be123c" strokeWidth="4" />}
                {isRCT && <line x1="140" y1="95" x2="120" y2="115" stroke="#be123c" strokeWidth="4" />}


                {/* C -> O */}
                <line x1="220" y1="70" x2="325" y2="140" stroke="#f97316" strokeWidth="3" markerEnd="url(#arrowhead-confounder)" />

                {/* E -> O (Causal Path) */}
                <line x1="75" y1="150" x2="325" y2="150" stroke="#9ca3af" strokeWidth="2" markerEnd="url(#arrowhead)" />

            </svg>
        </div>
        <div className="mt-4 text-center text-sm text-gray-400 max-w-md mx-auto">
            <span className="font-semibold text-gray-200">Key:</span> The orange lines are <span className="font-semibold text-orange-400">confounding paths</span>, while the gray line is the direct <span className="font-semibold text-gray-300">causal effect</span> of VibeBoost on RHR.
             <p className="mt-2">
                {isRCT 
                ? "In an RCT, randomization breaks the link between Coffee drinking (C) and VibeBoost (E). This path is now blocked, removing the confounding." 
                : "In observational studies, people who drink Coffee (C) might also be more likely to drink VibeBoost (E), creating a 'backdoor path' that biases your results."}
            </p>
        </div>
    </div>
  );
};