
import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Budget } from '../types';

interface BudgetChartProps {
    budget: Budget;
}

const COLORS = ['#10b981', '#3b82f6', '#ef4444', '#f97316', '#8b5cf6', '#ec4899'];

export const BudgetChart: React.FC<BudgetChartProps> = ({ budget }) => {
    const data = Object.entries(budget.currentMonthSpending.spent).map(([name, value]) => ({
        name,
        value,
    }));

    if (data.length === 0) {
        return <div className="flex items-center justify-center h-full text-gray-500">Нет данных о расходах</div>;
    }

    return (
        <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
