
import React from 'react';

const MoneyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v-1m0-1V4m0 2.01V5M12 20v-1m0-1v-1m0-1v-.01M12 16v-1m0-1v-1m0 3v1m0 1v1M4 12H3m1 0h.01M6 12H5m1 0h.01M20 12h-1m1 0h.01M18 12h-1m1 0h.01M12 8a4 4 0 100 8 4 4 0 000-8z" />
    </svg>
);

export const Header: React.FC = () => {
    return (
        <header className="bg-gray-800/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-3">
                        <MoneyIcon className="text-emerald-400 h-8 w-8"/>
                        <h1 className="text-xl font-bold text-white tracking-tight">Financial Secretary AI</h1>
                    </div>
                </div>
            </div>
        </header>
    );
};
