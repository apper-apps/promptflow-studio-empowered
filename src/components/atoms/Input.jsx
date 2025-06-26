import { useState } from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const Input = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  icon,
  disabled = false,
  required = false,
  className = '',
  ...props
}) => {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const hasValue = value && value.length > 0;
  const shouldFloat = focused || hasValue;

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <ApperIcon name={icon} size={16} />
          </div>
        )}
        
        <input
          type={type === 'password' && showPassword ? 'text' : type}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          required={required}
          className={`
            w-full px-4 py-3 bg-surface/50 glass border border-glass-border rounded-lg
            text-white placeholder-transparent
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
            disabled:opacity-50 disabled:cursor-not-allowed
            ${icon ? 'pl-10' : ''}
            ${type === 'password' ? 'pr-10' : ''}
            ${error ? 'border-error focus:ring-error/50 focus:border-error' : ''}
          `}
          placeholder={placeholder}
          {...props}
        />

        {label && (
          <motion.label
            initial={false}
            animate={{
              top: shouldFloat ? '0.5rem' : '50%',
              fontSize: shouldFloat ? '0.75rem' : '1rem',
              color: error ? '#EF4444' : focused ? '#3B82F6' : '#9CA3AF',
              y: shouldFloat ? 0 : '-50%'
            }}
            transition={{ duration: 0.2 }}
            className={`
              absolute left-4 pointer-events-none transform origin-left
              ${icon ? 'left-10' : 'left-4'}
            `}
          >
            {label} {required && <span className="text-error">*</span>}
          </motion.label>
        )}

        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            <ApperIcon name={showPassword ? 'EyeOff' : 'Eye'} size={16} />
          </button>
        )}
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-sm text-error flex items-center gap-1"
        >
          <ApperIcon name="AlertCircle" size={12} />
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default Input;