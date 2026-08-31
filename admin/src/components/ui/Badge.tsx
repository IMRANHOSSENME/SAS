import * as React from "react"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "destructive" | "warning" | "secondary" | "outline"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const baseStyles = "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
  
  let variantStyles = ""
  switch (variant) {
    case "success":
      variantStyles = "bg-green-100 text-green-700"
      break
    case "destructive":
      variantStyles = "bg-red-100 text-red-700"
      break
    case "warning":
      variantStyles = "bg-yellow-100 text-yellow-700"
      break
    case "secondary":
      variantStyles = "bg-slate-100 text-slate-900"
      break
    case "outline":
      variantStyles = "text-slate-950 border border-slate-200"
      break
    default:
      variantStyles = "bg-slate-900 text-slate-50 shadow"
  }

  return (
    <div className={`${baseStyles} ${variantStyles} ${className || ""}`} {...props} />
  )
}

export { Badge }
