import { useState } from "react";
import { CategoryRepository } from "../../lib/repositories";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { type Category, type CategoryType } from "../../lib/db";
import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "../../lib/utils";

interface CategoryFormProps {
    category?: Category;
    onSuccess: () => void;
    onCancel: () => void;
}

export function CategoryForm({ category, onSuccess, onCancel }: CategoryFormProps) {
    const [name, setName] = useState(category?.name || "");
    const [icon, setIcon] = useState(category?.icon || "🏷️");
    const [color, setColor] = useState(category?.color || "#94a3b8");
    const [type, setType] = useState<CategoryType>(category?.type || 'EXPENSE');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = { name, icon, color, type };

            if (category?.id) {
                await CategoryRepository.update(category.id, data);
            } else {
                await CategoryRepository.create(data);
            }
            onSuccess();
        } catch (error) {
            console.error(error);
            alert("Error saving category");
        } finally {
            setLoading(false);
        }
    };

    const emojiOptions = ["🍕", "🏠", "🚗", "💊", "🎉", "✈️", "💸", "🛒", "🎓", "📱", "💧", "⚡", "🏋️", "🐶", "🎁", "💼", "💰", "💵", "📈", "🏦"];

    return (
        <form onSubmit={handleSubmit} className="space-y-4">

            {/* Type Selector */}
            <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
                <button
                    type="button"
                    onClick={() => setType('EXPENSE')}
                    className={cn(
                        "flex-1 py-1.5 text-xs font-medium rounded-md flex items-center justify-center gap-2 transition-all",
                        type === 'EXPENSE' ? "bg-white shadow text-red-600" : "text-slate-500 hover:text-slate-700"
                    )}
                >
                    <TrendingDown className="h-4 w-4" /> Gasto
                </button>
                <button
                    type="button"
                    onClick={() => setType('INCOME')}
                    className={cn(
                        "flex-1 py-1.5 text-xs font-medium rounded-md flex items-center justify-center gap-2 transition-all",
                        type === 'INCOME' ? "bg-white shadow text-green-600" : "text-slate-500 hover:text-slate-700"
                    )}
                >
                    <TrendingUp className="h-4 w-4" /> Ingreso
                </button>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: Gimnasio"
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Icono</label>
                    <div className="grid grid-cols-5 gap-2 mt-1">
                        {emojiOptions.slice(0, 10).map(e => (
                            <button
                                key={e}
                                type="button"
                                onClick={() => setIcon(e)}
                                className={cn("text-xl p-1 rounded hover:bg-slate-100", icon === e && "bg-slate-200 ring-1 ring-slate-300")}
                            >
                                {e}
                            </button>
                        ))}
                    </div>
                    <div className="mt-2 flex gap-2">
                        <Input
                            value={icon}
                            onChange={(e) => setIcon(e.target.value)}
                            className="w-12 text-center text-xl p-0 h-10"
                        />
                        <span className="text-xs text-slate-400 self-center">Personalizado</span>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Color</label>
                    <Input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="h-10 p-1 w-full"
                    />
                </div>
            </div>

            <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
                <Button type="submit" disabled={loading}>
                    {loading ? "Guardando..." : (category ? "Actualizar" : "Crear")}
                </Button>
            </div>
        </form>
    );
}
