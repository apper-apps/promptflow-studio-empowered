import { toast } from 'react-toastify';

const { ApperClient } = window.ApperSDK;
const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

export const userSettingsService = {
  async getSettings() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "encrypted_api_key" } },
          { field: { Name: "preferred_model" } },
          { field: { Name: "default_settings" } },
          { field: { Name: "subscription" } },
          { field: { Name: "created_at" } },
          { field: { Name: "updated_at" } },
          { field: { Name: "user_id" } }
        ],
        pagingInfo: { limit: 1, offset: 0 }
      };

      const response = await apperClient.fetchRecords('user_setting', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return {};
      }

      const settings = response.data && response.data.length > 0 ? response.data[0] : null;
      
      if (!settings) {
        // Return default settings if none found
        return {
          encryptedApiKey: '',
          preferredModel: 'gpt-4-turbo-preview',
          defaultSettings: {
            theme: 'dark',
            autoSave: true,
            showTutorials: true,
            emailNotifications: {
              chainExecutions: true,
              weeklyReports: false,
              systemUpdates: true
            },
            editorSettings: {
              snapToGrid: true,
              showMinimap: false,
              autoLayout: true
            }
          },
          subscription: {
            plan: 'free',
            executionsUsed: 0,
            executionLimit: 100,
            resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          }
        };
      }

      // Transform database fields to UI format
      return {
        Id: settings.Id,
        encryptedApiKey: settings.encrypted_api_key || '',
        preferredModel: settings.preferred_model || 'gpt-4-turbo-preview',
        defaultSettings: settings.default_settings ? JSON.parse(settings.default_settings) : {},
        subscription: settings.subscription ? JSON.parse(settings.subscription) : {},
        createdAt: settings.created_at,
        updatedAt: settings.updated_at
      };
    } catch (error) {
      console.error("Error fetching user settings:", error);
      toast.error("Failed to load settings");
      return {};
    }
  },

  async updateSettings(updates) {
    try {
      const currentSettings = await this.getSettings();
      
      const params = {
        records: [
          {
            Id: currentSettings.Id || 1, // Use existing ID or create new
            Name: updates.name || "User Settings",
            encrypted_api_key: updates.encryptedApiKey || currentSettings.encryptedApiKey,
            preferred_model: updates.preferredModel || currentSettings.preferredModel,
            default_settings: JSON.stringify(updates.defaultSettings || currentSettings.defaultSettings),
            subscription: JSON.stringify(updates.subscription || currentSettings.subscription),
            updated_at: new Date().toISOString()
          }
        ]
      };

      const response = currentSettings.Id 
        ? await apperClient.updateRecord('user_setting', params)
        : await apperClient.createRecord('user_setting', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to update ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        return successfulRecords.length > 0 ? successfulRecords[0].data : null;
      }
    } catch (error) {
      console.error("Error updating user settings:", error);
      throw error;
    }
  },

  async updateApiKey(encryptedKey) {
    try {
      const currentSettings = await this.getSettings();
      
      const updatedSettings = {
        ...currentSettings,
        encryptedApiKey: encryptedKey
      };
      
      await this.updateSettings(updatedSettings);
      return { success: true };
    } catch (error) {
      console.error("Error updating API key:", error);
      throw error;
    }
  },

  async validateApiKey(apiKey) {
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    await delay(500); // Simulate API validation
    
    // Mock validation - in real app, this would call OpenRouter
    const isValid = apiKey && apiKey.length > 10;
    return { 
      valid: isValid, 
      models: isValid ? [
        'gpt-4-turbo-preview',
        'gpt-3.5-turbo',
        'claude-3-opus',
        'claude-3-sonnet',
        'gemini-pro',
        'mistral-large'
      ] : [] 
    };
  },

  async getAvailableModels() {
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
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