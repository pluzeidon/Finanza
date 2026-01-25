import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { AccountRepository } from "../../lib/repositories";
import { FinanceEngine } from "../../lib/finance";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Plus } from "lucide-react";
import { Dialog } from "../../components/ui/dialog";
import { TransactionForm } from "../transactions/TransactionForm";
import { RecentTransactions } from "../transactions/RecentTransactions";
import { db } from "../../lib/db";

export function Dashboard() {
    const [isAddOpen, setIsAddOpen] = useState(false);

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

    return (
        <div className="p-4 space-y-6 pb-24">
            {/* Header / Main Cards Grid */}
            <div className="space-y-4">
                {/* 2x2 Grid for Vibrant Cards */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Income Card - Blue/Purple */}
                    <Card className="border-0 shadow-lg shadow-indigo-500/10 bg-gradient-to-br from-blue-400 to-indigo-500 text-white rounded-3xl overflow-hidden relative">
                        <CardContent className="p-5 flex flex-col justify-between h-32">
                            <div className="z-10">
                                <p className="text-xs font-medium opacity-80 uppercase tracking-widest">Ingresos</p>
                                <p className="text-xl font-bold mt-1">+{stats?.cashFlow.income.toLocaleString()}</p>
                            </div>
                            <div className="text-[10px] opacity-60 font-light">Total Mensual</div>

                            {/* Decor Circle */}
                            <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
                        </CardContent>
                    </Card>

                    {/* Expense Card - Rose/Pink */}
                    <Card className="border-0 shadow-lg shadow-rose-500/10 bg-gradient-to-br from-rose-400 to-pink-500 text-white rounded-3xl overflow-hidden relative">
                        <CardContent className="p-5 flex flex-col justify-between h-32">
                            <div className="z-10">
                                <p className="text-xs font-medium opacity-80 uppercase tracking-widest">Gastos</p>
                                <p className="text-xl font-bold mt-1">-{stats?.cashFlow.expense.toLocaleString()}</p>
                            </div>
                            <div className="text-[10px] opacity-60 font-light">Total Mensual</div>

                            {/* Decor Circle */}
                            <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
                        </CardContent>
                    </Card>

                    {/* Net Worth (Credits style from image) - Cyan/Blue */}
                    <Card className="border-0 shadow-lg shadow-cyan-500/10 bg-gradient-to-br from-cyan-400 to-blue-400 text-white rounded-3xl overflow-hidden relative">
                        <CardContent className="p-5 flex flex-col justify-between h-32">
                            <div className="z-10">
                                <p className="text-xs font-medium opacity-80 uppercase tracking-widest">Patrimonio</p>
                                <p className="text-xl font-bold mt-1">{stats ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(stats.netWorth) : '...'}</p>
                            </div>
                            <div className="text-[10px] opacity-60 font-light">Balance Total</div>
                        </CardContent>
                    </Card>

                    {/* Others/System - Emerald/Teal */}
                    <Card className="border-0 shadow-lg shadow-emerald-500/10 bg-gradient-to-br from-emerald-400 to-teal-500 text-white rounded-3xl overflow-hidden relative">
                        <CardContent className="p-5 flex flex-col justify-between h-32">
                            <div className="z-10">
                                <p className="text-xs font-medium opacity-80 uppercase tracking-widest">Ahorro</p>
                                <p className="text-xl font-bold mt-1">
                                    {(stats && (stats.cashFlow.income - stats.cashFlow.expense) > 0)
                                        ? '+' + (stats.cashFlow.income - stats.cashFlow.expense).toLocaleString()
                                        : '0'}
                                </p>
                            </div>
                            <div className="text-[10px] opacity-60 font-light">Flujo Neto</div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Separator / Decoration Wave (Simplified) */}
            <div className="h-6 w-full flex items-center justify-center">
                <div className="h-1 w-12 bg-slate-200 rounded-full"></div>
            </div>

            {/* Recent Activity */}
            <RecentTransactions />

            {/* FAB - Positioned relative to layout */}
            <div className="fixed bottom-24 left-0 right-0 mx-auto max-w-md z-50 pointer-events-none flex justify-end px-4">
                <Button
                    size="icon"
                    className="h-14 w-14 rounded-full shadow-2xl bg-indigo-600 hover:bg-indigo-700 pointer-events-auto transition-transform hover:scale-105 active:scale-95"
                    onClick={() => setIsAddOpen(true)}
                >
                    <Plus className="h-8 w-8 text-white" />
                </Button>
            </div>

            {/* Add Transaction Modal */}
            <Dialog
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                title="Nueva Transacción"
            >
                <TransactionForm
                    onSuccess={() => setIsAddOpen(false)}
                    onCancel={() => setIsAddOpen(false)}
                />
            </Dialog>
        </div>
    );
}
