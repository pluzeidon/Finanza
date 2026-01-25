import type { Transaction, Account, Budget } from './db';
import { startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';

/**
 * Domain Logic for Financial Calculations.
 * These functions are pure and testable, independent of the database.
 */

export const FinanceEngine = {
    /**
     * Calculates the current balance of an account based on its initial balance and history.
     */
    calculateAccountBalance: (account: Account, transactions: Transaction[]): number => {
        return transactions.reduce((balance, tx) => {
            if (tx.status === 'PENDING' && account.type !== 'CREDIT') {
                // Decision: Do pending transactions affect balance? 
                // Usually "Available Balance" excludes pending, "Current" includes.
                // For simplicity for now, we include everything unless confirmed otherwise.
            }

            const amount = Number(tx.amount); // Ensure number

            if (tx.type === 'INCOME') {
                return balance + amount;
            } else if (tx.type === 'EXPENSE') {
                return balance - amount;
            } else if (tx.type === 'TRANSFER') {
                // If it's a transfer *from* this account (which it is, if it's in this account's list as source)
                // Wait, self-transfers need careful handling in DB query. 
                // Assuming transactions list contains records where accountId === account.id
                if (tx.accountId === account.id) {
                    return balance - amount;
                }
                // If we are the destination of a transfer (needs separate query logic usually, 
                // or transactions list must include incoming transfers)
                if (tx.transferToAccountId === account.id) {
                    return balance + amount;
                }
            }
            return balance;
        }, account.initialBalance);
    },

    /**
     * Calculates total Net Worth (Assets - Liabilities).
     */
    calculateNetWorth: (accounts: Account[], allTransactions: Transaction[]): number => {
        let netWorth = 0;

        for (const account of accounts) {
            // Filter transactions for this account specifically
            // Note: This matches the simple repository logic. 
            // Optimized approach would be to calculate balances at DB level, but for <10k items JS is fine.
            const accountTx = allTransactions.filter(tx =>
                tx.accountId === account.id || tx.transferToAccountId === account.id
            );

            const balance = FinanceEngine.calculateAccountBalance(account, accountTx);

            // In a personal finance context, Credit Card debt is negative net worth.
            // Usually Credit Card balance is positive number in liability account?
            // Or negative number? 
            // Convention: Account Balance is what you "have".
            // If Credit Card has balance 500, it means you owe 500. So it subtracts from Net Worth.
            // If Cash has 500, it adds.

            // However, usually Dexie/Apps store Credit Card balances as negative if they are debt.
            // Let's assume standard accounting:
            // Asset Account: Positive Balance = Good.
            // Liability/Credit Account: Negative Balance = Debt.

            // But if user enters "Expense 50" on Credit Card 0:
            // 0 - 50 = -50.
            // So simple summation works if we respect the sign.

            netWorth += balance;
        }
        return netWorth;
    },

    /**
     * Get Cash Flow (Income vs Expense) for a specific period.
     */
    getCashFlow: (transactions: Transaction[], startDate: Date, endDate: Date) => {
        let income = 0;
        let expense = 0;

        for (const tx of transactions) {
            const txDate = parseISO(tx.date);
            if (isWithinInterval(txDate, { start: startDate, end: endDate })) {
                if (tx.type === 'INCOME') {
                    income += tx.amount;
                } else if (tx.type === 'EXPENSE') {
                    expense += tx.amount;
                }
            }
        }

        return {
            income,
            expense,
            net: income - expense
        };
    },

    /**
     * Check how much of a budget has been consumed.
     */
    checkBudgetHealth: (budget: Budget, transactions: Transaction[], monthDate: Date = new Date()) => {
        // 1. Filter transactions by Category
        const categoryTx = transactions.filter(tx => tx.categoryId === budget.categoryId && tx.type === 'EXPENSE');

        // 2. Filter by Period (Monthly assumption for now)
        const start = startOfMonth(monthDate);
        const end = endOfMonth(monthDate);

        const periodTx = categoryTx.filter(tx =>
            isWithinInterval(parseISO(tx.date), { start, end })
        );

        const spent = periodTx.reduce((sum, tx) => sum + tx.amount, 0);
        const remaining = budget.limit - spent;
        const percentage = Math.min((spent / budget.limit) * 100, 100);

        return {
            limit: budget.limit,
            spent,
            remaining,
            percentage,
            isOverBudget: spent > budget.limit
        };
    },

    /**
     * Aggregates expenses by category for a donut chart or report.
     */
    groupExpensesByCategory: (transactions: Transaction[], categories: { id: string; name: string; color: string }[]) => {
        const expenses = transactions.filter(tx => tx.type === 'EXPENSE');
        const totalExpense = expenses.reduce((sum, tx) => sum + tx.amount, 0);

        const grouped: Record<string, number> = {};

        expenses.forEach(tx => {
            const catId = tx.categoryId;
            grouped[catId] = (grouped[catId] || 0) + tx.amount;
        });

        return Object.entries(grouped).map(([catId, amount]) => {
            const category = categories.find(c => c.id === catId);
            return {
                categoryId: catId,
                categoryName: category?.name || 'Uncategorized',
                color: category?.color || '#cbd5e1',
                amount,
                percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0
            };
        }).sort((a, b) => b.amount - a.amount); // Sort big to small
    }
};
