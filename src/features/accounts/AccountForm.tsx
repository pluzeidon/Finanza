import { useState } from "react";
import { AccountRepository } from "../../lib/repositories";
import { type AccountType, type CurrencyCode } from "../../lib/db";
import { Wallet, Building2, Banknote, CreditCard, TrendingUp } from "lucide-react";

interface AccountFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

export function AccountForm({ onSuccess, onCancel }: AccountFormProps) {
    const [name, setName] = useState("");
    const [type, setType] = useState<AccountType>("BANK");
    const [currency, setCurrency] = useState<CurrencyCode>("USD");
    const [initialBalance, setInitialBalance] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await AccountRepository.create({
                name,
                type,
                currency,
                initialBalance: parseFloat(initialBalance) || 0,
                color: "#0ddff2", // Using primary color
                archived: false,
                active: true
            } as any);
            onSuccess();
        } catch (error) {
            console.error("Failed to create account", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account Name */}
            <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nombre de la Cuenta</label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Wallet className="h-5 w-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                    </div>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ej: Banco Principal"
                        className="block w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                        required
                        autoFocus
                    />
                </div>
            </div>

            {/* Type Grid */}
            <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tipo de Cuenta</label>
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { id: 'BANK', label: 'Banco', icon: Building2 },
                        { id: 'CASH', label: 'Efectivo', icon: Banknote },
                        { id: 'CREDIT', label: 'Crédito', icon: CreditCard },
                        { id: 'INVESTMENT', label: 'Inversión', icon: TrendingUp },
                        { id: 'ASSET', label: 'Activo', icon: Wallet },
                    ].map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => setType(item.id as AccountType)}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${type === item.id
                                ? 'bg-primary/10 border-primary text-primary shadow-[0_0_10px_rgba(13,223,242,0.3)]'
                                : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            <item.icon className="h-6 w-6 mb-1" />
                            <span className="text-[10px] font-bold uppercase">{item.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Currency & Balance */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Moneda</label>
                    <div className="relative">
                        <select
                            className="block w-full pl-3 pr-8 py-3 bg-white/5 border border-white/10 rounded-xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                        >
                            <option value="USD" className="bg-slate-900">Dólar (USD)</option>
                            <option value="MXN" className="bg-slate-900">Peso (MXN)</option>
                            <option value="EUR" className="bg-slate-900">Euro (EUR)</option>
                            <option value="COP" className="bg-slate-900">Peso (COP)</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                            <Banknote className="h-4 w-4 opacity-50" />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Saldo Inicial</label>
                    <div className="relative group">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 font-bold">$</span>
                        <input
                            type="number"
                            step="0.01"
                            value={initialBalance}
                            onChange={(e) => setInitialBalance(e.target.value)}
                            placeholder="0.00"
                            className="block w-full pl-7 pr-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-mono placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="pt-4 flex gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 py-3 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-colors font-medium"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-[2] py-3 rounded-xl bg-primary text-background-dark font-bold hover:shadow-[0_0_20px_rgba(13,223,242,0.6)] transition-all disabled:opacity-50"
                >
                    {loading ? "Guardando..." : "Crear Cuenta"}
                </button>
            </div>
        </form>
    );
}
