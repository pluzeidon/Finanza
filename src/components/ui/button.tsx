import * as React from "react"
import { cn } from "../../lib/utils"

// Note: I need class-variance-authority for this pattern. 
// If not installed, I should handle it simply or install it. 
// I'll assume I can use simple strings or install it.
// Wait, I only requested clsx and tailwind-merge. I'll stick to simple props or install CVA.
// Let's stick to simple props to avoid extra deps if possible, or just install cva quickly.
// Actually, CVA is standard for ShadCN. I'll just use a simpler approach for now to be fast.

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline';
    size?: 'sm' | 'md' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', ...props }, ref) => {

        const variants = {
            primary: "bg-slate-900 text-white hover:bg-slate-800",
            secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
            ghost: "hover:bg-slate-100 hover:text-slate-900",
            destructive: "bg-red-500 text-white hover:bg-red-600",
            outline: "border border-slate-200 bg-white hover:bg-slate-100 text-slate-900"
        };

        const sizes = {
            sm: "h-9 px-3 text-xs",
            md: "h-10 px-4 py-2",
            lg: "h-12 px-8 text-lg",
            icon: "h-10 w-10 p-2 flex items-center justify-center"
        };

        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
