import { useRef, useState } from "react";
import { DataManager } from "../../lib/dataManager";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
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
        <div className="p-4 space-y-6 pb-24">
            <h1 className="text-2xl font-bold">Ajustes</h1>

            {/* Categories Management */}
            <Card>
                <CardContent className="p-4">
                    <CategoryManager />
                </CardContent>
            </Card>

            {/* Data Management */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-blue-500" />
                        Soberanía de Datos
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-slate-500">
                        Tus datos se guardan 100% localmente en este dispositivo. We have no access to it.
                        Haz copias de seguridad regularmente.
                    </p>

                    <div className="flex flex-col gap-3">
                        <Button variant="outline" className="justify-start gap-3" onClick={handleExport}>
                            <Download className="h-4 w-4" />
                            Exportar Copia (JSON)
                        </Button>

                        <Button variant="outline" className="justify-start gap-3" onClick={handleImportClick} disabled={importing}>
                            <Upload className="h-4 w-4" />
                            {importing ? 'Importando...' : 'Restaurar Copia'}
                        </Button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept=".json"
                            onChange={handleFileChange}
                        />

                        <Button variant="ghost" className="justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                            Borrar Todos los Datos
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="text-center text-xs text-slate-400 mt-8">
                Finanza v1.0.0
            </div>
        </div>
    );
}
