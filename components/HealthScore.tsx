import React from 'react';

interface HealthScoreProps {
    scoreData: {
        score: number;
        summary: string;
    } | null;
}

const HealthScoreGauge: React.FC<{ score: number }> = ({ score }) => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    // Ensure score is within 0-100 range for calculation
    const clampedScore = Math.max(0, Math.min(100, score));
    const offset = circumference - (clampedScore / 100) * circumference;

    const getColor = (s: number) => {
        if (s < 40) return 'text-red-400';
        if (s < 75) return 'text-yellow-400';
        return 'text-emerald-400';
    };

    const colorClass = getColor(clampedScore);

    return (
        <div className="relative w-36 h-36">
            <svg className="w-full h-full" viewBox="0 0 120 120">
                <circle
                    className="text-gray-700"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="60"
                    cy="60"
                />
                <circle
                    className={`transform -rotate-90 origin-center transition-all duration-1000 ease-out ${colorClass}`}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="60"
                    cy="60"
                />
            </svg>
            <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
                <span className={`text-4xl font-bold ${colorClass}`}>{clampedScore}</span>
                <span className="text-xs text-gray-400">/ 100</span>
            </div>
        </div>
    );
};


export const HealthScore: React.FC<HealthScoreProps> = ({ scoreData }) => {
    if (!scoreData) {
        return (
            <div className="bg-gray-800/50 rounded-lg p-4 sm:p-6 flex items-center justify-center min-h-[160px]">
                <p className="text-gray-500">Рейтинг финансового здоровья рассчитывается...</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-800/50 rounded-lg p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-white mb-4 text-center sm:text-left">Рейтинг Финансового Здоровья</h3>
            <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="flex-shrink-0">
                   <HealthScoreGauge score={scoreData.score} />
                </div>
                <div>
                     <p className="text-gray-300">{scoreData.summary}</p>
                </div>
            </div>
        </div>
    );
};
