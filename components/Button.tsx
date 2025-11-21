import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon,
  className = '',
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-colors duration-200 rounded-md focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed border";
  
  const variants = {
    primary: "bg-white text-black border-white hover:bg-neutral-200 hover:border-neutral-200",
    secondary: "bg-neutral-800 text-neutral-200 border-neutral-700 hover:bg-neutral-700 hover:border-neutral-600",
    danger: "bg-red-950/30 text-red-400 border-red-900/50 hover:bg-red-900/50 hover:border-red-800",
    ghost: "bg-transparent text-neutral-400 border-transparent hover:text-white hover:bg-neutral-800"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};