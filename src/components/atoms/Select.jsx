import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const Select = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  error,
  disabled = false,
  required = false,
  className = '',
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focused, setFocused] = useState(false);

  const selectedOption = options.find(opt => opt.value === value);
  const hasValue = value !== undefined && value !== null && value !== '';
  const shouldFloat = focused || hasValue || isOpen;

  const handleSelect = (optionValue) => {
    onChange?.(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          className={`
            w-full px-4 py-3 bg-surface/50 glass border border-glass-border rounded-lg
            text-left text-white
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-error focus:ring-error/50 focus:border-error' : ''}
            ${isOpen ? 'ring-2 ring-primary/50 border-primary' : ''}
          `}
          {...props}
        >
          <span className={selectedOption ? 'text-white' : 'text-gray-400'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ApperIcon name="ChevronDown" size={16} className="text-gray-400" />
            </motion.div>
          </div>
        </button>

        {label && (
          <motion.label
            initial={false}
            animate={{
              top: shouldFloat ? '0.5rem' : '50%',
              fontSize: shouldFloat ? '0.75rem' : '1rem',
              color: error ? '#EF4444' : focused || isOpen ? '#3B82F6' : '#9CA3AF',
              y: shouldFloat ? 0 : '-50%'
            }}
            transition={{ duration: 0.2 }}
            className="absolute left-4 pointer-events-none transform origin-left"
          >
            {label} {required && <span className="text-error">*</span>}
          </motion.label>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 z-50 mt-1 bg-surface glass border border-glass-border rounded-lg shadow-xl overflow-hidden"
          >
            <div className="max-h-60 overflow-y-auto">
              {options.map((option, index) => (
                <motion.button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.02 }}
                  className={`
                    w-full px-4 py-3 text-left hover:bg-primary/20 transition-colors
                    ${value === option.value ? 'bg-primary/30 text-white' : 'text-gray-300'}
                  `}
                >
                  {option.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

export default Select;