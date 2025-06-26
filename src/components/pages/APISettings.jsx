import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import Badge from '@/components/atoms/Badge';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import ErrorState from '@/components/molecules/ErrorState';
import ApperIcon from '@/components/ApperIcon';
import userSettingsService from '@/services/api/userSettingsService';

const APISettings = () => {
  const [settings, setSettings] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [availableModels, setAvailableModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState(null);
  const [keyVisible, setKeyVisible] = useState(false);

  useEffect(() => {
    loadSettings();
    loadAvailableModels();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await userSettingsService.getSettings();
      setSettings(data);
      setSelectedModel(data.preferredModel || '');
      // Don't show the actual API key for security
      setApiKey(data.encryptedApiKey ? '••••••••••••••••' : '');
    } catch (err) {
      setError(err.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableModels = async () => {
    try {
      const models = await userSettingsService.getAvailableModels();
      setAvailableModels(models.map(model => ({
        value: model.id,
        label: `${model.name} (${model.provider})`
      })));
    } catch (err) {
      console.error('Failed to load models:', err);
    }
  };

  const handleValidateKey = async () => {
    if (!apiKey || apiKey.startsWith('••••')) {
      toast.error('Please enter a valid API key');
      return;
    }

    setValidating(true);
    try {
      const result = await userSettingsService.validateApiKey(apiKey);
      if (result.valid) {
        toast.success('API key is valid!');
        // Update available models based on the key
        if (result.models && result.models.length > 0) {
          setAvailableModels(result.models.map(model => ({
            value: model,
            label: model
          })));
        }
      } else {
        toast.error('Invalid API key');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to validate API key');
    } finally {
      setValidating(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const updates = {
        preferredModel: selectedModel,
        defaultSettings: {
          ...settings?.defaultSettings,
          theme: 'dark',
          autoSave: true
        }
      };

      // Only update API key if it's been changed
      if (apiKey && !apiKey.startsWith('••••')) {
        await userSettingsService.updateApiKey(apiKey);
      }

      await userSettingsService.updateSettings(updates);
      toast.success('Settings saved successfully');
      
      // Refresh settings to get updated data
      loadSettings();
    } catch (err) {
      toast.error(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <SkeletonLoader count={1} height="h-16" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonLoader count={2} height="h-80" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState message={error} onRetry={loadSettings} />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <ApperIcon name="Settings" size={32} />
          API Settings
        </h1>
        <p className="text-gray-400 mt-2">
          Configure your OpenRouter API key and preferred models for executing prompt chains
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Configuration */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <div className="p-6 border-b border-glass-border">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <ApperIcon name="Key" size={20} />
                OpenRouter API Key
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Your API key enables prompt execution with your choice of models
              </p>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="relative">
                  <Input
                    type={keyVisible ? 'text' : 'password'}
                    label="API Key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-or-v1-..."
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setKeyVisible(!keyVisible)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    <ApperIcon name={keyVisible ? 'EyeOff' : 'Eye'} size={16} />
                  </button>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleValidateKey}
                    loading={validating}
                    variant="outline"
                    icon="CheckCircle"
                    size="sm"
                  >
                    {validating ? 'Validating...' : 'Validate Key'}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="ExternalLink"
                    onClick={() => window.open('https://openrouter.ai/keys', '_blank')}
                  >
                    Get API Key
                  </Button>
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-warning/10 border border-warning/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <ApperIcon name="Shield" size={20} className="text-warning flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-warning mb-1">Security Notice</h3>
                    <p className="text-sm text-gray-300">
                      Your API key is encrypted and stored securely. It's only used for executing 
                      your prompt chains and is never shared.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Model Configuration */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <div className="p-6 border-b border-glass-border">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <ApperIcon name="Brain" size={20} />
                Model Preferences
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Choose your default model for prompt execution
              </p>
            </div>

            <div className="p-6 space-y-6">
              <Select
                label="Preferred Model"
                value={selectedModel}
                onChange={setSelectedModel}
                options={availableModels}
                placeholder="Select a model"
              />

              {/* Model Info */}
              {selectedModel && (
                <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <ApperIcon name="Info" size={20} className="text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-primary mb-1">Model Information</h3>
                      <p className="text-sm text-gray-300">
                        You can change the model for each individual prompt chain execution. 
                        This setting is just your default preference.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Available Models */}
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wide">
                  Available Models
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {availableModels.slice(0, 6).map((model) => (
                    <div 
                      key={model.value}
                      className="flex items-center justify-between p-3 bg-background/30 rounded-lg"
                    >
                      <span className="text-sm text-white">{model.label}</span>
                      <Badge 
                        variant={model.value === selectedModel ? 'primary' : 'outline'}
                        size="xs"
                      >
                        {model.value === selectedModel ? 'Selected' : 'Available'}
                      </Badge>
                    </div>
                  ))}
                  {availableModels.length > 6 && (
                    <div className="text-center py-2">
                      <span className="text-sm text-gray-400">
                        +{availableModels.length - 6} more models available
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Usage & Billing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card>
            <div className="p-6 border-b border-glass-border">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <ApperIcon name="CreditCard" size={20} />
                Usage & Limits
              </h2>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {settings?.subscription?.executionsUsed || 0}
                  </div>
                  <div className="text-sm text-gray-400">Executions Used</div>
                  <div className="text-xs text-gray-500 mt-1">
                    of {settings?.subscription?.executionLimit || 100} this month
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary mb-1">
                    {settings?.subscription?.plan === 'free' ? 'Free' : 'Pro'}
                  </div>
                  <div className="text-sm text-gray-400">Current Plan</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Upgrade for more features
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-accent mb-1">
                    {Math.ceil((new Date(settings?.subscription?.resetDate) - new Date()) / (1000 * 60 * 60 * 24))}
                  </div>
                  <div className="text-sm text-gray-400">Days Until Reset</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Usage resets monthly
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <Button variant="outline" icon="ArrowUp">
                  Upgrade Plan
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8 flex justify-end"
      >
        <Button
          onClick={handleSaveSettings}
          loading={saving}
          icon="Save"
          size="lg"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </motion.div>
    </div>
  );
};

export default APISettings;