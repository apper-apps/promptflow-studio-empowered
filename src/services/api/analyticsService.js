import { toast } from 'react-toastify';

const { ApperClient } = window.ApperSDK;
const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

export const analyticsService = {
  async getOverview() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "overview" } },
          { field: { Name: "usage_stats" } },
          { field: { Name: "chain_performance" } },
          { field: { Name: "model_usage" } },
          { field: { Name: "recent_activity" } }
        ],
        where: [
          { FieldName: "Name", Operator: "EqualTo", Values: ["overview"] }
        ]
      };

      const response = await apperClient.fetchRecords('analytic', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return {};
      }

      const overview = response.data && response.data.length > 0 ? response.data[0] : null;
      
      if (!overview || !overview.overview) {
        // Return default overview if none found
        return {
          totalChains: 0,
          totalExecutions: 0,
          successRate: 0,
          avgResponseTime: 0,
          thisMonth: {
            executions: 0,
            newChains: 0,
            growth: 0
          }
        };
      }

      return JSON.parse(overview.overview);
    } catch (error) {
      console.error("Error fetching analytics overview:", error);
      toast.error("Failed to load analytics overview");
      return {};
    }
  },

  async getUsageStats(period = '7d') {
    try {
      const params = {
        fields: [
          { field: { Name: "usage_stats" } }
        ],
        where: [
          { FieldName: "Name", Operator: "EqualTo", Values: ["usage_stats"] }
        ]
      };

      const response = await apperClient.fetchRecords('analytic', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      const stats = response.data && response.data.length > 0 ? response.data[0] : null;
      
      if (!stats || !stats.usage_stats) {
        return [];
      }

      const usageData = JSON.parse(stats.usage_stats);
      return usageData[period] || [];
    } catch (error) {
      console.error("Error fetching usage stats:", error);
      toast.error("Failed to load usage statistics");
      return [];
    }
  },

  async getChainPerformance() {
    try {
      const params = {
        fields: [
          { field: { Name: "chain_performance" } }
        ],
        where: [
          { FieldName: "Name", Operator: "EqualTo", Values: ["chain_performance"] }
        ]
      };

      const response = await apperClient.fetchRecords('analytic', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      const performance = response.data && response.data.length > 0 ? response.data[0] : null;
      
      if (!performance || !performance.chain_performance) {
        return [];
      }

      return JSON.parse(performance.chain_performance);
    } catch (error) {
      console.error("Error fetching chain performance:", error);
      toast.error("Failed to load chain performance data");
      return [];
    }
  },

  async getModelUsage() {
    try {
      const params = {
        fields: [
          { field: { Name: "model_usage" } }
        ],
        where: [
          { FieldName: "Name", Operator: "EqualTo", Values: ["model_usage"] }
        ]
      };

      const response = await apperClient.fetchRecords('analytic', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      const usage = response.data && response.data.length > 0 ? response.data[0] : null;
      
      if (!usage || !usage.model_usage) {
        return [];
      }

      return JSON.parse(usage.model_usage);
    } catch (error) {
      console.error("Error fetching model usage:", error);
      toast.error("Failed to load model usage data");
      return [];
    }
  },

  async getRecentActivity() {
    try {
      const params = {
        fields: [
          { field: { Name: "recent_activity" } }
        ],
        where: [
          { FieldName: "Name", Operator: "EqualTo", Values: ["recent_activity"] }
        ]
      };

      const response = await apperClient.fetchRecords('analytic', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      const activity = response.data && response.data.length > 0 ? response.data[0] : null;
      
      if (!activity || !activity.recent_activity) {
        return [];
      }

      return JSON.parse(activity.recent_activity);
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      toast.error("Failed to load recent activity");
      return [];
    }
  }
};

export default analyticsService;