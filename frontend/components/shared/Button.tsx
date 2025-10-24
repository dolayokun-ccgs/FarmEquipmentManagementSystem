import React from 'react';
import Link from 'next/link';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'green' | 'orange' | 'outline-dark';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  href,
  onClick,
  type = 'button',
  disabled = false,
  fullWidth = false,
  className = '',
  icon,
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-bold uppercase tracking-wide rounded-[25px] transition-all duration-200 focus:outline-none focus:ring-3 focus:ring-[#fdca2e] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'bg-[#fdca2e] text-[#021f5c] hover:bg-[#021f5c] hover:text-[#fdca2e] shadow-md',
    secondary: 'bg-white border-2 border-[#021f5c] text-[#021f5c] hover:bg-[#021f5c] hover:text-white',
    outline: 'bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#021f5c]',
    'outline-dark': 'bg-transparent border-2 border-[#021f5c] text-[#021f5c] hover:bg-[#021f5c] hover:text-white',
    green: 'bg-[#2D7A3E] text-white hover:bg-[#7FBF7F] shadow-md',
    orange: 'bg-[#F47920] text-white hover:bg-[#FFB366] shadow-md',
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`;

  if (href) {
    return (
      <Link href={href} className={combinedClassName}>
        {icon && <span>{icon}</span>}
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={combinedClassName}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
}
