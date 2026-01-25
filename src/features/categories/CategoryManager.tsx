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
        <div className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-lg group">
            <div className="flex items-center gap-3">
                <span className="text-2xl w-8 text-center">{category.icon}</span>
                <div>
                    <p className="font-medium text-sm">{category.name}</p>
                    <div className="h-1 w-12 rounded-full mt-1" style={{ backgroundColor: category.color }} />
                </div>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-blue-500" onClick={() => handleEdit(category)}>
                    <Edit2 className="h-4 w-4" />
                </Button>
                {!category.isSystem && (
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-red-500" onClick={() => handleDelete(category.id)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Tag className="h-5 w-5 text-indigo-500" /> Categorías
                </h3>
                <Button size="sm" variant="outline" onClick={handleCreate}>
                    <Plus className="h-4 w-4 mr-2" /> Nueva
                </Button>
            </div>

            <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gastos</h4>
                <div className="grid gap-2">
                    {expenseCats.map(c => <CategoryRow key={c.id} category={c} />)}
                </div>
            </div>

            <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ingresos</h4>
                <div className="grid gap-2">
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
