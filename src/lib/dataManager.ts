import { db } from './db';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { utils, writeFile } from 'xlsx';

export const DataManager = {
    /**
     * Encrypts text using a password.
     * Returns JSON string with { iv, salt, data }.
     */
    encrypt: async (data: string, password: string) => {
        const enc = new TextEncoder();
        const salt = window.crypto.getRandomValues(new Uint8Array(16));
        const iv = window.crypto.getRandomValues(new Uint8Array(12));

        const keyMaterial = await window.crypto.subtle.importKey(
            "raw", enc.encode(password), { name: "PBKDF2" }, false, ["deriveKey"]
        );

        const key = await window.crypto.subtle.deriveKey(
            { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
            keyMaterial,
            { name: "AES-GCM", length: 256 },
            false,
            ["encrypt"]
        );

        const encryptedContent = await window.crypto.subtle.encrypt(
            { name: "AES-GCM", iv },
            key,
            enc.encode(data)
        );

        // Convert buffers to Base64 for storage
        const bufferToBase64 = (buf: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(buf)));

        return JSON.stringify({
            encryption: "AES-GCM",
            iv: bufferToBase64(iv.buffer),
            salt: bufferToBase64(salt.buffer),
            data: bufferToBase64(encryptedContent)
        });
    },

    /**
     * Decrypts text using a password.
     */
    decrypt: async (encryptedPackage: string, password: string) => {
        try {
            const pkg = JSON.parse(encryptedPackage);
            if (pkg.encryption !== "AES-GCM") throw new Error("Unknown encryption");

            const enc = new TextEncoder();
            const base64ToBuffer = (str: string) => Uint8Array.from(atob(str), c => c.charCodeAt(0));

            const salt = base64ToBuffer(pkg.salt);
            const iv = base64ToBuffer(pkg.iv);
            const data = base64ToBuffer(pkg.data);

            const keyMaterial = await window.crypto.subtle.importKey(
                "raw", enc.encode(password), { name: "PBKDF2" }, false, ["deriveKey"]
            );

            const key = await window.crypto.subtle.deriveKey(
                { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
                keyMaterial,
                { name: "AES-GCM", length: 256 },
                false,
                ["decrypt"]
            );

            const decryptedContent = await window.crypto.subtle.decrypt(
                { name: "AES-GCM", iv },
                key,
                data
            );

            return new TextDecoder().decode(decryptedContent);
        } catch (e) {
            throw new Error("Invalid password or corrupted file");
        }
    },

    exportData: async (password?: string) => {
        try {
            const [accounts, transactions, categories, budgets, goals] = await Promise.all([
                db.accounts.toArray(),
                db.transactions.toArray(),
                db.categories.toArray(),
                db.budgets.toArray(),
                db.goals.toArray()
            ]);

            const backup = {
                meta: {
                    version: 1,
                    app: 'Finanza',
                    timestamp: new Date().toISOString()
                },
                data: { accounts, transactions, categories, budgets, goals }
            };

            let content = JSON.stringify(backup, null, 2);
            let filename = `finanza_backup_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.json`;

            if (password) {
                content = await DataManager.encrypt(content, password);
                filename = filename.replace('.json', '.enc.json');
            }

            const blob = new Blob([content], { type: 'application/json' });
            saveAs(blob, filename);

            return true;
        } catch (error) {
            console.error('Export failed:', error);
            throw error;
        }
    },

    importData: async (file: File, password?: string) => {
        return new Promise<void>((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = async (e) => {
                try {
                    let content = e.target?.result as string;

                    // Try to detect if encrypted
                    let backup;
                    try {
                        const potentialPkg = JSON.parse(content);
                        if (potentialPkg.encryption && potentialPkg.data) {
                            if (!password) throw new Error("PASSWORD_REQUIRED");
                            content = await DataManager.decrypt(content, password);
                            backup = JSON.parse(content);
                        } else {
                            backup = potentialPkg;
                        }
                    } catch (err: any) {
                        if (err.message === "PASSWORD_REQUIRED") throw err;
                        if (!backup) backup = JSON.parse(content);
                    }

                    if (!backup.meta || backup.meta.app !== 'Finanza') {
                        throw new Error('Invalid backup file format');
                    }

                    // Transactional Restore: Pass tables as array or fewer args
                    await db.transaction('rw', [db.accounts, db.transactions, db.categories, db.budgets, db.goals], async () => {
                        await Promise.all([
                            db.accounts.clear(), db.transactions.clear(), db.categories.clear(), db.budgets.clear(), db.goals.clear()
                        ]);
                        if (backup.data.accounts?.length) await db.accounts.bulkAdd(backup.data.accounts);
                        if (backup.data.transactions?.length) await db.transactions.bulkAdd(backup.data.transactions);
                        if (backup.data.categories?.length) await db.categories.bulkAdd(backup.data.categories);
                        if (backup.data.budgets?.length) await db.budgets.bulkAdd(backup.data.budgets);
                        if (backup.data.goals?.length) await db.goals.bulkAdd(backup.data.goals);
                    });

                    resolve();
                } catch (error) {
                    reject(error);
                }
            };

            reader.readAsText(file);
        });
    },

    exportToExcel: async () => {
        try {
            const [accounts, transactions, categories] = await Promise.all([
                db.accounts.toArray(),
                db.transactions.toArray(),
                db.categories.toArray()
            ]);

            const wb = utils.book_new();

            // 1. Sheet: "Resumen Cuentas"
            const accData = accounts.map(acc => ({
                Nombre: acc.name,
                Tipo: acc.type,
                Moneda: acc.currency,
                Balance_Actual: acc.initialBalance,
                Color: acc.color,
                Creada: format(new Date(acc.createdAt), 'yyyy-MM-dd')
            }));
            const wsAcc = utils.json_to_sheet(accData);

            // Auto-width columns for Accounts
            const accCols = [{ wch: 20 }, { wch: 10 }, { wch: 8 }, { wch: 15 }, { wch: 10 }, { wch: 12 }];
            wsAcc['!cols'] = accCols;

            utils.book_append_sheet(wb, wsAcc, "Resumen Cuentas");

            // 2. Sheets: One per Account (Transactions)
            for (const account of accounts) {
                // Filter transactions for this account (Source or Destination)
                const accountTxs = transactions.filter(tx =>
                    tx.accountId === account.id || tx.transferToAccountId === account.id
                );

                if (accountTxs.length === 0) continue;

                // Map Data
                const sheetData = accountTxs.map(tx => {
                    const category = categories.find(c => c.id === tx.categoryId);
                    const isTransferOrigin = tx.accountId === account.id;
                    const transferPartnerId = isTransferOrigin ? tx.transferToAccountId : tx.accountId;
                    const transferPartner = transferPartnerId ? accounts.find(a => a.id === transferPartnerId) : null;

                    // Determine amount sign relative to this account
                    let amount = tx.amount;
                    if (tx.type === 'EXPENSE') {
                        amount = -Math.abs(tx.amount);
                    } else if (tx.type === 'INCOME') {
                        amount = Math.abs(tx.amount);
                    } else if (tx.type === 'TRANSFER') {
                        if (isTransferOrigin) {
                            amount = -Math.abs(tx.amount); // Outgoing
                        } else {
                            amount = Math.abs(tx.amount); // Incoming
                        }
                    }

                    return {
                        Fecha: format(new Date(tx.date), 'yyyy-MM-dd'),
                        Hora: format(new Date(tx.createdAt), 'HH:mm'),
                        Tipo: tx.type,
                        Categoria: category?.name || (tx.type === 'TRANSFER' ? 'Transferencia' : 'Sin Categoría'),
                        Nota: tx.note || '',
                        Monto: amount,
                        Moneda: account.currency,
                        Contraparte: transferPartner ? transferPartner.name : (tx.payee || ''),
                        Estado: tx.status
                    };
                });

                // Sort: Oldest to Newest (Ascending)
                sheetData.sort((a, b) => new Date(a.Fecha).getTime() - new Date(b.Fecha).getTime());

                // Create Sheet
                const ws = utils.json_to_sheet(sheetData);

                // Auto-width columns
                const wscols = [
                    { wch: 12 }, { wch: 8 }, { wch: 12 }, { wch: 20 },
                    { wch: 25 }, { wch: 12 }, { wch: 8 }, { wch: 20 }, { wch: 10 }
                ];
                ws['!cols'] = wscols;

                // Sanitize sheet name
                let sheetName = account.name.replace(/[:\\\/?*\[\]]/g, '').substring(0, 30);
                if (wb.SheetNames.includes(sheetName)) {
                    sheetName = `${sheetName}_${account.id.substring(0, 4)}`;
                }

                utils.book_append_sheet(wb, ws, sheetName);
            }

            // 3. Write File
            writeFile(wb, `Finanza_Detallado_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);

            return true;
        } catch (error) {
            console.error('Excel Export failed:', error);
            throw error;
        }
    },

    clearAll: async () => {
        await db.transaction('rw', [db.accounts, db.transactions, db.categories, db.budgets, db.goals], async () => {
            await Promise.all([
                db.accounts.clear(),
                db.transactions.clear(),
                db.categories.clear(),
                db.budgets.clear(),
                db.goals.clear()
            ]);
        });
    }
};
