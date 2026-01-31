
import { useLiveQuery } from "dexie-react-hooks";
import { TransactionRepository, CategoryRepository, AccountRepository } from "../../lib/repositories";
import { ArrowRightLeft } from "lucide-react";
import { cn } from "../../lib/utils";

interface RecentTransactionsProps {
    onEdit?: (tx: any) => void;
}

export function RecentTransactions({ onEdit }: RecentTransactionsProps) {
    const transactions = useLiveQuery(async () => {
        const [txs, cats, accs] = await Promise.all([
            TransactionRepository.getRecent(10),
            CategoryRepository.getAll(),
            AccountRepository.getAll()
        ]);

        return txs.map(tx => ({
            ...tx,
            category: cats.find(c => c.id === tx.categoryId),
            account: accs.find(a => a.id === tx.accountId)
        }));
    }, []);

    if (!transactions?.length) {
        return <div className="text-center text-slate-500 text-sm py-4">Sin actividad reciente</div>;
    }

    return (
        <section className="px-1 text-white">
            <h3 className="text-lg font-bold tracking-tight mb-5 px-1">Movimientos Recientes</h3>
            <div className="flex flex-col gap-4">
                {transactions.map((tx) => {
                    // Determine Colors based on type
                    const isExpense = tx.type === 'EXPENSE';
                    const isIncome = tx.type === 'INCOME';

                    let iconColor = isIncome ? "text-green-400" : "text-orange-400";
                    let bgColor = isIncome ? "bg-green-500/10" : "bg-orange-500/10";
                    let borderColor = isIncome ? "border-green-500/20" : "border-orange-500/20";
                    let shadowColor = isIncome ? "shadow-[0_0_10px_rgba(34,197,94,0.15)]" : "shadow-[0_0_10px_rgba(249,115,22,0.15)]";

                    if (tx.type === 'TRANSFER') {
                        iconColor = "text-blue-400";
                        bgColor = "bg-blue-500/10";
                        borderColor = "border-blue-500/20";
                        shadowColor = "shadow-[0_0_10px_rgba(59,130,246,0.15)]";
                    }

                    return (
                        <div
                            key={tx.id}
                            className="flex items-center justify-between group cursor-pointer p-2 -mx-2 hover:bg-white/5 rounded-xl transition-colors"
                            onClick={() => onEdit?.(tx)}
                        >
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "size-12 rounded-full flex items-center justify-center border transition-all",
                                    bgColor, borderColor, shadowColor, "group-hover:shadow-lg"
                                )}>
                                    <div className={cn("text-xl", iconColor)}>
                                        {tx.type === 'TRANSFER' ? <ArrowRightLeft size={20} /> : (tx.category?.icon || '📄')}
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <h4 className="text-white text-sm font-semibold">{tx.payee || tx.category?.name || 'Movimiento'}</h4>
                                    <p className="text-slate-500 text-xs">
                                        {tx.category?.name} • {new Date(tx.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                                    </p>
                                </div>
                            </div>
                            <span className={cn(
                                "font-medium text-sm",
                                isIncome ? "text-green-400 font-bold" : "text-white"
                            )}>
                                {isExpense ? '-' : '+'}${Number(tx.amount).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
