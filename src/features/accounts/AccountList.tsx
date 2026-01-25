import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { AccountRepository } from "../../lib/repositories";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Plus, Wallet, CreditCard, Banknote, Building2 } from "lucide-react";
import { Dialog } from "../../components/ui/dialog";
import { AccountForm } from "./AccountForm";
import { db } from "../../lib/db";
import { FinanceEngine } from "../../lib/finance";

// Helper to get icon by type
const getIcon = (type: string) => {
    switch (type) {
        case 'BANK': return <Building2 className="h-6 w-6 text-blue-500" />;
        case 'CASH': return <Banknote className="h-6 w-6 text-green-500" />;
        case 'CREDIT': return <CreditCard className="h-6 w-6 text-purple-500" />;
        default: return <Wallet className="h-6 w-6 text-slate-500" />;
    }
};

export function AccountList() {
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Live Query to get accounts AND their calculated balances
    // Note: This matches "ViewModel" pattern.
    const accountsData = useLiveQuery(async () => {
        const accounts = await AccountRepository.getActive();
        // We need all transactions to calculate balance.
        // Optimization: In a real app we might cache balances or only load transactions for visible accounts.
        // For MVP, loading all is fine.
        const allTx = await db.transactions.toArray(); // This is fast for <1000 items

        return accounts.map(acc => {
            // Filter transactions for this account
            const accTx = allTx.filter(tx => tx.accountId === acc.id || tx.transferToAccountId === acc.id);
            const balance = FinanceEngine.calculateAccountBalance(acc, accTx);
            return { ...acc, balance };
        });
    }, []);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Mis Cuentas</h2>
                <Button size="sm" onClick={() => setIsCreateOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {accountsData?.map((account) => (
                    <Card key={account.id} className="overflow-hidden">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-50 rounded-full">
                                    {getIcon(account.type)}
                                </div>
                                <div>
                                    <h3 className="font-semibold">{account.name}</h3>
                                    <p className="text-sm text-slate-500 capitalize">{account.type.toLowerCase()}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`text-lg font-bold ${account.type === 'CREDIT' ? 'text-red-500' : 'text-slate-900'}`}>
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: account.currency }).format(account.balance)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {accountsData?.length === 0 && (
                    <div className="col-span-full text-center py-10 text-slate-500">
                        No tienes cuentas. Añade una para empezar.
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
