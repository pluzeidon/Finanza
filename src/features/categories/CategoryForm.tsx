import { useState } from "react";
import { CategoryRepository } from "../../lib/repositories";
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
    const [color, setColor] = useState(category?.color || "#0ddff2");
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
        } finally {
            setLoading(false);
        }
    };

    const emojiOptions = ["🍕", "🏠", "🚗", "💊", "🎉", "✈️", "💸", "🛒", "🎓", "📱", "💧", "⚡", "🏋️", "🐶", "🎁", "💼", "💰", "💵", "📈", "🏦"];
    const colorOptions = ["#0ddff2", "#f20d85", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#3b82f6", "#ef4444"];

    return (
        <form onSubmit={handleSubmit} className="space-y-6">

            {/* Type Selector - Neon Slide */}
            <div className="bg-black/40 p-1.5 rounded-xl border border-white/5 flex relative">
                <div
                    className="absolute inset-y-1.5 w-[calc(50%-6px)] bg-white/10 rounded-lg shadow-sm transition-all duration-300 ease-out"
                    style={{ left: type === 'EXPENSE' ? '6px' : 'calc(50% + 0px)' }}
                ></div>
                <button
                    type="button"
                    onClick={() => setType('EXPENSE')}
                    className={cn(
                        "flex-1 relative z-10 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 transition-colors",
                        type === 'EXPENSE' ? "text-red-400 drop-shadow-[0_0_5px_rgba(248,113,113,0.5)]" : "text-slate-500 hover:text-slate-300"
                    )}
                >
                    <TrendingDown className="h-4 w-4" /> Gasto
                </button>
                <button
                    type="button"
                    onClick={() => setType('INCOME')}
                    className={cn(
                        "flex-1 relative z-10 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 transition-colors",
                        type === 'INCOME' ? "text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]" : "text-slate-500 hover:text-slate-300"
                    )}
                >
                    <TrendingUp className="h-4 w-4" /> Ingreso
                </button>
            </div>

            {/* Name Input */}
            <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nombre</label>
                <div className="relative group">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xl pointer-events-none grayscale opacity-50">{icon}</span>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ej: Gimnasio"
                        className="block w-full pl-12 pr-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                        required
                        autoFocus
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                {/* Icons Grid */}
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Icono</label>
                    <div className="grid grid-cols-4 gap-2 bg-white/5 p-2 rounded-xl border border-white/5">
                        {emojiOptions.slice(0, 8).map(e => (
                            <button
                                key={e}
                                type="button"
                                onClick={() => setIcon(e)}
                                className={cn(
                                    "aspect-square flex items-center justify-center text-lg rounded-lg transition-all hover:bg-white/10 hover:scale-110",
                                    icon === e && "bg-primary/20 ring-1 ring-primary shadow-[0_0_10px_rgba(13,223,242,0.3)]"
                                )}
                            >
                                {e}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Colors Grid */}
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Color</label>
                    <div className="grid grid-cols-4 gap-2 bg-white/5 p-2 rounded-xl border border-white/5">
                        {colorOptions.map(c => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => setColor(c)}
                                className={cn(
                                    "aspect-square rounded-full transition-all hover:scale-110 border-2 border-transparent",
                                    color === c && "border-white scale-110 shadow-[0_0_10px]"
                                )}
                                style={{ backgroundColor: c, boxShadow: color === c ? `0 0 10px ${c}` : 'none' }}
                            />
                        ))}
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                        <span className="text-[10px] text-slate-500">Personalizado</span>
                        <input
                            type="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="bg-transparent border-0 w-6 h-6 p-0 cursor-pointer"
                        />
                    </div>
                </div>
            </div>

            <div className="flex gap-3 pt-2">
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
                    {loading ? "Guardando..." : (category ? "Actualizar" : "Crear")}
                </button>
            </div>
        </form>
    );
}
