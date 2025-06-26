import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import TemplateGrid from '@/components/organisms/TemplateGrid';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import ErrorState from '@/components/molecules/ErrorState';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';
import templateService from '@/services/api/templateService';

const Templates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await templateService.getAll();
      setTemplates(data);
    } catch (err) {
      setError(err.message || 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleUseTemplate = async (templateId) => {
    try {
      const chainData = await templateService.useTemplate(templateId);
      toast.success('Template loaded! Redirecting to editor...');
      // In a real app, this would create a new chain and navigate to editor
      return chainData;
    } catch (err) {
      toast.error(err.message || 'Failed to use template');
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <SkeletonLoader count={1} height="h-16" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonLoader count={6} height="h-80" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState message={error} onRetry={loadTemplates} />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <ApperIcon name="FileTemplate" size={32} />
              Templates
            </h1>
            <p className="text-gray-400 mt-2">
              Jump-start your prompt chains with pre-built templates from the community
            </p>
          </div>
          
          <Button variant="outline" icon="Upload">
            Submit Template
          </Button>
        </div>
      </motion.div>

      {/* Template Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        <div className="bg-surface glass rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-primary mb-2">
            {templates.length}
          </div>
          <div className="text-sm text-gray-400">Available Templates</div>
        </div>
        
        <div className="bg-surface glass rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-secondary mb-2">
            {new Set(templates.map(t => t.category)).size}
          </div>
          <div className="text-sm text-gray-400">Categories</div>
        </div>
        
        <div className="bg-surface glass rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-accent mb-2">
            {templates.reduce((sum, t) => sum + (t.uses || 0), 0).toLocaleString()}
          </div>
          <div className="text-sm text-gray-400">Total Uses</div>
        </div>
      </motion.div>

      {/* Templates Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <TemplateGrid 
          templates={templates} 
          onUseTemplate={handleUseTemplate}
        />
      </motion.div>

      {/* Help Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-12 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-lg p-8 text-center"
      >
        <ApperIcon name="Lightbulb" size={48} className="text-primary mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">
          Create Your Own Template
        </h3>
        <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
          Have a prompt chain that others would find useful? Submit it as a template 
          and help the community build better AI workflows.
        </p>
        <Button icon="Plus" size="lg">
          Submit Template
        </Button>
      </motion.div>
    </div>
  );
};

export default Templates;