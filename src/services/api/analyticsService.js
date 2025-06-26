import { analytics } from '../mockData/analytics.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const analyticsService = {
  async getOverview() {
    await delay(400);
    return { ...analytics.overview };
  },

  async getUsageStats(period = '7d') {
    await delay(350);
    return [...analytics.usageStats[period]];
  },

  async getChainPerformance() {
    await delay(300);
    return [...analytics.chainPerformance];
  },

  async getModelUsage() {
    await delay(250);
    return [...analytics.modelUsage];
  },

  async getRecentActivity() {
    await delay(200);
    return [...analytics.recentActivity];
  }
};

export default analyticsService;