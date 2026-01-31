import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { CategoryRepository } from "../../lib/repositories";
import { Button } from "../../components/ui/button";
import { type Category } from "../../lib/db";
import { Trash2, Edit2, Plus, Tag } from "lucide-react";
import { Dialog } from "../../components/ui/dialog";
import { CategoryForm } from "./CategoryForm";

export function CategoryManager() {
    const categories = useLiveQuery(() => CategoryRepository.getAll());
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const handleDelete = async (id: string) => {
        if (confirm("¿Seguro que quieres borrar esta categoría?")) {
            await CategoryRepository.delete(id);
        }
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setIsFormOpen(true);
    };

    const handleCreate = () => {
        setEditingCategory(null);
        setIsFormOpen(true);
    };

    // Group by type
    const expenseCats = categories?.filter(c => c.type === 'EXPENSE') || [];
    const incomeCats = categories?.filter(c => c.type === 'INCOME') || [];

    const CategoryRow = ({ category }: { category: Category }) => (
        <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 group transition-colors cursor-pointer border border-transparent hover:border-white/5" onClick={() => handleEdit(category)}>
            <div className="flex items-center gap-4">
                <div className="size-10 rounded-lg flex items-center justify-center bg-white/5 border border-white/5">
                    <span className="text-xl">{category.icon}</span>
                </div>
                <div>
                    <p className="font-medium text-sm text-white">{category.name}</p>
                    <div className="h-1 w-12 rounded-full mt-1.5 shadow-[0_0_5px]" style={{ backgroundColor: category.color, boxShadow: `0 0 8px ${category.color}` }} />
                </div>
            </div>

            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!category.isSystem && (
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-500 hover:text-red-400 hover:bg-red-400/10" onClick={(e) => { e.stopPropagation(); handleDelete(category.id); }}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                )}
                <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-500 hover:text-primary hover:bg-primary/10">
                    <Edit2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                    <Tag className="h-5 w-5 text-primary" /> Categorías
                </h3>
                <Button size="sm" variant="outline" onClick={handleCreate} className="bg-transparent border-white/10 hover:bg-white/5 text-primary hover:text-primary">
                    <Plus className="h-4 w-4 mr-2" /> Nueva
                </Button>
            </div>

            <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Gastos</h4>
                <div className="space-y-1">
                    {expenseCats.map(c => <CategoryRow key={c.id} category={c} />)}
                </div>
            </div>

            <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Ingresos</h4>
                <div className="space-y-1">
                    {incomeCats.map(c => <CategoryRow key={c.id} category={c} />)}
                </div>
            </div>

            <Dialog
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title={editingCategory ? "Editar Categoría" : "Nueva Categoría"}
            >
                <CategoryForm
                    category={editingCategory || undefined}
                    onSuccess={() => setIsFormOpen(false)}
                    onCancel={() => setIsFormOpen(false)}
                />
            </Dialog>
        </div>
    );
}
