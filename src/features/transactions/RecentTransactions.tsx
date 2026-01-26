import { format, parseISO } from "date-fns";
import { useLiveQuery } from "dexie-react-hooks";
import { TransactionRepository, CategoryRepository, AccountRepository } from "../../lib/repositories";
import { Card, CardContent } from "../../components/ui/card";
import { ArrowRightLeft } from "lucide-react";

interface RecentTransactionsProps {
    onEdit?: (tx: any) => void;
}

export function RecentTransactions({ onEdit }: RecentTransactionsProps) {
    const transactions = useLiveQuery(async () => {
        // Ideally use a join or map, but for MVP simple fetching
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
        <div className="space-y-3">
            <h3 className="font-semibold text-lg">Actividad Reciente</h3>
            {transactions.map((tx) => (
                <Card
                    key={tx.id}
                    className="border-0 shadow-none bg-slate-50/50 hover:bg-slate-100 transition-colors cursor-pointer active:scale-[0.98]"
                    onClick={() => onEdit?.(tx)}
                >
                    <CardContent className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="text-2xl w-10 text-center">
                                {tx.type === 'TRANSFER' ? <ArrowRightLeft className="w-6 h-6 mx-auto text-slate-400" /> : (tx.category?.icon || '📄')}
                            </div>
                            <div>
                                <p className="font-medium text-sm flex items-baseline gap-2">
                                    {tx.category?.name || (tx.type === 'TRANSFER' ? 'Transferencia' : 'Desconocido')}
                                    {/* Show note in smaller font if exists */}
                                    {tx.note && <span className="text-[10px] text-slate-400 font-normal truncate max-w-[120px]">{tx.note}</span>}
                                </p>
                                <p className="text-xs text-slate-500">{format(parseISO(tx.date), 'MMM d')} • {tx.account?.name}</p>
                            </div>
                        </div>
                        <span className={`font-mono font-medium ${tx.type === 'INCOME' ? 'text-green-600' :
                            tx.type === 'EXPENSE' ? 'text-slate-900' : 'text-blue-600'
                            }`}>
                            {tx.type === 'EXPENSE' ? '-' : '+'}{tx.amount}
                        </span>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
