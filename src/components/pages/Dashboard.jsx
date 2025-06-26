import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import StatCard from '@/components/molecules/StatCard';
import EmptyState from '@/components/molecules/EmptyState';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import ErrorState from '@/components/molecules/ErrorState';
import ApperIcon from '@/components/ApperIcon';
import Badge from '@/components/atoms/Badge';
import WizardBuilder from '@/components/organisms/WizardBuilder';
import promptChainService from '@/services/api/promptChainService';
import analyticsService from '@/services/api/analyticsService';

const Dashboard = () => {
  const [chains, setChains] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showWizard, setShowWizard] = useState(false);
  const [wizardKey, setWizardKey] = useState(0);
  const navigate = useNavigate();
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [chainsData, analyticsData] = await Promise.all([
        promptChainService.getAll(),
        analyticsService.getOverview()
      ]);
      
      setChains(chainsData.slice(0, 5)); // Show only recent 5 chains
      setAnalytics(analyticsData);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

const handleCreateChain = () => {
    setWizardKey(prev => prev + 1); // Force wizard re-initialization
    setShowWizard(true);
  };

const handleWizardComplete = (chainData) => {
    setShowWizard(false);
    toast.success('Chain created successfully! Opening editor...');
    // Navigate to chains page after successful creation
    setTimeout(() => {
      navigate('/chains');
    }, 1000);
    // Reload dashboard data to show the new chain
    loadDashboardData();
  };

  const handleWizardCancel = () => {
    setShowWizard(false);
    toast.info('Chain creation cancelled');
  };

  const handleViewChain = (chainId) => {
    navigate(`/chains/${chainId}/preview`);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SkeletonLoader count={4} height="h-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonLoader count={2} height="h-64" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState message={error} onRetry={loadDashboardData} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">
            Welcome back! Here's what's happening with your prompt chains.
          </p>
        </div>
        
        <Button onClick={handleCreateChain} icon="Plus" size="lg">
          Create Chain
        </Button>
      </motion.div>

      {/* Stats Grid */}
      {analytics && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <StatCard
            title="Total Chains"
            value={analytics.totalChains}
            change={analytics.thisMonth.growth}
            changeType="positive"
            icon="Workflow"
          />
          <StatCard
            title="Total Executions"
            value={analytics.totalExecutions.toLocaleString()}
            change={12.5}
            changeType="positive"
            icon="Play"
          />
          <StatCard
            title="Success Rate"
            value={`${analytics.successRate}%`}
            change={2.1}
            changeType="positive"
            icon="CheckCircle"
          />
          <StatCard
            title="Avg Response Time"
            value={`${analytics.avgResponseTime}s`}
            change={-8.3}
            changeType="positive"
            icon="Clock"
          />
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Chains */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <div className="p-6 border-b border-glass-border">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <ApperIcon name="Workflow" size={24} />
                  Recent Chains
                </h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/chains')}
                >
                  View All
                </Button>
              </div>
            </div>
            
            <div className="p-6">
              {chains.length === 0 ? (
                <EmptyState
                  icon="Workflow"
                  title="No chains yet"
                  description="Create your first prompt chain to get started"
                  actionLabel="Create Chain"
                  onAction={handleCreateChain}
                />
              ) : (
                <div className="space-y-4">
                  {chains.map((chain, index) => (
                    <motion.div
                      key={chain.Id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-background/30 rounded-lg hover:bg-background/50 transition-colors cursor-pointer"
                      onClick={() => handleViewChain(chain.Id)}
                    >
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white truncate">
                          {chain.name}
                        </h3>
                        <p className="text-sm text-gray-400 truncate mt-1">
                          {chain.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge 
                            variant={chain.status === 'published' ? 'success' : 'warning'}
                            size="xs"
                          >
                            {chain.status}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {chain.nodes?.length || 0} nodes
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewChain(chain.Id);
                          }}
                        >
                          <ApperIcon name="ExternalLink" size={16} />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <div className="p-6 border-b border-glass-border">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <ApperIcon name="Zap" size={24} />
                Quick Start
              </h2>
            </div>
            
            <div className="p-6 space-y-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleCreateChain}
                  icon="Plus"
                  className="w-full justify-start"
                >
                  <div className="text-left ml-3">
                    <div className="font-medium">Create New Chain</div>
                    <div className="text-xs text-gray-400">Build a prompt chain from scratch</div>
                  </div>
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/templates')}
                  icon="FileTemplate"
                  className="w-full justify-start"
                >
                  <div className="text-left ml-3">
                    <div className="font-medium">Browse Templates</div>
                    <div className="text-xs text-gray-400">Start with pre-built templates</div>
                  </div>
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/settings')}
                  icon="Settings"
                  className="w-full justify-start"
                >
                  <div className="text-left ml-3">
                    <div className="font-medium">Configure API</div>
                    <div className="text-xs text-gray-400">Set up your OpenRouter API key</div>
                  </div>
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/analytics')}
                  icon="BarChart3"
                  className="w-full justify-start"
                >
                  <div className="text-left ml-3">
                    <div className="font-medium">View Analytics</div>
                    <div className="text-xs text-gray-400">Monitor usage and performance</div>
                  </div>
                </Button>
              </motion.div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Usage Overview */}
      {analytics && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <div className="p-6 border-b border-glass-border">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <ApperIcon name="Activity" size={24} />
                This Month
              </h2>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {analytics.thisMonth.executions}
                  </div>
                  <div className="text-sm text-gray-400">Executions</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-secondary mb-2">
                    {analytics.thisMonth.newChains}
                  </div>
                  <div className="text-sm text-gray-400">New Chains</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent mb-2">
                    +{analytics.thisMonth.growth}%
                  </div>
                  <div className="text-sm text-gray-400">Growth</div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
)}

      {/* Wizard Modal */}
      <AnimatePresence>
        {showWizard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                handleWizardCancel();
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-4xl max-h-[90vh] m-4"
              onClick={(e) => e.stopPropagation()}
            >
              <WizardBuilder
                key={wizardKey}
                onComplete={handleWizardComplete}
                onCancel={handleWizardCancel}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;