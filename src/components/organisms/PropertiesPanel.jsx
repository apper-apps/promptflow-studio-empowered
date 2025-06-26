import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import FormField from "@/components/molecules/FormField";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";

const PropertiesPanel = ({ 
  selectedNode, 
  onNodeUpdate, 
  onNodeDelete,
  className = '' 
}) => {
  const [nodeData, setNodeData] = useState({
    label: '',
    variable: '',
    fieldType: 'text',
    options: [],
    required: false,
    placeholder: '',
    helpText: ''
  });

  const [optionInput, setOptionInput] = useState('');

  useEffect(() => {
    if (selectedNode) {
      setNodeData({
        label: selectedNode.data?.label || '',
        variable: selectedNode.data?.variable || '',
        fieldType: selectedNode.data?.fieldType || 'text',
        options: selectedNode.data?.options || [],
        required: selectedNode.data?.required || false,
        placeholder: selectedNode.data?.placeholder || '',
        helpText: selectedNode.data?.helpText || ''
      });
    }
  }, [selectedNode]);

  const fieldTypes = [
    { value: 'text', label: 'Text Input' },
    { value: 'textarea', label: 'Text Area' },
    { value: 'select', label: 'Dropdown' },
    { value: 'multiselect', label: 'Multi-select' },
    { value: 'number', label: 'Number' },
    { value: 'email', label: 'Email' },
    { value: 'url', label: 'URL' }
  ];

  const handleChange = (field, value) => {
    const updatedData = { ...nodeData, [field]: value };
    setNodeData(updatedData);
    
    if (selectedNode) {
      onNodeUpdate?.(selectedNode.id, updatedData);
    }
  };

  const addOption = () => {
    if (optionInput.trim()) {
      const newOptions = [...nodeData.options, optionInput.trim()];
      handleChange('options', newOptions);
      setOptionInput('');
    }
  };

  const removeOption = (index) => {
    const newOptions = nodeData.options.filter((_, i) => i !== index);
    handleChange('options', newOptions);
};

  const generateWizardFields = () => {
    if (!selectedNode) return;
    
    // Auto-generate common form fields based on the label
    const label = nodeData.label.toLowerCase();
    let suggestions = {};
    
    if (label.includes('email')) {
      suggestions = {
        fieldType: 'email',
        placeholder: 'Enter your email address',
        required: true
      };
    } else if (label.includes('phone') || label.includes('number')) {
      suggestions = {
        fieldType: 'number',
        placeholder: 'Enter phone number',
        required: true
      };
    } else if (label.includes('url') || label.includes('website') || label.includes('link')) {
      suggestions = {
        fieldType: 'url',
        placeholder: 'https://',
        required: false
      };
    } else if (label.includes('select') || label.includes('choose') || label.includes('option')) {
      suggestions = {
        fieldType: 'select',
        options: ['Option 1', 'Option 2', 'Option 3'],
        required: true
      };
    } else if (label.includes('description') || label.includes('comment') || label.includes('message')) {
      suggestions = {
        fieldType: 'textarea',
        placeholder: 'Enter detailed information...',
        required: false
      };
    } else {
      suggestions = {
        fieldType: 'text',
        placeholder: `Enter ${nodeData.label.toLowerCase()}`,
        required: true
      };
    }
    
    // Apply suggestions
    Object.entries(suggestions).forEach(([field, value]) => {
      handleChange(field, value);
    });
  };

  const handleDelete = () => {
    if (selectedNode && onNodeDelete) {
      onNodeDelete(selectedNode.id);
    }
  };

  if (!selectedNode) {
    return (
      <div className={`w-80 bg-surface glass border-l border-glass-border ${className}`}>
        <div className="p-6 border-b border-glass-border">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <ApperIcon name="Settings" size={20} />
            Properties
          </h2>
        </div>
        
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <ApperIcon name="MousePointer" size={32} className="text-primary" />
          </div>
          <p className="text-gray-400">Select a node to edit its properties</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ x: 320 }}
      animate={{ x: 0 }}
      className={`w-80 bg-surface glass border-l border-glass-border ${className}`}
    >
      <div className="p-6 border-b border-glass-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <ApperIcon name="Settings" size={20} />
            Properties
          </h2>
          <Badge variant="primary" size="xs">
            {selectedNode.id}
          </Badge>
        </div>
      </div>

      <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-200px)]">
        {/* Basic Settings */}
        <Card padding="md">
          <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
            <ApperIcon name="Edit3" size={16} />
            Basic Settings
          </h3>
          
          <div className="space-y-4">
            <FormField
              label="Label"
              value={nodeData.label}
              onChange={(e) => handleChange('label', e.target.value)}
              placeholder="Enter prompt label"
              required
            />

            <FormField
              label="Variable Name"
              value={nodeData.variable}
              onChange={(e) => handleChange('variable', e.target.value)}
              placeholder="variable_name"
              required
            />

            <FormField
              type="select"
              label="Field Type"
              value={nodeData.fieldType}
              onChange={(value) => handleChange('fieldType', value)}
              options={fieldTypes}
            />
          </div>
        </Card>

        {/* Field Options */}
        {(nodeData.fieldType === 'select' || nodeData.fieldType === 'multiselect') && (
          <Card padding="md">
            <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
              <ApperIcon name="List" size={16} />
              Options
            </h3>
            
            <div className="space-y-3">
              <div className="flex gap-2">
                <FormField
                  value={optionInput}
                  onChange={(e) => setOptionInput(e.target.value)}
                  placeholder="Add option"
                  onKeyPress={(e) => e.key === 'Enter' && addOption()}
                />
                <Button size="sm" onClick={addOption} icon="Plus">
                  Add
                </Button>
              </div>

              <AnimatePresence>
                {nodeData.options.map((option, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2 p-2 bg-background/50 rounded"
                  >
                    <span className="flex-1 text-sm text-white">{option}</span>
                    <button
                      onClick={() => removeOption(index)}
                      className="p-1 hover:bg-error/20 rounded text-error"
                    >
                      <ApperIcon name="X" size={14} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </Card>
        )}

        {/* Advanced Settings */}
        <Card padding="md">
          <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
            <ApperIcon name="Sliders" size={16} />
            Advanced
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="required"
                checked={nodeData.required}
                onChange={(e) => handleChange('required', e.target.checked)}
                className="w-4 h-4 bg-surface border border-glass-border rounded focus:ring-primary"
              />
              <label htmlFor="required" className="text-sm text-white">
                Required field
              </label>
            </div>

            <FormField
              label="Placeholder"
              value={nodeData.placeholder}
              onChange={(e) => handleChange('placeholder', e.target.value)}
              placeholder="Placeholder text"
            />

            <FormField
              type="textarea"
              label="Help Text"
              value={nodeData.helpText}
              onChange={(e) => handleChange('helpText', e.target.value)}
              placeholder="Additional instructions for users"
            />
          </div>
        </Card>

{/* Actions */}
        <div className="flex gap-2">
          <Button 
            variant="danger" 
            size="sm" 
            onClick={handleDelete}
            icon="Trash2"
            className="flex-1"
          >
            Delete Node
          </Button>
        </div>

        {/* Wizard Actions */}
        <Card padding="md">
          <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
            <ApperIcon name="Wand2" size={16} />
            Wizard Tools
          </h3>
          
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={generateWizardFields}
              icon="Sparkles"
              className="w-full"
            >
              Generate Form Fields
            </Button>
          </div>
        </Card>
      </div>
    </motion.div>
  );

export default PropertiesPanel;