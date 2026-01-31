import { useState, useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { TransactionRepository, AccountRepository, CategoryRepository } from "../../lib/repositories";
import { Button } from "../../components/ui/button";
import { type TransactionType } from "../../lib/db";
import { ArrowRightLeft, TrendingDown, TrendingUp, Calendar, FileText } from "lucide-react";
import { cn } from "../../lib/utils";

interface TransactionFormProps {
    transaction?: any;
    onSuccess: () => void;
    onCancel: () => void;
}

export function TransactionForm({ transaction, onSuccess, onCancel }: TransactionFormProps) {
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
        <form onSubmit={handleSubmit} className="space-y-6 text-white pb-6">

            {/* Amount Display - Huge & Centered */}
            <section className="flex flex-col items-center justify-center pt-2 pb-2">
                <div className="relative group w-full flex justify-center">
                    <span className="absolute left-[15%] top-2 text-2xl text-slate-400 font-light">$</span>
                    <input
                        className="bg-transparent border-none p-0 text-center text-6xl font-light tracking-tighter text-white focus:ring-0 w-full max-w-[300px] placeholder-slate-700 caret-primary drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
                        placeholder="0.00"
                        type="number"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        autoFocus={!transaction}
                        required
                    />
                </div>
            </section>

            {/* Type Toggle - Glass/Neon Style */}
            <section className="flex justify-center w-full">
                <div className="glass-panel p-1 rounded-xl flex w-full relative">
                    {/* Animated Background Pill */}
                    <div
                        className={cn(
                            "absolute top-1 bottom-1 w-[calc(33.33%-4px)] bg-primary/20 border border-primary/50 rounded-lg shadow-neon transition-all duration-300 ease-out",
                            type === 'EXPENSE' ? "left-1 translate-x-0" :
                                type === 'INCOME' ? "left-1 translate-x-[100%]" :
                                    "left-1 translate-x-[200%]"
                        )}
                    ></div>

                    {[
                        { id: 'EXPENSE', label: 'Gastos' },
                        { id: 'INCOME', label: 'Ingresos' },
                        { id: 'TRANSFER', label: 'transf.' } // Lowercase for style or uppercase? Design uses Uppercase usually.
                    ].map((t) => (
                        <button
                            key={t.id}
                            type="button"
                            onClick={() => { setType(t.id as any); setSelectedCategory(""); }}
                            className={cn(
                                "relative z-10 flex-1 py-3 text-sm font-bold uppercase tracking-wider text-center transition-colors",
                                type === t.id ? "text-primary drop-shadow-[0_0_5px_rgba(13,223,242,0.8)]" : "text-slate-400 hover:text-white"
                            )}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </section>

            {/* Categories Grid */}
            {type !== 'TRANSFER' && (
                <section className="space-y-4">
                    <h3 className="text-white text-sm font-bold tracking-wide flex items-center gap-2">
                        <span className="w-1 h-5 bg-primary rounded-full shadow-neon"></span>
                        Categoría
                    </h3>
                    <div className="grid grid-cols-4 gap-4">
                        {filteredCategories.map(cat => (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => setSelectedCategory(cat.id)}
                                className={cn(
                                    "flex flex-col items-center gap-2 group transition-all duration-300",
                                    selectedCategory === cat.id ? "scale-105" : "hover:scale-105"
                                )}
                            >
                                <div className={cn(
                                    "size-16 rounded-2xl flex items-center justify-center border transition-all duration-300",
                                    selectedCategory === cat.id
                                        ? "bg-primary/10 border-primary text-primary shadow-neon"
                                        : "bg-white/5 border-white/10 text-slate-400 group-hover:text-white group-hover:border-white/30"
                                )}>
                                    <span className="text-3xl">{cat.icon}</span>
                                </div>
                                <span className={cn(
                                    "text-xs font-medium tracking-wide transition-colors",
                                    selectedCategory === cat.id ? "text-primary" : "text-slate-500 group-hover:text-slate-300"
                                )}>
                                    {cat.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </section>
            )}

            {/* Account Selection (Cards Style) */}
            <section className="space-y-4">
                <h3 className="text-white text-sm font-bold tracking-wide flex items-center gap-2">
                    <span className="w-1 h-5 bg-slate-600 rounded-full"></span>
                    {type === 'TRANSFER' ? 'Origen y Destino' : 'Cuenta Origen'}
                </h3>

                <div className="grid grid-cols-1 gap-2">
                    <select
                        className="w-full bg-white/5 border border-white/10 text-white rounded-xl h-12 px-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        value={selectedAccount}
                        onChange={(e) => setSelectedAccount(e.target.value)}
                        required
                    >
                        <option value="" className="bg-slate-900">Seleccionar Cuenta...</option>
                        {data?.accounts.map(acc => (
                            <option key={acc.id} value={acc.id} className="bg-slate-900">{acc.name} ({acc.currency})</option>
                        ))}
                    </select>

                    {type === 'TRANSFER' && (
                        <select
                            className="w-full bg-white/5 border border-white/10 text-white rounded-xl h-12 px-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none mt-2"
                            value={toAccount}
                            onChange={(e) => setToAccount(e.target.value)}
                            required
                        >
                            <option value="" className="bg-slate-900">Cuenta Destino...</option>
                            {data?.accounts.filter(a => a.id !== selectedAccount).map(acc => (
                                <option key={acc.id} value={acc.id} className="bg-slate-900">{acc.name}</option>
                            ))}
                        </select>
                    )}
                </div>
            </section>

            {/* Details */}
            <section className="space-y-4 pt-2">
                <div className="flex gap-4">
                    <div className="flex-1 relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                            <Calendar size={16} />
                        </div>
                        <input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 text-white rounded-xl h-12 pl-10 pr-4 focus:ring-2 focus:ring-primary outline-none"
                            required
                        />
                    </div>
                    <div className="flex-[1.5] relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                            <FileText size={16} />
                        </div>
                        <input
                            placeholder="Nota opcional..."
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 text-white rounded-xl h-12 pl-10 pr-4 focus:ring-2 focus:ring-primary outline-none placeholder-slate-600"
                        />
                    </div>
                </div>
            </section>

            {/* Action Bar */}
            <div className="pt-6">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 bg-primary rounded-xl text-background-dark font-bold text-lg tracking-widest uppercase shadow-neon-strong hover:shadow-[0_0_25px_rgba(13,223,242,0.9)] transition-all transform active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Guardando...' : (transaction ? 'Actualizar' : 'Confirmar')}
                </button>
                <div className="text-center mt-4">
                    <button type="button" onClick={onCancel} className="text-slate-500 text-sm hover:text-white transition-colors uppercase tracking-wider">
                        Cancelar
                    </button>
                </div>
            </div>
        </form>
    );
}
