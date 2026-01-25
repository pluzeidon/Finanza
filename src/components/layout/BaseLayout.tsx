import { Outlet, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Wallet, Settings, PieChart } from "lucide-react";
import { cn } from "../../lib/utils";

export function BaseLayout() {
    const location = useLocation();
    const path = location.pathname;

    const navItems = [
        { icon: <LayoutDashboard className="h-6 w-6" />, label: "Inicio", to: "/" },
        { icon: <Wallet className="h-6 w-6" />, label: "Cuentas", to: "/accounts" },
        { icon: <PieChart className="h-6 w-6" />, label: "Reportes", to: "/reports" },
        { icon: <Settings className="h-6 w-6" />, label: "Ajustes", to: "/settings" },
    ];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            <main className="max-w-md mx-auto min-h-screen bg-white shadow-sm relative pb-20">
                <Outlet />

                {/* Bottom Nav */}
                <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 max-w-md mx-auto shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                    <div className="flex justify-around items-center h-16">
                        {navItems.map((item) => (
                            <Link
                                key={item.to}
                                to={item.to}
                                className={cn(
                                    "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                                    path === item.to ? "text-slate-900" : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                {item.icon}
                                <span className="text-[10px] font-medium">{item.label}</span>
                            </Link>
                        ))}
                    </div>
                </nav>
            </main>
        </div>
    );
}
