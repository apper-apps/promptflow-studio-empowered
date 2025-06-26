import { userSettings } from '../mockData/userSettings.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let data = { ...userSettings };

export const userSettingsService = {
  async getSettings() {
    await delay(200);
    return { ...data };
  },

  async updateSettings(updates) {
    await delay(300);
    data = {
      ...data,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return { ...data };
  },

  async updateApiKey(encryptedKey) {
    await delay(250);
    data.encryptedApiKey = encryptedKey;
    data.updatedAt = new Date().toISOString();
    return { success: true };
  },

  async validateApiKey(apiKey) {
    await delay(500); // Simulate API validation
    // Mock validation - in real app, this would call OpenRouter
    const isValid = apiKey && apiKey.length > 10;
    return { valid: isValid, models: isValid ? [
      'gpt-4-turbo-preview',
      'gpt-3.5-turbo',
      'claude-3-opus',
      'claude-3-sonnet',
      'gemini-pro',
      'mistral-large'
    ] : [] };
  },

  async getAvailableModels() {
    await delay(300);
    return [
      { id: 'gpt-4-turbo-preview', name: 'GPT-4 Turbo', provider: 'OpenAI' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI' },
      { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic' },
      { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'Anthropic' },
      { id: 'gemini-pro', name: 'Gemini Pro', provider: 'Google' },
      { id: 'mistral-large', name: 'Mistral Large', provider: 'Mistral' }
    ];
  }
};

export default userSettingsService;