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
            <main className="w-full md:max-w-md mx-auto min-h-screen bg-white shadow-sm relative pb-24">
                <Outlet />

                {/* Bottom Nav */}
                <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-100 z-50 w-full md:max-w-md mx-auto shadow-[0_-4px_20px_-1px_rgba(0,0,0,0.05)]">
                    <div className="flex justify-around items-center h-20">
                        {navItems.map((item) => (
                            <Link
                                key={item.to}
                                to={item.to}
                                className={cn(
                                    "flex flex-col items-center justify-center w-full h-full space-y-1.5 transition-all duration-200",
                                    path === item.to
                                        ? "text-indigo-600 scale-105"
                                        : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                                )}
                            >
                                <div className={cn("p-1.5 rounded-xl transition-colors", path === item.to ? "bg-indigo-50" : "")}>
                                    {item.icon}
                                </div>
                                <span className={cn("text-[10px] font-medium transition-colors", path === item.to ? "text-indigo-600" : "text-slate-400")}>
                                    {item.label}
                                </span>
                            </Link>
                        ))}
                    </div>
                </nav>
            </main>
        </div>
    );
}
