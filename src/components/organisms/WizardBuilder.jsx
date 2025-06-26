import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import FormField from '@/components/molecules/FormField';
import ApperIcon from '@/components/ApperIcon';
import promptChainService from '@/services/api/promptChainService';

const WizardBuilder = ({ onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [prompt, setPrompt] = useState('');
  const [analyzedFields, setAnalyzedFields] = useState([]);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const steps = [
    {
      id: 'prompt',
      title: 'Enter Your Prompt',
      description: 'Describe what you want to create and our AI will analyze it'
    },
    {
      id: 'fields',
      title: 'Review Generated Fields',
      description: 'Check the form fields generated from your prompt'
    },
    {
      id: 'form',
      title: 'Fill Out Form',
      description: 'Complete the form to test your prompt chain'
    },
    {
      id: 'complete',
      title: 'Complete',
      description: 'Your prompt chain is ready!'
    }
  ];

  const handleAnalyzePrompt = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt first');
      return;
    }

    setAnalyzing(true);
    try {
      const result = await promptChainService.analyzePrompt(prompt);
      setAnalyzedFields(result.fields);
      setCurrentStep(1);
      toast.success('Prompt analyzed successfully!');
    } catch (error) {
      toast.error('Failed to analyze prompt');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFieldChange = (fieldId, updates) => {
    setAnalyzedFields(fields => 
      fields.map(field => 
        field.id === fieldId ? { ...field, ...updates } : field
      )
    );
  };

  const handleRemoveField = (fieldId) => {
    setAnalyzedFields(fields => fields.filter(field => field.id !== fieldId));
    toast.success('Field removed');
  };

  const handleAddField = () => {
    const newField = {
      id: `field-${Date.now()}`,
      label: 'New Field',
      variable: 'new_field',
      type: 'text',
      required: false
    };
    setAnalyzedFields(fields => [...fields, newField]);
    toast.success('Field added');
  };

  const handleResponseChange = (variable, value) => {
    setResponses(prev => ({ ...prev, [variable]: value }));
  };

  const handleNext = () => {
    if (currentStep === 0) {
      handleAnalyzePrompt();
    } else if (currentStep === 1) {
      if (analyzedFields.length === 0) {
        toast.error('Add at least one field to continue');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Validate required fields
      const requiredFields = analyzedFields.filter(field => field.required);
      const missingFields = requiredFields.filter(field => 
        !responses[field.variable] || responses[field.variable].toString().trim() === ''
      );
      
      if (missingFields.length > 0) {
        toast.error(`Please fill in all required fields: ${missingFields.map(f => f.label).join(', ')}`);
        return;
      }
      
      setCurrentStep(3);
    } else if (currentStep === 3) {
      onComplete?.({ fields: analyzedFields, prompt, responses });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const ProgressBar = () => (
    <div className="w-full bg-surface/30 rounded-full h-2 mb-8">
      <motion.div
        className="h-2 bg-gradient-to-r from-primary to-secondary rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        transition={{ duration: 0.5 }}
      />
    </div>
  );

  const StepIndicator = () => (
    <div className="flex justify-between items-center mb-8">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
            ${index <= currentStep 
              ? 'bg-primary text-white' 
              : 'bg-surface/50 text-gray-400 border border-glass-border'
            }
          `}>
            {index < currentStep ? (
              <ApperIcon name="Check" size={16} />
            ) : (
              index + 1
            )}
          </div>
          {index < steps.length - 1 && (
            <div className={`
              w-16 h-px mx-2
              ${index < currentStep ? 'bg-primary' : 'bg-surface/30'}
            `} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <ApperIcon name="Wand2" size={40} className="text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Start with Your Idea</h2>
              <p className="text-gray-400">
                Describe what you want to create and our AI will build the perfect form for you
              </p>
            </div>

            <FormField
              type="textarea"
              label="Your Prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Create a product description for my new eco-friendly water bottle targeting health-conscious consumers..."
              required
            />

            <div className="bg-surface/30 rounded-lg p-4">
              <h3 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                <ApperIcon name="Lightbulb" size={16} />
                Tips for Better Results
              </h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Be specific about what you want to create</li>
                <li>• Mention your target audience if relevant</li>
                <li>• Include any important details or requirements</li>
                <li>• The more context you provide, the better the generated form</li>
              </ul>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Generated Form Fields</h2>
              <p className="text-gray-400">
                Review and customize the fields generated from your prompt
              </p>
            </div>

            <div className="space-y-4">
              <AnimatePresence>
                {analyzedFields.map((field, index) => (
                  <motion.div
                    key={field.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card padding="md" className="border border-glass-border">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <FormField
                            label="Field Label"
                            value={field.label}
                            onChange={(e) => handleFieldChange(field.id, { label: e.target.value })}
                            className="mb-3"
                          />
                          <FormField
                            label="Variable Name"
                            value={field.variable}
                            onChange={(e) => handleFieldChange(field.id, { variable: e.target.value })}
                            className="mb-3"
                          />
                          <FormField
                            type="select"
                            label="Field Type"
                            value={field.type}
                            onChange={(value) => handleFieldChange(field.id, { type: value })}
                            options={[
                              { value: 'text', label: 'Text Input' },
                              { value: 'textarea', label: 'Text Area' },
                              { value: 'select', label: 'Dropdown' },
                              { value: 'number', label: 'Number' },
                              { value: 'email', label: 'Email' },
                              { value: 'url', label: 'URL' }
                            ]}
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveField(field.id)}
                          icon="X"
                          className="ml-4 text-error hover:bg-error/20"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-glass-border">
                        <input
                          type="checkbox"
                          id={`required-${field.id}`}
                          checked={field.required}
                          onChange={(e) => handleFieldChange(field.id, { required: e.target.checked })}
                          className="w-4 h-4 bg-surface border border-glass-border rounded focus:ring-primary"
                        />
                        <label htmlFor={`required-${field.id}`} className="text-sm text-white">
                          Required field
                        </label>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <Button
              variant="outline"
              onClick={handleAddField}
              icon="Plus"
              className="w-full"
            >
              Add Custom Field
            </Button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Fill Out Your Form</h2>
              <p className="text-gray-400">
                Complete the form to test how your prompt chain will work
              </p>
            </div>

            <div className="space-y-6">
              {analyzedFields.map((field, index) => (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <FormField
                    type={field.type}
                    label={field.label}
                    value={responses[field.variable] || ''}
                    onChange={(e) => handleResponseChange(field.variable, e.target.value)}
                    placeholder={field.placeholder}
                    options={field.options}
                    required={field.required}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="text-center space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-24 h-24 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <ApperIcon name="CheckCircle" size={48} className="text-success" />
            </motion.div>
            
            <h2 className="text-3xl font-bold text-white mb-4">Wizard Complete!</h2>
            <p className="text-gray-400 text-lg mb-8">
              Your prompt chain has been generated with {analyzedFields.length} form fields. 
              You can now save it and start using it to create content.
            </p>

            <div className="bg-surface/30 rounded-lg p-6 text-left">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <ApperIcon name="FileText" size={20} />
                Summary
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-400">Original Prompt:</span>
                  <p className="text-white mt-1">{prompt}</p>
                </div>
                <div>
                  <span className="text-gray-400">Generated Fields:</span>
                  <div className="mt-2 space-y-1">
                    {analyzedFields.map(field => (
                      <div key={field.id} className="flex items-center gap-2 text-white">
                        <ApperIcon name="ArrowRight" size={12} />
                        {field.label} ({field.type})
                        {field.required && <span className="text-error text-xs">*</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background/50">
      <div className="flex-1 flex items-start justify-center p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-4xl my-auto"
        >
        <Card className="p-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <ApperIcon name="Wand2" size={28} />
                Prompt Chain Wizard
              </h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancel}
                icon="X"
              >
                Cancel
              </Button>
            </div>
            
            <ProgressBar />
            <StepIndicator />
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-2">
              {steps[currentStep].title}
            </h2>
            <p className="text-gray-400 mb-6">
              {steps[currentStep].description}
            </p>
            
            {renderStepContent()}
          </div>

          <div className="flex justify-between pt-6 border-t border-glass-border">
            <Button
              variant="secondary"
              onClick={handleBack}
              disabled={currentStep === 0}
              icon="ChevronLeft"
            >
              Back
            </Button>

            <Button
              onClick={handleNext}
              loading={analyzing}
              icon={currentStep === 3 ? "Check" : "ChevronRight"}
            >
              {currentStep === 0 && 'Analyze Prompt'}
              {currentStep === 1 && 'Continue'}
              {currentStep === 2 && 'Complete Form'}
              {currentStep === 3 && 'Finish Wizard'}
            </Button>
          </div>
</Card>
      </motion.div>
      </div>
    </div>
  );
};

export default WizardBuilder;