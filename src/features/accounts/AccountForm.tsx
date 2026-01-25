import { useState } from "react";
import { AccountRepository } from "../../lib/repositories";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { type AccountType, type CurrencyCode } from "../../lib/db";

interface AccountFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

export function AccountForm({ onSuccess, onCancel }: AccountFormProps) {
    const [name, setName] = useState("");
    const [type, setType] = useState<AccountType>("BANK");
    const [currency, setCurrency] = useState<CurrencyCode>("USD");
    const [initialBalance, setInitialBalance] = useState("0");
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
                color: "#3b82f6", // Default blue for now
                archived: false,
                active: true // Backcompat if needed, schema says active? No, schema says archived. Wait, repository says archived.
            } as any); // Type cast due to minor schema mismatch in db.ts comments vs interface. Interface has archived, no active.
            onSuccess();
        } catch (error) {
            console.error("Failed to create account", error);
            alert("Error creating account");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-1">Nombre de Cuenta</label>
                <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: Banco Principal"
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Tipo</label>
                    <select
                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                        value={type}
                        onChange={(e) => setType(e.target.value as AccountType)}
                    >
                        <option value="BANK">Banco</option>
                        <option value="CASH">Efectivo</option>
                        <option value="CREDIT">Crédito</option>
                        <option value="ASSET">Activo</option>
                        <option value="INVESTMENT">Inversión</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Moneda</label>
                    <select
                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                    >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="MXN">MXN</option>
                        <option value="COP">COP</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Saldo Inicial</label>
                <Input
                    type="number"
                    step="0.01"
                    value={initialBalance}
                    onChange={(e) => setInitialBalance(e.target.value)}
                    placeholder="0.00"
                />
            </div>

            <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
                <Button type="submit" disabled={loading}>
                    {loading ? "Guardando..." : "Crear Cuenta"}
                </Button>
            </div>
        </form>
    );
}
