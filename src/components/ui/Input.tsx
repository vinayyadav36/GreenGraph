import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, id, className = '', ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).slice(2)}`;
    return (
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[
            'w-full px-3 py-2 text-sm border rounded-lg transition-colors duration-150',
            'placeholder-gray-400 bg-white text-gray-900',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
            error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          aria-invalid={error ? 'true' : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="text-xs text-red-600 mt-0.5" role="alert">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={`${inputId}-helper`} className="text-xs text-gray-500 mt-0.5">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
