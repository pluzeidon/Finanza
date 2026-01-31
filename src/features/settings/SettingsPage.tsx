import { useRef, useState } from "react";
import { DataManager } from "../../lib/dataManager";
import { Button } from "../../components/ui/button";
import { Download, Upload, ShieldCheck, Trash2 } from "lucide-react";
import { CategoryManager } from "../categories/CategoryManager";

export function SettingsPage() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [importing, setImporting] = useState(false);

    const handleExport = async () => {
        const encrypt = confirm("¿Quieres cifrar esta copia con contraseña?");
        let password;
        if (encrypt) {
            password = prompt("Introduce la contraseña para cifrar el archivo:");
            if (!password) return; // Cancelled
        }
        await DataManager.exportData(password || undefined);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!confirm('Esto SOBRESCRIBIRÁ todos los datos actuales con la copia. ¿Estás seguro?')) {
            e.target.value = ''; // Reset
            return;
        }

        setImporting(true);
        try {
            await DataManager.importData(file);
            alert('¡Restaurado con éxito!');
            window.location.reload();
        } catch (error: any) {
            if (error.message === "PASSWORD_REQUIRED") {
                const password = prompt("Esta copia está cifrada. Introduce la contraseña:");
                if (password) {
                    try {
                        await DataManager.importData(file, password);
                        alert('¡Restaurado con éxito!');
                        window.location.reload();
                        return;
                    } catch (retryError) {
                        console.error(retryError);
                        alert('Contraseña incorrecta o archivo dañado.');
                    }
                }
            } else {
                console.error(error);
                alert('Error restaurando datos.');
            }
        } finally {
            setImporting(false);
            e.target.value = '';
        }
    };

    return (
        <div className="p-4 space-y-6 pb-24 text-white">
            <h1 className="text-2xl font-bold">Ajustes</h1>

            {/* Categories Management */}
            <div className="glass-panel p-6 rounded-2xl">
                <CategoryManager />
            </div>

            {/* Data Management */}
            <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
                {/* Decorative glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

                <div className="flex items-center gap-3 mb-6 relative z-10">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                        <ShieldCheck className="h-6 w-6 text-blue-400" />
                    </div>
                    <h2 className="text-lg font-bold">Soberanía de Datos</h2>
                </div>

                <div className="space-y-6 relative z-10">
                    <p className="text-sm text-slate-400 leading-relaxed bg-black/20 p-4 rounded-xl border border-white/5">
                        Tus datos se guardan <strong className="text-white">100% localmente</strong> en este dispositivo.
                        No tenemos acceso a ellos. Recuerda hacer copias de seguridad regularmente.
                    </p>

                    <div className="flex flex-col gap-3">
                        <Button variant="outline" className="justify-start gap-4 h-12 bg-transparent border-white/10 hover:bg-white/5 text-slate-300 hover:text-white" onClick={handleExport}>
                            <Download className="h-5 w-5 text-primary" />
                            <div className="flex flex-col items-start">
                                <span className="font-semibold text-sm">Exportar Copia de Seguridad</span>
                                <span className="text-[10px] text-slate-500">Formato JSON seguro</span>
                            </div>
                        </Button>

                        <div className="relative">
                            <Button variant="outline" className="w-full justify-start gap-4 h-12 bg-transparent border-white/10 hover:bg-white/5 text-slate-300 hover:text-white" onClick={handleImportClick} disabled={importing}>
                                <Upload className="h-5 w-5 text-emerald-400" />
                                <div className="flex flex-col items-start">
                                    <span className="font-semibold text-sm">{importing ? 'Restaurando...' : 'Restaurar Copia'}</span>
                                    <span className="text-[10px] text-slate-500">Desde archivo JSON</span>
                                </div>
                            </Button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept=".json"
                                onChange={handleFileChange}
                            />
                        </div>

                        <Button variant="ghost" className="justify-start gap-4 h-12 text-red-400 hover:text-red-300 hover:bg-red-400/10" onClick={() => {
                            if (confirm("PELIGRO: Esto borrará TODOS tus datos permanentemente. ¿Estás seguro?")) {
                                DataManager.clearAll();
                                window.location.reload();
                            }
                        }}>
                            <Trash2 className="h-5 w-5" />
                            <span className="font-medium">Borrar Todos los Datos</span>
                        </Button>
                    </div>
                </div>
            </div>

            <div className="text-center pb-8 opacity-40">
                <p className="text-xs font-mono mb-1">Finanza v1.0.0</p>
                <p className="text-[10px]">Quantum Edition</p>
            </div>
        </div>
    );
}
