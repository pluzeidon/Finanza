import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { AccountRepository } from "../../lib/repositories";
import { Plus, Wallet, CreditCard, Banknote, Building2, TrendingUp, Layers } from "lucide-react";
import { Dialog } from "../../components/ui/dialog";
import { AccountForm } from "./AccountForm";
import { db } from "../../lib/db";
import { FinanceEngine } from "../../lib/finance";
import { cn } from "../../lib/utils";

// Helper to get icon by type
const getAccountConfig = (type: string) => {
    switch (type) {
        case 'BANK': return { icon: <Building2 className="h-6 w-6" />, label: 'Banco', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' };
        case 'CASH': return { icon: <Banknote className="h-6 w-6" />, label: 'Efectivo', color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20' };
        case 'CREDIT': return { icon: <CreditCard className="h-6 w-6" />, label: 'Crédito', color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' };
        case 'INVESTMENT': return { icon: <TrendingUp className="h-6 w-6" />, label: 'Inversión', color: 'text-pink-400', bg: 'bg-pink-400/10', border: 'border-pink-400/20' };
        case 'ASSET': return { icon: <Layers className="h-6 w-6" />, label: 'Activo', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' };
        default: return { icon: <Wallet className="h-6 w-6" />, label: 'Cuenta', color: 'text-slate-400', bg: 'bg-white/5', border: 'border-white/10' };
    }
};

export function AccountList() {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // Live Query to get accounts AND their calculated balances
    const accountsData = useLiveQuery(async () => {
        const accounts = await AccountRepository.getActive();
        const allTx = await db.transactions.toArray();

        return accounts.map(acc => {
            const accTx = allTx.filter(tx => tx.accountId === acc.id || tx.transferToAccountId === acc.id);
            const balance = FinanceEngine.calculateAccountBalance(acc, accTx);
            return { ...acc, balance };
        });
    }, []);

    // Live Query for transactions of the expanded account
    const expandedTransactions = useLiveQuery(async () => {
        if (!expandedId) return null;

        const txs = await db.transactions
            .where('accountId').equals(expandedId)
            .or('transferToAccountId').equals(expandedId)
            .toArray();

        // Sort by date DESC
        txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        const cats = await db.categories.toArray();
        const accs = await db.accounts.toArray();

        return txs.map(tx => ({
            ...tx,
            category: cats.find(c => c.id === tx.categoryId),
            account: accs.find(a => a.id === tx.accountId) // Origin account
        }));
    }, [expandedId]);

    const handleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <div className="space-y-6 pt-4 pb-24 text-white">
            <div className="flex items-center justify-between px-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Mis Cuentas</h2>
                    <p className="text-slate-400 text-xs mt-1">Administra tus fuentes de dinero</p>
                </div>

                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-primary px-4 py-2 rounded-xl transition-all font-medium text-sm group"
                >
                    <Plus className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    Nueva
                </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {accountsData?.map((account) => {
                    const config = getAccountConfig(account.type);
                    const isExpanded = expandedId === account.id;

                    return (
                        <div key={account.id} onClick={() => handleExpand(account.id)} className={cn(
                            "glass-panel rounded-2xl transition-all cursor-pointer relative overflow-hidden flex flex-col",
                            isExpanded ? "ring-2 ring-primary/50 bg-white/5" : "hover:border-white/20"
                        )}>
                            {/* Account Header Card */}
                            <div className="p-4 flex items-center justify-between relative z-10 w-full">
                                {/* Decorative glow */}
                                <div className={cn("absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-16 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity", config.color.replace('text-', 'bg-'))}></div>

                                <div className="flex items-center gap-4 relative z-10">
                                    <div className={cn("p-3 rounded-xl border flex items-center justify-center", config.bg, config.border, config.color)}>
                                        {config.icon}
                                    </div>
                                    <div className="flex flex-col">
                                        <h3 className="font-bold text-base leading-tight">{account.name}</h3>
                                        <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">{config.label}</p>
                                    </div>
                                </div>
                                <div className="text-right relative z-10">
                                    <span className={cn(
                                        "text-lg font-mono font-bold block",
                                        account.type === 'CREDIT' && account.balance > 0 ? 'text-red-400' : 'text-white'
                                    )}>
                                        {new Intl.NumberFormat('es-MX', { style: 'currency', currency: account.currency }).format(account.balance)}
                                    </span>
                                </div>
                            </div>

                            {/* Expanded Transactions List */}
                            {isExpanded && (
                                <div className="border-t border-white/10 bg-black/20 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Historial de Movimientos</h4>

                                    {!expandedTransactions?.length ? (
                                        <p className="text-center text-slate-500 text-sm py-4">No hay movimientos en esta cuenta.</p>
                                    ) : (
                                        <div className="flex flex-col gap-3">
                                            {expandedTransactions.map(tx => {
                                                const isExpense = tx.type === 'EXPENSE';
                                                const isIncome = tx.type === 'INCOME';

                                                let iconColor = isIncome ? "text-green-400" : "text-orange-400";
                                                let bgColor = isIncome ? "bg-green-500/10" : "bg-orange-500/10";
                                                let borderColor = isIncome ? "border-green-500/20" : "border-orange-500/20";
                                                // Unused: let shadowColor = isIncome ? "shadow-[0_0_10px_rgba(34,197,94,0.15)]" : "shadow-[0_0_10px_rgba(249,115,22,0.15)]";

                                                if (tx.type === 'TRANSFER') {
                                                    iconColor = "text-blue-400";
                                                    bgColor = "bg-blue-500/10";
                                                    borderColor = "border-blue-500/20";
                                                }

                                                return (
                                                    <div key={tx.id} className="flex items-center justify-between group p-2 hover:bg-white/5 rounded-lg transition-colors">
                                                        <div className="flex items-center gap-3 overflow-hidden">
                                                            <div className={cn(
                                                                "size-10 rounded-full flex items-center justify-center border transition-all shrink-0",
                                                                bgColor, borderColor
                                                            )}>
                                                                <span className={cn("text-lg", iconColor)}>
                                                                    {tx.type === 'TRANSFER' ? '⇆' : (tx.category?.icon || '📄')}
                                                                </span>
                                                            </div>
                                                            <div className="flex flex-col overflow-hidden">
                                                                <h5 className="text-white text-sm font-semibold truncate">{tx.payee || tx.category?.name || 'Movimiento'}</h5>
                                                                <p className="text-slate-500 text-[10px] truncate">
                                                                    {new Date(tx.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                                                                    {tx.note && <span className="text-slate-600"> • {tx.note}</span>}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <span className={cn(
                                                            "font-medium text-sm whitespace-nowrap ml-2",
                                                            isIncome ? "text-green-400" : "text-white"
                                                        )}>
                                                            {isExpense ? '-' : '+'}{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(tx.amount)}
                                                        </span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}

                {accountsData?.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-slate-500 glass-panel rounded-2xl border-dashed border-white/10">
                        <Wallet className="h-12 w-12 mb-3 opacity-20" />
                        <p>No tienes cuentas registradas.</p>
                        <button onClick={() => setIsCreateOpen(true)} className="text-primary text-sm mt-2 hover:underline">
                            Crear mi primera cuenta
                        </button>
                    </div>
                )}
            </div>

            <Dialog
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                title="Crear Nueva Cuenta"
            >
                <AccountForm
                    onSuccess={() => setIsCreateOpen(false)}
                    onCancel={() => setIsCreateOpen(false)}
                />
            </Dialog>
        </div>
    );
}
