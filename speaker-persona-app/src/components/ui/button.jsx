import React from 'react'
import { cn } from '../../lib/utils'

const Button = React.forwardRef(({ className, variant = 'primary', size = 'default', ...props }, ref) => {
  const variants = {
    primary: 'bg-accent-700 hover:bg-accent-800 text-white',
    secondary: 'bg-white hover:bg-primary-50 text-primary-800 border border-primary-200',
    ghost: 'hover:bg-primary-50 text-primary-700',
    link: 'text-accent-700 underline-offset-4 hover:underline'
  }
  
  const sizes = {
    default: 'h-12 px-6 py-3',
    sm: 'h-9 rounded-md px-3',
    lg: 'h-14 rounded-lg px-8',
    icon: 'h-10 w-10'
  }

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className
      )}
      ref={ref}
      {...props}
    />
  )
})

Button.displayName = 'Button'

export { Button }
