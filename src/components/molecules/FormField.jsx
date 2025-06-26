import React, { useState } from "react";
import { motion } from "framer-motion";
import AppIcon from "@/components/ApperIcon";
import Select from "@/components/atoms/Select";
import Input from "@/components/atoms/Input";

const FormField = ({
  type = 'text', 
  options = [], 
  ...props 
}) => {
  if (type === 'select') {
    const selectOptions = options.map(opt => ({
      value: typeof opt === 'string' ? opt : opt.value,
      label: typeof opt === 'string' ? opt : opt.label
    }));

    return <Select options={selectOptions} {...props} />;
  }

if (type === 'textarea') {
    const [focused, setFocused] = React.useState(false);
    const hasValue = props.value && props.value.length > 0;
    const shouldFloat = focused || hasValue;

    return (
      <div className="relative">
        <textarea
          className={`
            w-full px-4 py-3 bg-surface/50 glass border border-glass-border rounded-lg
            text-white placeholder-transparent resize-none
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
            disabled:opacity-50 disabled:cursor-not-allowed
            ${props.error ? 'border-error focus:ring-error/50 focus:border-error' : ''}
          `}
          rows={4}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        
        {props.label && (
          <motion.label
            initial={false}
            animate={{
              top: shouldFloat ? '0.5rem' : '0.75rem',
              fontSize: shouldFloat ? '0.75rem' : '1rem',
              color: props.error ? '#EF4444' : focused ? '#3B82F6' : '#9CA3AF',
              y: shouldFloat ? 0 : '0'
            }}
            transition={{ duration: 0.2 }}
            className="absolute left-4 pointer-events-none transform origin-left bg-surface px-1"
          >
            {props.label} {props.required && <span className="text-error">*</span>}
          </motion.label>
        )}

        {props.error && (
          <p className="mt-1 text-sm text-error flex items-center gap-1">
            <AppIcon name="AlertCircle" size={12} />
            {props.error}
          </p>
        )}
      </div>
    );
  }

  return <Input type={type} {...props} />;
};

export default FormField;