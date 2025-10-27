
import React from 'react';

interface SummaryCardProps {
    title: string;
    value: string;
    isNegative?: boolean;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, isNegative = false }) => {
    return (
        <div className="bg-gray-800/50 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-1">{title}</p>
            <p className={`text-2xl font-bold ${isNegative ? 'text-red-400' : 'text-white'}`}>{value}</p>
        </div>
    );
};
