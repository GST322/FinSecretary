
import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Account, AccountType } from '../types';

interface PortfolioChartProps {
    accounts: Account[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
const ACCOUNT_TYPE_COLORS: Record<AccountType, string> = {
    [AccountType.SAVINGS]: '#3b82f6',
    [AccountType.BROKERAGE]: '#10b981',
    [AccountType.METALS]: '#f59e0b',
    [AccountType.CASH]: '#ef4444',
};


export const PortfolioChart: React.FC<PortfolioChartProps> = ({ accounts }) => {
    const data = accounts
        .filter(acc => acc.currency === 'RUB') // Only show RUB accounts for simplicity
        .map(acc => ({
            name: acc.name,
            value: acc.balance,
            type: acc.type
        }));

     if (data.length === 0) {
        return <div className="flex items-center justify-center h-full text-gray-500">Нет данных о портфеле</div>;
    }

    return (
        <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        nameKey="name"
                    >
                        {data.map((entry) => (
                            <Cell key={`cell-${entry.name}`} fill={ACCOUNT_TYPE_COLORS[entry.type] || '#8884d8'} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#374151',
                            border: '1px solid #4b5563',
                            borderRadius: '0.5rem',
                        }}
                        itemStyle={{ color: '#d1d5db' }}
                        formatter={(value: number) => `${value.toLocaleString('ru-RU')} ₽`}
                    />
                    <Legend iconSize={10} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};
