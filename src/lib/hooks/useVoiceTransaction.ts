import { useState, useRef, useEffect } from 'react';
import { db } from '../db';
import { useLiveQuery } from 'dexie-react-hooks';

interface VoiceResult {
    amount?: number;
    type?: 'INCOME' | 'EXPENSE';
    categoryId?: string;
    accountId?: string;
    note?: string;
    originalText: string;
}

export const useVoiceTransaction = () => {
    const [isListening, setIsListening] = useState(false);
    const [result, setResult] = useState<VoiceResult | null>(null);
    const recognitionRef = useRef<any>(null);

    // Fetch master data for matching
    const accounts = useLiveQuery(() => db.accounts.toArray()) || [];
    const categories = useLiveQuery(() => db.categories.toArray()) || [];

    useEffect(() => {
        if ('webkitSpeechRecognition' in window) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.lang = 'es-MX';
            recognitionRef.current.interimResults = false;

            recognitionRef.current.onstart = () => setIsListening(true);
            recognitionRef.current.onend = () => setIsListening(false);

            recognitionRef.current.onresult = (event: any) => {
                const text = event.results[0][0].transcript;
                processVoiceInput(text);
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
            };
        }
    }, [accounts, categories]);

    const processVoiceInput = (text: string) => {
        const lowerText = text.toLowerCase();
        let amount: number | undefined;
        let type: 'INCOME' | 'EXPENSE' | undefined;
        let categoryId: string | undefined;
        let accountId: string | undefined;

        // 1. Detect Amount (simple regex for now)
        const amountMatch = lowerText.match(/\d+/);
        if (amountMatch) {
            amount = parseInt(amountMatch[0], 10);
        }

        // 2. Detect Type
        if (lowerText.includes('gasto') || lowerText.includes('pagué') || lowerText.includes('compra') || lowerText.includes('salida')) {
            type = 'EXPENSE';
        } else if (lowerText.includes('ingreso') || lowerText.includes('cobré') || lowerText.includes('depósito') || lowerText.includes('recibí')) {
            type = 'INCOME';
        } else {
            type = 'EXPENSE'; // Default
        }

        // 3. Detect Account
        const matchedAccount = accounts.find(acc => lowerText.includes(acc.name.toLowerCase()));
        if (matchedAccount) {
            accountId = matchedAccount.id;
        }

        // 4. Detect Category
        const matchedCategory = categories.find(cat => lowerText.includes(cat.name.toLowerCase()));
        if (matchedCategory) {
            categoryId = matchedCategory.id;
        }

        // 5. Detect Note (Concept)
        let note = text;
        const conceptIndex = lowerText.indexOf('concepto');
        if (conceptIndex !== -1) {
            // Extract everything after "concepto "
            note = text.substring(conceptIndex + 8).trim();
            // Capitalize first letter of note
            note = note.charAt(0).toUpperCase() + note.slice(1);
        }

        setResult({
            amount,
            type,
            categoryId,
            accountId,
            note,
            originalText: text
        });
    };

    const startListening = () => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.start();
            } catch (e) {
                console.error("Error starting speech recognition:", e);
            }
        } else {
            alert("Tu navegador no soporta reconocimiento de voz.");
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    };

    const reset = () => setResult(null);

    return { isListening, result, startListening, stopListening, reset };
};
