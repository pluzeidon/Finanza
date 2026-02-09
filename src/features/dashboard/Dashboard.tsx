import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { AccountRepository } from "../../lib/repositories";
import { FinanceEngine } from "../../lib/finance";
import { Dialog } from "../../components/ui/dialog";
import { TransactionForm } from "../transactions/TransactionForm";
import { RecentTransactions } from "../transactions/RecentTransactions";
import { db } from "../../lib/db";
import { Bell, CreditCard, Grid, Plus, ArrowRightLeft, ScanLine, TrendingUp, Mic } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { useVoiceTransaction } from "../../lib/hooks/useVoiceTransaction";

export function Dashboard() {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<any | null>(null);
    const { isListening, result, startListening, stopListening, reset } = useVoiceTransaction();

    // Auto-open modal when voice result is ready
    if (result && !isAddOpen) {
        setEditingTransaction({
            amount: result.amount || 0,
            type: result.type || 'EXPENSE',
            categoryId: result.categoryId || '',
            accountId: result.accountId || '',
            note: result.note || '', // Use parsed note
            date: new Date().toISOString()
        });
        setIsAddOpen(true);
        reset(); // Clear result so it doesn't loop
    }

    const handleCreate = () => {
        setEditingTransaction(null);
        setIsAddOpen(true);
    };

    const handleEdit = (tx: any) => {
        setEditingTransaction(tx);
        setIsAddOpen(true);
    };

    const stats = useLiveQuery(async () => {
        const accounts = await AccountRepository.getActive();
        const transactions = await db.transactions.toArray();

        // Net Worth
        const netWorth = FinanceEngine.calculateNetWorth(accounts, transactions);

        // Current Month Cash Flow
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const cashFlow = FinanceEngine.getCashFlow(transactions, start, end);

        return { netWorth, cashFlow };
    }, []);

    // Mock Data for "Weekly Spending" Chart
    const chartData = [
        { day: 'Mon', amount: 45 },
        { day: 'Tue', amount: 35 },
        { day: 'Wed', amount: 80 },
        { day: 'Thu', amount: 50 },
        { day: 'Fri', amount: 90 },
        { day: 'Sat', amount: 20 },
        { day: 'Sun', amount: 40 },
    ];

    return (
        <div className="pb-24 pt-6 px-0 md:px-0 bg-background-dark min-h-screen text-white relative overflow-x-hidden transition-colors duration-500">
            {/* Ambient Background Glows */}
            <div className="fixed top-[-15%] left-[-15%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
            <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none z-0"></div>

            <div className="relative z-10 space-y-8 px-6">

                {/* Header */}
                <header className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="size-11 rounded-full overflow-hidden border border-white/10 ring-2 ring-white/5 relative bg-[#223c49]">
                            {/* Placeholder Avatar */}
                            <div className="w-full h-full bg-slate-700 flex items-center justify-center text-xs">U</div>
                        </div>
                        <div className="flex flex-col">
                            <p className="text-[11px] text-slate-400 font-semibold tracking-wider uppercase">Hola</p>
                            <h2 className="text-white text-lg font-bold leading-tight">Usuario</h2>
                        </div>
                    </div>
                    <button className="relative flex items-center justify-center size-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
                        <Bell className="text-white/80 group-hover:text-white transition-colors" size={20} />
                        <span className="absolute top-2.5 right-3 size-2 bg-primary rounded-full shadow-[0_0_8px_#0da6f2] border border-[#101c22]"></span>
                    </button>
                </header>

                {/* Hero: Total Balance */}
                <section>
                    <div className="glass-panel p-6 rounded-2xl relative overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
                        {/* Inner glow */}
                        <div className="absolute -right-12 -top-12 w-40 h-40 bg-primary/20 blur-[60px] rounded-full pointer-events-none"></div>

                        <div className="relative z-10 flex flex-col">
                            <div className="flex justify-between items-start mb-1">
                                <p className="text-slate-400 text-sm font-medium">Balance Total</p>
                                <div className="flex items-center gap-1 bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20 backdrop-blur-md">
                                    <TrendingUp size={14} className="text-green-500" />
                                    <span className="text-green-500 text-xs font-bold">+2.4%</span>
                                </div>
                            </div>
                            <h1 className="text-[40px] font-extrabold text-white tracking-tight leading-none mt-2 drop-shadow-[0_0_20px_rgba(13,223,242,0.4)]">
                                {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(stats?.netWorth || 0)}
                                <span className="text-white/50 text-2xl font-medium">.00</span>
                            </h1>

                            {/* Monthly Limit Bar */}
                            <div className="mt-6 flex items-center gap-2">
                                <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full w-2/3 bg-primary rounded-full shadow-[0_0_10px_#0da6f2]"></div>
                                </div>
                                <p className="text-slate-500 text-[10px] font-medium whitespace-nowrap">Límite mensual</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Summary Cards: Income, Expense, Savings (Restored) */}
                <section className="grid grid-cols-3 gap-3">
                    {/* Income */}
                    <div className="glass-panel p-3 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors"></div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 z-10">Ingresos</p>
                        <p className="text-white font-bold text-sm z-10">
                            {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(stats?.cashFlow.income || 0)}
                        </p>
                        <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-blue-500/20 rounded-full blur-xl"></div>
                    </div>
                    {/* Expenses */}
                    <div className="glass-panel p-3 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-pink-500/5 group-hover:bg-pink-500/10 transition-colors"></div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 z-10">Gastos</p>
                        <p className="text-white font-bold text-sm z-10">
                            {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(stats?.cashFlow.expense || 0)}
                        </p>
                        <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-pink-500/20 rounded-full blur-xl"></div>
                    </div>
                    {/* Savings */}
                    <div className="glass-panel p-3 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors"></div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 z-10">Ahorro</p>
                        <p className="text-white font-bold text-sm z-10">
                            {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format((stats?.cashFlow.income || 0) - (stats?.cashFlow.expense || 0))}
                        </p>
                        <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-emerald-500/20 rounded-full blur-xl"></div>
                    </div>
                </section>

                {/* Quick Actions */}
                <section>
                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                        {[
                            { icon: ArrowRightLeft, label: "Transferir", color: "text-white" },
                            { icon: CreditCard, label: "Pagar", color: "text-white" },
                            { icon: Plus, label: "Ingresar", color: "text-primary", onClick: handleCreate },
                            { icon: Grid, label: "Más", color: "text-white" }
                        ].map((action, i) => (
                            <button
                                key={i}
                                onClick={action.onClick}
                                className="flex flex-col items-center gap-2 min-w-[76px] group"
                            >
                                <div className="size-[72px] rounded-[20px] bg-[#1a262d] border border-white/5 flex items-center justify-center group-active:scale-95 transition-all group-hover:bg-[#223038] group-hover:border-primary/40 group-hover:shadow-[0_0_15px_rgba(13,166,242,0.15)] relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <action.icon className={action.color} size={28} />
                                </div>
                                <span className="text-xs font-medium text-slate-300 group-hover:text-white">{action.label}</span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Chart Section */}
                <section>
                    <div className="flex items-end justify-between mb-5">
                        <div>
                            <h3 className="text-white text-lg font-bold tracking-tight">Gasto Semanal</h3>
                            <p className="text-slate-400 text-xs mt-1">Últimos 7 días</p>
                        </div>
                        <h3 className="text-white text-xl font-bold tracking-tight text-right">
                            {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(845.20)}
                        </h3>
                    </div>
                    <div className="glass-panel rounded-2xl p-5 border-t border-t-white/10 relative h-[180px]">
                        <div className="absolute right-4 top-4 flex gap-2">
                            <span className="size-2 rounded-full bg-purple-500 shadow-[0_0_8px_#d946ef]"></span>
                        </div>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#d946ef" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#d946ef" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#101c22', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                    labelStyle={{ display: 'none' }}
                                    cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="#d946ef"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorSpent)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </section>

                {/* Recent Activity */}
                <RecentTransactions onEdit={handleEdit} />

            </div>

            {/* Voice Transaction FAB */}
            <div className={`fixed bottom-40 right-6 md:right-[calc(50%-20px)] md:translate-x-[200px] z-40 transition-all duration-300 ${isListening ? 'scale-110' : 'hover:scale-105'}`}>
                <div className="relative group cursor-pointer" onClick={isListening ? stopListening : startListening}>
                    <div className={`absolute inset-0 rounded-full blur-md transition-all ${isListening ? 'bg-red-500/60 animate-ping' : 'bg-primary/40 group-hover:bg-primary/60'}`}></div>
                    <button className={`relative flex items-center justify-center size-14 rounded-full text-white shadow-xl border-[4px] border-[#101c22] transition-colors ${isListening ? 'bg-red-500' : 'bg-gradient-to-br from-purple-500 to-indigo-600'}`}>
                        <Mic size={24} className={isListening ? 'animate-pulse' : ''} />
                    </button>
                </div>
            </div>

            {/* FAB - QR Action (Visual Only for now) */}
            <div className="fixed bottom-24 right-6 md:right-[calc(50%-20px)] md:translate-x-[200px] z-40">
                <div className="relative group cursor-pointer" onClick={handleCreate}>
                    <div className="absolute inset-0 bg-primary/40 rounded-full blur-md group-hover:bg-primary/60 transition-all animate-pulse"></div>
                    <button className="relative flex items-center justify-center size-14 rounded-full bg-gradient-to-br from-[#0da6f2] to-[#0077b6] text-white shadow-xl border-[4px] border-[#101c22]">
                        <ScanLine size={24} />
                    </button>
                </div>
            </div>

            {/* Add Transaction Modal */}
            <Dialog
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                title={editingTransaction ? "Editar Transacción" : "Nueva Transacción"}
            >
                <TransactionForm
                    transaction={editingTransaction}
                    onSuccess={() => setIsAddOpen(false)}
                    onCancel={() => setIsAddOpen(false)}
                />
            </Dialog>
        </div>
    );
}
