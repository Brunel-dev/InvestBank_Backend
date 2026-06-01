import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "w-full py-3 px-4 rounded-lg font-bold transition-all duration-200 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-500/30",
    secondary: "bg-slate-700 hover:bg-slate-600 text-slate-200",
    danger: "bg-red-500 hover:bg-red-400 text-white",
    success: "bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/30",
    warning: "bg-amber-500 hover:bg-amber-400 text-white shadow-lg shadow-amber-500/30",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`} 
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? "Chargement..." : children}
    </button>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl ${className}`}>
    {children}
  </div>
);

const fieldBase =
  "w-full rounded-lg px-4 py-2.5 text-sm bg-slate-800/60 border border-slate-600/70 text-slate-100 " +
  "placeholder:text-slate-500 outline-none transition-all duration-150 " +
  "hover:border-slate-500 hover:bg-slate-800 " +
  "focus:bg-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 " +
  "disabled:opacity-50 disabled:cursor-not-allowed " +
  "[color-scheme:dark] [&::-webkit-calendar-picker-indicator]:invert";

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({
  className = '',
  ...props
}) => (
  <input className={`${fieldBase} ${className}`} {...props} />
);

export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({
  className = '',
  ...props
}) => (
  <textarea
    className={`${fieldBase} leading-relaxed resize-y min-h-[100px] ${className}`}
    {...props}
  />
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <div className="relative">
    <select
      className={`${fieldBase} appearance-none pr-10 cursor-pointer ${className}`}
      {...props}
    >
      {children}
    </select>
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
        fill="currentColor"
      />
    </svg>
  </div>
);


interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const bgColor = {
    success: 'bg-emerald-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  }[type];

  React.useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`${bgColor} text-white px-4 py-3 rounded-lg shadow-lg max-w-md w-full`}>
      <div className="flex justify-between items-center">
        <span>{message}</span>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 text-sm font-bold"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default Toast;