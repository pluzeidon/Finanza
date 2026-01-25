import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../lib/db";
import { CategoryRepository } from "../../lib/repositories";
import { FinanceEngine } from "../../lib/finance";
import { SpendingChart } from "./SpendingChart";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

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

            <Card>
                <CardHeader>
                    <CardTitle>Gastos por Categoría</CardTitle>
                </CardHeader>
                <CardContent>
                    <SpendingChart data={reportData?.spendingByCategory || []} />

                    {/* Detailed List */}
                    <div className="mt-6 space-y-3">
                        {reportData?.spendingByCategory.map(item => (
                            <div key={item.categoryId} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span>{item.categoryName}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="font-medium">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.amount)}</span>
                                    <span className="text-slate-500 w-8 text-right">{item.percentage.toFixed(0)}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
