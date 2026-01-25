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
        /* Outer Layer: Handles Gradient/Background and Centering for Desktop */
        <div className="min-h-screen w-full flex justify-center bg-transparent">

            /* Main App Container: Full width on mobile, Fixed width on Desktop */
            <main className="w-full md:max-w-[480px] min-h-screen bg-white shadow-2xl relative pb-28 md:rounded-[40px] md:my-8 md:min-h-[calc(100vh-4rem)] md:h-fit overflow-hidden">
                <div className="h-full overflow-y-auto custom-scrollbar">
                    <Outlet />
                </div>

                {/* Bottom Nav */}
                <nav className="fixed bottom-0 md:absolute left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-100/50 z-50 w-full shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.05)]">
                    <div className="flex justify-around items-center h-[88px] pb-4 md:pb-0 md:h-20">
                        {navItems.map((item) => (
                            <Link
                                key={item.to}
                                to={item.to}
                                className={cn(
                                    "flex flex-col items-center justify-center w-full h-full space-y-1 group relative",
                                    path === item.to ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                <div className={cn(
                                    "p-2 rounded-2xl transition-all duration-300 relative",
                                    path === item.to ? "bg-indigo-50 -translate-y-1 shadow-sm" : "group-hover:bg-slate-50"
                                )}>
                                    {item.icon}
                                    {path === item.to && (
                                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-600 rounded-full"></span>
                                    )}
                                </div>
                                <span className={cn(
                                    "text-[10px] font-semibold tracking-wide transition-all duration-300",
                                    path === item.to ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 absolute bottom-2"
                                )}>
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
