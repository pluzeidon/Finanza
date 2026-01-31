import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../lib/db";
import { CategoryRepository } from "../../lib/repositories";
import { FinanceEngine } from "../../lib/finance";
import { SpendingChart } from "./SpendingChart";

export function ReportsPage() {
    const reportData = useLiveQuery(async () => {
        const transactions = await db.transactions.toArray();
        const categories = await CategoryRepository.getAll();

        // Group Expenses by Category
        const spendingByCategory = FinanceEngine.groupExpensesByCategory(transactions, categories as any); // Cast for color prop mismatch if any

        return { spendingByCategory };
    }, []);

    return (
        <div className="p-4 space-y-6 pb-24">
            <h1 className="text-2xl font-bold">Reportes</h1>

            <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-white tracking-tight">Gastos por Categoría</h2>
                    <button className="text-xs text-primary font-medium hover:underline">Ver todo</button>
                </div>

                <SpendingChart data={reportData?.spendingByCategory || []} />

                {/* Detailed List */}
                <div className="mt-8 space-y-4">
                    {reportData?.spendingByCategory.map((item) => (
                        <div key={item.categoryId} className="flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-xl flex items-center justify-center bg-white/5 border border-white/5 group-hover:bg-white/10 transition-colors">
                                    <div className="size-3 rounded-full shadow-[0_0_8px]" style={{ backgroundColor: item.color, boxShadow: `0 0 10px ${item.color}` }} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-white">{item.categoryName}</span>
                                    {/* Progress Bar Background */}
                                    <div className="w-24 h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                                        <div className="h-full rounded-full" style={{ width: `${item.percentage}%`, backgroundColor: item.color }} />
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="font-bold text-white text-sm">{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'USD' }).format(item.amount)}</span>
                                <span className="text-[10px] text-slate-400 font-mono">{item.percentage.toFixed(1)}%</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
