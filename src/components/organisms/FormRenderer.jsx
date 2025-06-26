import React, { useState } from "react";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import FormField from "@/components/molecules/FormField";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";

const FormRenderer = ({ 
  fields = [], 
  onSubmit, 
  loading = false,
  className = '' 
}) => {
  const [responses, setResponses] = useState({});
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const [isMultiStep] = useState(false); // Can be made configurable via props if needed
  const handleChange = (variable, value) => {
    setResponses(prev => ({ ...prev, [variable]: value }));
    // Clear error when user starts typing
    if (errors[variable]) {
      setErrors(prev => ({ ...prev, [variable]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    fields.forEach(field => {
      if (field.required && (!responses[field.variable] || responses[field.variable].trim() === '')) {
        newErrors[field.variable] = `${field.label} is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSubmit?.(responses);
  };

  if (fields.length === 0) {
    return (
      <div className={`${className}`}>
        <Card className="text-center py-12">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <ApperIcon name="FormInput" size={32} className="text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No Form Fields</h3>
          <p className="text-gray-400">Add nodes to your prompt chain to generate form fields</p>
        </Card>
      </div>
    );
  }

  return (
    <div className={className}>
      <Card>
        <div className="p-6 border-b border-glass-border">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <ApperIcon name="FileText" size={24} />
            Generated Form
          </h2>
          <p className="text-gray-400 mt-1">Fill out the form to execute your prompt chain</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
<div className="space-y-6">
            {(() => {
              const fieldsPerStep = 3;
              const startIndex = isMultiStep && fields.length > fieldsPerStep ? currentStep * fieldsPerStep : 0;
              const endIndex = isMultiStep && fields.length > fieldsPerStep ? Math.min(startIndex + fieldsPerStep, fields.length) : fields.length;
              const visibleFields = fields.slice(startIndex, endIndex);
              
              return visibleFields.map((field, index) => (
                <motion.div
                  key={field.id || field.variable}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <FormField
                    type={field.type}
                    label={field.label}
                    value={responses[field.variable] || ''}
                    onChange={(e) => handleChange(field.variable, e.target.value)}
                    placeholder={field.placeholder}
                    options={field.options}
                    required={field.required}
                    error={errors[field.variable]}
                  />
                  
                  {field.helpText && (
                    <p className="mt-1 text-sm text-gray-400">{field.helpText}</p>
                  )}
                </motion.div>
              ));
            })()}
          </div>

          <div className="mt-8 flex gap-3">
            <Button
              type="submit"
              loading={loading}
              icon="Send"
              className="flex-1"
            >
              {loading ? 'Executing...' : 'Execute Prompt Chain'}
            </Button>
            
            <Button
              type="button"
              variant="secondary"
              icon="RotateCcw"
              onClick={() => {
                setResponses({});
                setErrors({});
              }}
            >
              Reset
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default FormRenderer;