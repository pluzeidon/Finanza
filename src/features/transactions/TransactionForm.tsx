import { useState, useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { TransactionRepository, AccountRepository, CategoryRepository } from "../../lib/repositories";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { type TransactionType } from "../../lib/db";
import { ArrowRightLeft, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "../../lib/utils";

interface TransactionFormProps {
    transaction?: any; // Using any to avoid type circular dep issues temporarily, or import Transaction
    onSuccess: () => void;
    onCancel: () => void;
}

export function TransactionForm({ transaction, onSuccess, onCancel }: TransactionFormProps) {
    // Initialize state with transaction data or defaults
    const [type, setType] = useState<TransactionType>(transaction?.type || "EXPENSE");
    const [amount, setAmount] = useState(transaction?.amount?.toString() || "");
    const [selectedCategory, setSelectedCategory] = useState<string>(transaction?.categoryId || "");
    const [selectedAccount, setSelectedAccount] = useState<string>(transaction?.accountId || "");
    const [toAccount, setToAccount] = useState<string>(transaction?.transferToAccountId || "");
    const [date, setDate] = useState(transaction?.date || new Date().toISOString().split('T')[0]);
    const [note, setNote] = useState(transaction?.note || "");
    const [loading, setLoading] = useState(false);

    const data = useLiveQuery(async () => {
        const [accounts, categories] = await Promise.all([
            AccountRepository.getActive(),
            CategoryRepository.getAll()
        ]);
        return { accounts, categories };
    });

    const filteredCategories = useMemo(() => {
        if (!data?.categories) return [];
        return data.categories.filter(c => c.type === type);
    }, [data?.categories, type]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAccount || !amount) return;
        if (type === 'TRANSFER' && !toAccount) return;

        setLoading(true);
        try {
            const payload = {
                type,
                amount: parseFloat(amount),
                accountId: selectedAccount,
                categoryId: selectedCategory || (type === 'TRANSFER' ? 'transfer-system' : 'uncategorized'),
                transferToAccountId: type === 'TRANSFER' ? toAccount : undefined,
                date,
                note,
                status: 'CLEARED'
            };

            if (transaction?.id) {
                await TransactionRepository.update(transaction.id, payload as any);
            } else {
                await TransactionRepository.create(payload as any);
            }
            onSuccess();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type Toggle */}
            <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-lg">
                {[
                    { id: 'EXPENSE', label: 'GASTO' },
                    { id: 'INCOME', label: 'INGRESO' },
                    { id: 'TRANSFER', label: 'TRANSF.' }
                ].map((t) => (
                    <button
                        key={t.id}
                        type="button"
                        onClick={() => { setType(t.id as any); setSelectedCategory(""); }}
                        className={cn(
                            "flex flex-col items-center justify-center py-2 rounded-md text-xs font-medium transition-all",
                            type === t.id ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-900"
                        )}
                    >
                        {t.id === 'EXPENSE' && <TrendingDown className="h-4 w-4 mb-1 text-red-500" />}
                        {t.id === 'INCOME' && <TrendingUp className="h-4 w-4 mb-1 text-green-500" />}
                        {t.id === 'TRANSFER' && <ArrowRightLeft className="h-4 w-4 mb-1 text-blue-500" />}
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Amount (Big) */}
            <div>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                    <Input
                        type="number"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="text-3xl h-16 pl-8 font-bold"
                        autoFocus={!transaction} // Only autofocus on new
                        required
                    />
                </div>
            </div>

            {/* Account Selector */}
            <div className="grid grid-cols-1 gap-4">
                <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Desde Cuenta</label>
                    <select
                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                        value={selectedAccount}
                        onChange={(e) => setSelectedAccount(e.target.value)}
                        required
                    >
                        <option value="">Seleccionar Cuenta</option>
                        {data?.accounts.map(acc => (
                            <option key={acc.id} value={acc.id}>{acc.name} ({acc.currency})</option>
                        ))}
                    </select>
                </div>

                {type === 'TRANSFER' && (
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Para Cuenta</label>
                        <select
                            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                            value={toAccount}
                            onChange={(e) => setToAccount(e.target.value)}
                            required
                        >
                            <option value="">Cuenta Destino</option>
                            {data?.accounts.filter(a => a.id !== selectedAccount).map(acc => (
                                <option key={acc.id} value={acc.id}>{acc.name}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Categories Grid (Only for Income/Expense) */}
            {type !== 'TRANSFER' && (
                <div>
                    <label className="block text-xs font-medium text-slate-500 mb-2">Categoría</label>
                    <div className="grid grid-cols-4 gap-2">
                        {filteredCategories.map(cat => (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => setSelectedCategory(cat.id)}
                                className={cn(
                                    "flex flex-col items-center justify-center p-2 rounded-lg border transition-all h-20",
                                    selectedCategory === cat.id
                                        ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900"
                                        : "border-slate-200 hover:border-slate-300"
                                )}
                            >
                                <span className="text-2xl mb-1">{cat.icon}</span>
                                <span className="text-[10px] text-center truncate w-full leading-tight">{cat.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Date & Note */}
            <div className="grid grid-cols-2 gap-4">
                <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
                <Input placeholder="Nota (Opcional)" value={note} onChange={e => setNote(e.target.value)} />
            </div>

            <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
                <Button type="submit" disabled={loading} className="w-full">
                    {transaction ? 'Actualizar' : 'Guardar'} Transacción
                </Button>
            </div>
        </form>
    );
}
