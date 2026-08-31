import * as React from "react"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2"
    
    let variantStyles = ""
    if (variant === "default") {
      variantStyles = "bg-slate-900 text-slate-50 shadow hover:bg-slate-900/90"
    } else if (variant === "outline") {
      variantStyles = "border border-slate-200 bg-white shadow-sm hover:bg-slate-100 hover:text-slate-900 text-slate-700"
    } else if (variant === "ghost") {
      variantStyles = "hover:bg-slate-100 hover:text-slate-900 text-slate-700"
    }

    return (
      <button
        className={`${baseStyles} ${variantStyles} ${className || ""}`}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
