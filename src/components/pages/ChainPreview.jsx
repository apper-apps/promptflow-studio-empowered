import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import FormRenderer from '@/components/organisms/FormRenderer';
import ResponseDisplay from '@/components/organisms/ResponseDisplay';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import Badge from '@/components/atoms/Badge';
import Select from '@/components/atoms/Select';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import ErrorState from '@/components/molecules/ErrorState';
import ApperIcon from '@/components/ApperIcon';
import promptChainService from '@/services/api/promptChainService';
import userSettingsService from '@/services/api/userSettingsService';

const ChainPreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [chain, setChain] = useState(null);
  const [formFields, setFormFields] = useState([]);
  const [availableModels, setAvailableModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      loadChainData();
    }
    loadAvailableModels();
  }, [id]);

  const loadChainData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const chainData = await promptChainService.getById(id);
      setChain(chainData);
      
      // Generate form from chain
      await generateForm(chainData.Id);
    } catch (err) {
      setError(err.message || 'Failed to load chain');
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
      
      // Set default model
      const settings = await userSettingsService.getSettings();
      setSelectedModel(settings.preferredModel || models[0]?.id);
    } catch (err) {
      console.error('Failed to load models:', err);
    }
  };

  const generateForm = async (chainId) => {
    setGenerating(true);
    try {
      const result = await promptChainService.generateForm(chainId);
      setFormFields(result.fields);
      toast.success('Form generated successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to generate form');
    } finally {
      setGenerating(false);
    }
  };

  const handleExecuteChain = async (responses) => {
    if (!selectedModel) {
      toast.error('Please select a model');
      return;
    }

    setExecuting(true);
    try {
      const result = await promptChainService.executeChain(
        chain.Id,
        responses,
        'user-api-key', // In real app, this would come from settings
        selectedModel
      );
      
      setResponse({
        response: result.response,
        prompt: result.prompt,
        tokenUsage: result.tokenUsage,
        model: result.model
      });
      
      toast.success('Chain executed successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to execute chain');
    } finally {
      setExecuting(false);
    }
  };

  const handleRegenerateForm = async () => {
    await generateForm(chain.Id);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <SkeletonLoader count={1} height="h-20" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SkeletonLoader count={2} height="h-96" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState message={error} onRetry={loadChainData} />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/chains')}
                icon="ArrowLeft"
              >
                Back to Chains
              </Button>
            </div>
            
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <ApperIcon name="Eye" size={32} />
              {chain?.name || 'Chain Preview'}
            </h1>
            
            {chain?.description && (
              <p className="text-gray-400 mt-2">{chain.description}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" size="sm">
              {chain?.nodes?.length || 0} nodes
            </Badge>
            <Badge 
              variant={chain?.status === 'published' ? 'success' : 'warning'}
              size="sm"
            >
              {chain?.status || 'draft'}
            </Badge>
          </div>
        </motion.div>

        {/* Model Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <ApperIcon name="Brain" size={20} className="text-primary" />
                  <div>
                    <h3 className="font-medium text-white">Execution Model</h3>
                    <p className="text-sm text-gray-400">Choose the AI model for prompt execution</p>
                  </div>
                </div>
                
                <div className="w-64">
                  <Select
                    value={selectedModel}
                    onChange={setSelectedModel}
                    options={availableModels}
                    placeholder="Select model"
                  />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {generating ? (
              <Card className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-400">Generating form from your prompt chain...</p>
              </Card>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">Generated Form</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRegenerateForm}
                    icon="RefreshCw"
                  >
                    Regenerate
                  </Button>
                </div>
                
                <FormRenderer
                  fields={formFields}
                  onSubmit={handleExecuteChain}
                  loading={executing}
                />
              </>
            )}
          </motion.div>

          {/* Response Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            {response ? (
              <ResponseDisplay
                response={response.response}
                prompt={response.prompt}
                tokenUsage={response.tokenUsage}
                model={response.model}
              />
            ) : (
              <Card className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ApperIcon name="Sparkles" size={32} className="text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Ready to Execute</h3>
                  <p className="text-gray-400">
                    Fill out the form and click execute to see your AI-generated response
                  </p>
                </div>
              </Card>
            )}
          </motion.div>
        </div>

        {/* Chain Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <div className="p-6 border-b border-glass-border">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <ApperIcon name="Info" size={20} />
                Chain Information
              </h2>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-medium text-gray-400 mb-2">Nodes</h3>
                  <div className="space-y-2">
                    {chain?.nodes?.map((node, index) => (
                      <div key={node.id} className="flex items-center gap-2 text-sm">
                        <Badge variant="outline" size="xs">
                          {node.fieldType}
                        </Badge>
                        <span className="text-white truncate">{node.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-400 mb-2">Variables</h3>
                  <div className="space-y-1">
                    {chain?.nodes?.map((node, index) => (
                      <div key={node.id} className="text-sm font-mono text-primary">
                        {`{{${node.variable}}}`}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-400 mb-2">Settings</h3>
                  <div className="space-y-1 text-sm text-gray-300">
                    <div>Status: <Badge variant="secondary" size="xs">{chain?.status}</Badge></div>
                    <div>Created: {chain?.createdAt ? new Date(chain.createdAt).toLocaleDateString() : 'Unknown'}</div>
                    <div>Updated: {chain?.updatedAt ? new Date(chain.updatedAt).toLocaleDateString() : 'Unknown'}</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ChainPreview;