import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import AppIcon from "@/components/atoms/AppIcon";
import React from "react";
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
    return (
      <div className="relative">
        <textarea
          className={`
            w-full px-4 py-3 bg-surface/50 glass border border-glass-border rounded-lg
            text-white placeholder-gray-400 resize-none
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
            disabled:opacity-50 disabled:cursor-not-allowed
            ${props.error ? 'border-error focus:ring-error/50 focus:border-error' : ''}
          `}
          rows={4}
          {...props}
        />
        
        {props.label && (
          <label className="absolute -top-2 left-3 bg-background px-1 text-xs text-gray-400">
            {props.label} {props.required && <span className="text-error">*</span>}
          </label>
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