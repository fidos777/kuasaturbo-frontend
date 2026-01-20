'use client';

interface InputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  label?: string;
  type?: string;
  required?: boolean;
  name?: string;
}

export function Input({
  value,
  onChange,
  placeholder,
  disabled = false,
  className = '',
  label,
  type = 'text',
  required = false,
  name,
}: InputProps) {
  const baseClasses = 'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FE4800] focus:border-transparent disabled:bg-slate-100';

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        name={name}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        className={`${baseClasses} ${className}`}
      />
    </div>
  );
}

export default Input;
