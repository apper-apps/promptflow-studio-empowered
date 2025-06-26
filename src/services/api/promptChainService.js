import { toast } from 'react-toastify';

const { ApperClient } = window.ApperSDK;
const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

export const promptChainService = {
  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "description" } },
          { field: { Name: "nodes" } },
          { field: { Name: "connections" } },
          { field: { Name: "settings" } },
          { field: { Name: "final_prompt" } },
          { field: { Name: "status" } },
          { field: { Name: "created_at" } },
          { field: { Name: "updated_at" } },
          { field: { Name: "user_id" } }
        ],
        orderBy: [
          { fieldName: "created_at", sorttype: "DESC" }
        ]
      };

      const response = await apperClient.fetchRecords('prompt_chain', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching prompt chains:", error);
      toast.error("Failed to load prompt chains");
      return [];
    }
  },

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "description" } },
          { field: { Name: "nodes" } },
          { field: { Name: "connections" } },
          { field: { Name: "settings" } },
          { field: { Name: "final_prompt" } },
          { field: { Name: "status" } },
          { field: { Name: "created_at" } },
          { field: { Name: "updated_at" } },
          { field: { Name: "user_id" } }
        ]
      };

      const response = await apperClient.getRecordById('prompt_chain', parseInt(id, 10), params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (!response.data) {
        throw new Error('Prompt chain not found');
      }

      // Transform database fields to UI format
      const chain = {
        Id: response.data.Id,
        name: response.data.Name,
        description: response.data.description,
        userId: response.data.user_id,
        nodes: response.data.nodes ? JSON.parse(response.data.nodes) : [],
        connections: response.data.connections ? JSON.parse(response.data.connections) : [],
        settings: response.data.settings ? JSON.parse(response.data.settings) : {},
        finalPrompt: response.data.final_prompt,
        status: response.data.status,
        createdAt: response.data.created_at,
        updatedAt: response.data.updated_at,
        tags: response.data.Tags
      };

      return chain;
    } catch (error) {
      console.error(`Error fetching prompt chain with ID ${id}:`, error);
      throw error;
    }
  },

  async create(chainData) {
    try {
      const params = {
        records: [
          {
            Name: chainData.name,
            description: chainData.description,
            nodes: JSON.stringify(chainData.nodes || []),
            connections: JSON.stringify(chainData.connections || []),
            settings: JSON.stringify(chainData.settings || {}),
            final_prompt: chainData.finalPrompt || "",
            status: chainData.status || "draft",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]
      };

      const response = await apperClient.createRecord('prompt_chain', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
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
      console.error("Error creating prompt chain:", error);
      throw error;
    }
  },

  async update(id, updates) {
    try {
      const params = {
        records: [
          {
            Id: parseInt(id, 10),
            Name: updates.name,
            description: updates.description,
            nodes: JSON.stringify(updates.nodes || []),
            connections: JSON.stringify(updates.connections || []),
            settings: JSON.stringify(updates.settings || {}),
            final_prompt: updates.finalPrompt || "",
            status: updates.status || "draft",
            updated_at: new Date().toISOString()
          }
        ]
      };

      const response = await apperClient.updateRecord('prompt_chain', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        return successfulUpdates.length > 0 ? successfulUpdates[0].data : null;
      }
    } catch (error) {
      console.error("Error updating prompt chain:", error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const params = {
        RecordIds: [parseInt(id, 10)]
      };

      const response = await apperClient.deleteRecord('prompt_chain', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        return successfulDeletions.length > 0;
      }
    } catch (error) {
      console.error("Error deleting prompt chain:", error);
      throw error;
    }
  },

  async generateForm(chainId) {
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    await delay(800); // Simulate AI processing
    
    const chain = await this.getById(chainId);
    
    // Simulate AI-generated form fields based on prompt chain
    const formFields = chain.nodes.map(node => ({
      id: node.id,
      label: node.label,
      variable: node.variable,
      type: node.fieldType,
      required: true,
      options: node.options || null
    }));

    return { fields: formFields, finalPrompt: chain.finalPrompt };
  },

  async executeChain(chainId, responses, apiKey, model) {
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    await delay(1200); // Simulate API call
    
    const chain = await this.getById(chainId);
    let finalPrompt = chain.finalPrompt || "Generate content based on the following inputs:";
    
    // Replace variables in final prompt
    Object.entries(responses).forEach(([variable, value]) => {
      finalPrompt = finalPrompt.replace(new RegExp(`{{${variable}}}`, 'g'), value);
    });

    // Simulate AI response
    const mockResponse = `Based on your inputs, here's a generated response that incorporates ${Object.keys(responses).join(', ')}. This would normally be generated by ${model} using your OpenRouter API key.

Generated content with personalized elements based on your specific requirements and preferences.`;

    return {
      prompt: finalPrompt,
      response: mockResponse,
      model: model,
      tokenUsage: { prompt: 150, completion: 320, total: 470 }
    };
  },

  async analyzePrompt(prompt) {
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    await delay(1000); // Simulate AI analysis
    
    // AI would analyze the prompt and suggest form fields
    // This is a mock implementation that detects common patterns
    const fields = [];
    let fieldId = 1;
    
    // Detect common field patterns in prompts
    const patterns = [
      { regex: /name|title|product/i, type: 'text', label: 'Name/Title' },
      { regex: /email|contact/i, type: 'email', label: 'Email Address' },
      { regex: /description|details|explain/i, type: 'textarea', label: 'Description' },
      { regex: /category|type|style/i, type: 'select', label: 'Category', options: ['Option 1', 'Option 2', 'Option 3'] },
      { regex: /audience|target|demographic/i, type: 'select', label: 'Target Audience', options: ['General', 'Professional', 'Students', 'Seniors'] },
      { regex: /tone|voice|style/i, type: 'select', label: 'Tone', options: ['Professional', 'Casual', 'Friendly', 'Formal'] },
      { regex: /budget|price|cost/i, type: 'number', label: 'Budget' },
      { regex: /website|url|link/i, type: 'url', label: 'Website URL' }
    ];

    patterns.forEach(pattern => {
      if (pattern.regex.test(prompt)) {
        fields.push({
          id: `field-${fieldId++}`,
          label: pattern.label,
          variable: pattern.label.toLowerCase().replace(/[^a-z0-9]/g, '_'),
          type: pattern.type,
          options: pattern.options || null,
          required: true
        });
      }
    });

    // Always add at least one field if none detected
    if (fields.length === 0) {
      fields.push({
        id: 'field-1',
        label: 'User Input',
        variable: 'user_input',
        type: 'text',
        required: true
      });
    }

    return { fields, analyzedPrompt: prompt };
  }
};

export default promptChainService;