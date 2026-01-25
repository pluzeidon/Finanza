import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface SpendingChartProps {
    data: {
        categoryName: string;
        amount: number;
        color: string;
        percentage: number;
    }[];
}

export function SpendingChart({ data }: SpendingChartProps) {
    const chartData = useMemo(() => {
        return data.filter(d => d.amount > 0);
    }, [data]);

    if (chartData.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center text-slate-400">
                Sin gastos en este periodo.
            </div>
        );
    }

    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="amount"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value: any) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value))}
                    />
                    <Legend
                        layout="vertical"
                        align="right"
                        verticalAlign="middle"
                        iconType="circle"
                        formatter={(value, _entry: any) => {
                            // entry.payload is internal recharts
                            // we just display the value (category name)
                            return <span className="text-xs text-slate-600">{value}</span>;
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
