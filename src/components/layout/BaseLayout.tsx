import { Outlet, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Wallet, PieChart, Settings } from "lucide-react";
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
        <div className="min-h-screen w-full flex justify-center bg-background-dark">

            <main className="w-full md:max-w-[480px] min-h-screen bg-background-dark shadow-2xl relative pb-24 md:rounded-[40px] md:my-8 md:min-h-[calc(100vh-4rem)] md:h-fit overflow-hidden border border-white/5">
                {/* Decorative Background Blobs */}
                <div className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none z-0"></div>

                <div className="h-full overflow-y-auto no-scrollbar relative z-10">
                    <Outlet />
                </div>

                {/* Bottom Nav - Glassmorphism */}
                <nav className="fixed bottom-0 md:absolute left-0 right-0 glass-panel border-t border-white/10 z-50 w-full mb-0 md:mb-0 md:rounded-b-[40px]">
                    <div className="flex justify-around items-center h-[80px] pb-2 md:pb-0">
                        {navItems.map((item) => {
                            const isActive = path === item.to;
                            return (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    className={cn(
                                        "flex flex-col items-center justify-center w-full h-full space-y-1 group relative",
                                        isActive ? "text-primary" : "text-slate-500 hover:text-slate-300"
                                    )}
                                >
                                    <div className={cn(
                                        "p-2 rounded-2xl transition-all duration-300 relative",
                                        isActive && "bg-primary/10 shadow-neon"
                                    )}>
                                        {item.icon}
                                    </div>
                                    <span className={cn(
                                        "text-[10px] font-bold tracking-widest uppercase transition-all duration-300",
                                        isActive ? "opacity-100" : "opacity-0 hidden"
                                    )}>
                                        {item.label}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </nav>
            </main>
        </div>
    );
}
