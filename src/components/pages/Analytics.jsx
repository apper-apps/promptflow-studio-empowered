import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from '@/components/atoms/Card';
import StatCard from '@/components/molecules/StatCard';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import ErrorState from '@/components/molecules/ErrorState';
import ApperIcon from '@/components/ApperIcon';
import analyticsService from '@/services/api/analyticsService';
import { format, parseISO } from 'date-fns';

const Analytics = () => {
  const [overview, setOverview] = useState(null);
  const [usageStats, setUsageStats] = useState([]);
  const [chainPerformance, setChainPerformance] = useState([]);
  const [modelUsage, setModelUsage] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  useEffect(() => {
    loadAnalytics();
  }, [selectedPeriod]);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [overviewData, usageData, performanceData, modelData, activityData] = await Promise.all([
        analyticsService.getOverview(),
        analyticsService.getUsageStats(selectedPeriod),
        analyticsService.getChainPerformance(),
        analyticsService.getModelUsage(),
        analyticsService.getRecentActivity()
      ]);

      setOverview(overviewData);
      setUsageStats(usageData);
      setChainPerformance(performanceData);
      setModelUsage(modelData);
      setRecentActivity(activityData);
    } catch (err) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    const icons = {
      execution: 'Play',
      created: 'Plus',
      updated: 'Edit3',
      deleted: 'Trash2'
    };
    return icons[type] || 'Activity';
  };

  const getStatusColor = (status) => {
    const colors = {
      success: 'success',
      failed: 'error',
      pending: 'warning'
    };
    return colors[status] || 'secondary';
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <SkeletonLoader count={1} height="h-16" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SkeletonLoader count={4} height="h-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonLoader count={4} height="h-64" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState message={error} onRetry={loadAnalytics} />
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
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <ApperIcon name="BarChart3" size={32} />
            Analytics
          </h1>
          <p className="text-gray-400 mt-2">
            Monitor your prompt chain performance and usage patterns
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-surface glass border border-glass-border rounded-lg px-4 py-2 text-white"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
          
          <Button variant="outline" icon="Download" size="sm">
            Export
          </Button>
        </div>
      </motion.div>

      {/* Overview Stats */}
      {overview && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <StatCard
            title="Total Chains"
            value={overview.totalChains}
            change={overview.thisMonth.growth}
            changeType="positive"
            icon="Workflow"
          />
          <StatCard
            title="Total Executions"
            value={overview.totalExecutions.toLocaleString()}
            change={12.5}
            changeType="positive"
            icon="Play"
          />
          <StatCard
            title="Success Rate"
            value={`${overview.successRate}%`}
            change={2.1}
            changeType="positive"
            icon="CheckCircle"
          />
          <StatCard
            title="Avg Response Time"
            value={`${overview.avgResponseTime}s`}
            change={-8.3}
            changeType="positive"
            icon="Clock"
          />
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chain Performance */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <div className="p-6 border-b border-glass-border">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <ApperIcon name="TrendingUp" size={20} />
                Chain Performance
              </h2>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {chainPerformance.map((chain, index) => (
                  <motion.div
                    key={chain.Id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-background/30 rounded-lg hover:bg-background/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white truncate">
                        {chain.name}
                      </h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                        <span>{chain.executions} executions</span>
                        <span>{chain.successRate}% success</span>
                        <span>{chain.avgResponseTime}s avg</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Badge
                        variant={chain.successRate > 95 ? 'success' : chain.successRate > 90 ? 'warning' : 'error'}
                        size="xs"
                      >
                        {chain.successRate}%
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Model Usage */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <div className="p-6 border-b border-glass-border">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <ApperIcon name="Brain" size={20} />
                Model Usage
              </h2>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {modelUsage.map((model, index) => (
                  <motion.div
                    key={model.model}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-white">{model.model}</span>
                        <span className="text-sm text-gray-400">{model.percentage}%</span>
                      </div>
                      <div className="w-full bg-background rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${model.percentage}%` }}
                          transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
                          className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full"
                        />
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        {model.executions} executions
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Usage Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <div className="p-6 border-b border-glass-border">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <ApperIcon name="Activity" size={20} />
                Usage Timeline
              </h2>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {usageStats.map((stat, index) => (
                  <motion.div
                    key={stat.date}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 bg-background/30 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-white">
                        {format(parseISO(stat.date), 'MMM dd')}
                      </div>
                      <div className="text-sm text-gray-400">
                        {stat.success}/{stat.executions} successful
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">
                        {stat.executions}
                      </div>
                      <div className="text-xs text-gray-400">executions</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <div className="p-6 border-b border-glass-border">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <ApperIcon name="Clock" size={20} />
                Recent Activity
              </h2>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={activity.Id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-3 p-3 bg-background/30 rounded-lg"
                  >
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <ApperIcon 
                        name={getActivityIcon(activity.type)} 
                        size={14} 
                        className="text-primary" 
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-white text-sm">
                          {activity.chainName}
                        </span>
                        <Badge 
                          variant={getStatusColor(activity.status)}
                          size="xs"
                        >
                          {activity.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span className="capitalize">{activity.type}</span>
                        {activity.model && (
                          <>
                            <span>•</span>
                            <span>{activity.model}</span>
                          </>
                        )}
                        <span>•</span>
                        <span>{format(parseISO(activity.timestamp), 'MMM dd, HH:mm')}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;