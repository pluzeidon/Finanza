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
            <div className="h-64 flex flex-col items-center justify-center text-slate-500">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-3">
                    <span className="text-2xl grayscale">📉</span>
                </div>
                <p className="text-sm font-medium">Sin gastos registrados</p>
            </div>
        );
    }

    return (
        <div className="h-64 w-full relative">
            {/* Center Text */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total</p>
                </div>
            </div>

            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="amount"
                        stroke="none"
                    >
                        {chartData.map((_, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={chartData[index].color}
                                stroke="rgba(0,0,0,0.2)"
                                strokeWidth={0} // Removed border for cleaner look, or use dark border
                                className="hover:opacity-80 transition-opacity"
                            />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(16, 28, 34, 0.9)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                        }}
                        itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                        formatter={(value: any) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'USD' }).format(Number(value))}
                    />
                    <Legend
                        layout="vertical"
                        align="right"
                        verticalAlign="middle"
                        iconType="circle"
                        formatter={(value) => {
                            return <span className="text-xs text-slate-300 font-medium ml-1">{value}</span>;
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
