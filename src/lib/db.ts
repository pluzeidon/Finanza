import Dexie, { type EntityTable } from 'dexie';
import { v4 as uuidv4 } from 'uuid';

// --- Interfaces (Types) ---

export type CurrencyCode = 'USD' | 'EUR' | 'MXN' | 'COP' | 'ARS';
export type AccountType = 'BANK' | 'CASH' | 'CREDIT' | 'ASSET' | 'INVESTMENT';
export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER';
export type TransactionStatus = 'CLEARED' | 'PENDING';
export type CategoryType = 'INCOME' | 'EXPENSE';
export type BudgetPeriod = 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface Account {
    id: string;
    name: string;
    type: AccountType;
    currency: CurrencyCode;
    initialBalance: number; // Stored in cents or smallest unit to avoid float issues? No, JS numbers are doubles. Integers preferred but let's stick to standard number for simplicity now, maybe cents later.
    color: string;
    archived: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Category {
    id: string;
    name: string;
    type: CategoryType;
    icon: string; // Emoji or Lucide icon name
    color: string;
    parentId?: string; // For subcategories
    isSystem?: boolean; // If true, cannot be deleted
}

export interface Transaction {
    id: string;
    accountId: string;
    categoryId: string; // Optional? No, better enforce 'Uncategorized'
    amount: number; // Absolute value unique for storage? Or signed? Best practice: Absolute value + Type.
    type: TransactionType;
    date: string; // ISO 8601 YYYY-MM-DD or full timestamp
    note: string;
    payee?: string;
    transferToAccountId?: string; // Only if type === TRANSFER
    status: TransactionStatus;
    createdAt: string;
    updatedAt: string;
}

export interface Budget {
    id: string;
    categoryId: string;
    limit: number;
    period: BudgetPeriod;
    scope: string; // e.g., '2024-01' for monthly, '2024' for yearly
    createdAt: string;
    updatedAt: string;
}

export interface Goal {
    id: string;
    name: string;
    targetAmount: number;
    deadline?: string;
    savedAmount: number; // Manual tracking or linked?
    color: string;
    createdAt: string;
    updatedAt: string;
}

// --- Database Class ---

export class FinanzaDB extends Dexie {
    accounts!: EntityTable<Account, 'id'>;
    transactions!: EntityTable<Transaction, 'id'>;
    categories!: EntityTable<Category, 'id'>;
    budgets!: EntityTable<Budget, 'id'>;
    goals!: EntityTable<Goal, 'id'>;

    constructor() {
        super('FinanzaDB');

        // Schema Version 1
        this.version(1).stores({
            accounts: 'id, type, currency',
            transactions: 'id, accountId, categoryId, date, type, status, [accountId+date], [categoryId+date]', // Compound indices for queries
            categories: 'id, type, parentId',
            budgets: 'id, categoryId, [period+scope]',
            goals: 'id, deadline'
        });

        // Hooks for auto-generating IDs and timestamps
        this.accounts.hook('creating', (_primKey, obj) => {
            obj.id = obj.id || uuidv4();
            obj.createdAt = new Date().toISOString();
            obj.updatedAt = new Date().toISOString();
        });
        this.accounts.hook('updating', (_mods, _primKey, _obj) => {
            // @ts-ignore
            return { updatedAt: new Date().toISOString() };
        });

        this.transactions.hook('creating', (_primKey, obj) => {
            obj.id = obj.id || uuidv4();
            obj.createdAt = new Date().toISOString();
            obj.updatedAt = new Date().toISOString();
        });
        this.transactions.hook('updating', (_mods, _primKey, _obj) => {
            // @ts-ignore
            return { updatedAt: new Date().toISOString() };
        });

        // ... Similar hooks for others if needed, but these are the high volume ones.
        this.categories.hook('creating', (_primKey, obj) => {
            obj.id = obj.id || uuidv4();
        });

        // Populate default categories on fresh install
        this.on('populate', () => {
            this.populateDefaults();
        });
    }

    async populateDefaults() {
        const defaultCategories: Partial<Category>[] = [
            { name: 'General', type: 'EXPENSE', icon: '💸', color: '#94a3b8', isSystem: true },
            { name: 'Comida', type: 'EXPENSE', icon: '🍔', color: '#ef4444' },
            { name: 'Transporte', type: 'EXPENSE', icon: '🚗', color: '#f97316' },
            { name: 'Vivienda', type: 'EXPENSE', icon: '🏠', color: '#3b82f6' },
            { name: 'Salud', type: 'EXPENSE', icon: '💊', color: '#10b981' },
            { name: 'Ocio', type: 'EXPENSE', icon: '🎉', color: '#8b5cf6' },
            { name: 'Ingresos', type: 'INCOME', icon: '💰', color: '#22c55e', isSystem: true },
        ];
        await this.categories.bulkAdd(defaultCategories as Category[]);
    }
}


export const db = new FinanzaDB();
