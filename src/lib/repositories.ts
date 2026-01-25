import { db, type Account, type Category, type Transaction } from "./db";

// --- Accounts CRUD ---

export const AccountRepository = {
    create: async (account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => {
        return await db.accounts.add(account as Account);
    },

    getAll: async () => {
        return await db.accounts.toArray();
    },

    getActive: async () => {
        return await db.accounts.filter(a => !a.archived).toArray();
    },

    getById: async (id: string) => {
        return await db.accounts.get(id);
    },

    update: async (id: string, updates: Partial<Account>) => {
        return await db.accounts.update(id, updates);
    },

    archive: async (id: string) => {
        return await db.accounts.update(id, { archived: true });
    },

    deleteHard: async (id: string) => {
        // Warning: This should probably check for transactions or cascade delete
        return await db.transaction('rw', db.accounts, db.transactions, async () => {
            await db.transactions.where({ accountId: id }).delete();
            await db.accounts.delete(id);
        });
    }
};

// --- Transactions CRUD ---

export const TransactionRepository = {
    create: async (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
        return await db.transactions.add(transaction as Transaction);
    },

    getByAccount: async (accountId: string) => {
        return await db.transactions.where({ accountId }).sortBy('date'); // Descending? .reverse()
    },

    getRecent: async (limit: number = 5) => {
        return await db.transactions.orderBy('date').reverse().limit(limit).toArray();
    },

    delete: async (id: string) => {
        return await db.transactions.delete(id);
    }
};

// --- Categories CRUD ---

export const CategoryRepository = {
    getAll: async () => {
        return await db.categories.toArray();
    },

    create: async (data: Partial<Category>) => {
        return await db.categories.add(data as Category);
    },

    update: async (id: string, data: Partial<Category>) => {
        return await db.categories.update(id, data);
    },

    delete: async (id: string) => {
        // Check constraints? Maybe check if transactions exist?
        // For now, simple delete. Ideally, we should migrate transactions to 'Uncategorized'
        return await db.categories.delete(id);
    }
};
