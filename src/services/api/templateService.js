import { toast } from 'react-toastify';

const { ApperClient } = window.ApperSDK;
const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

export const templateService = {
  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "description" } },
          { field: { Name: "category" } },
          { field: { Name: "thumbnail" } },
          { field: { Name: "nodes" } },
          { field: { Name: "connections" } },
          { field: { Name: "settings" } },
          { field: { Name: "uses" } },
          { field: { Name: "rating" } },
          { field: { Name: "created_at" } },
          { field: { Name: "updated_at" } }
        ],
        orderBy: [
          { fieldName: "created_at", sorttype: "DESC" }
        ]
      };

      const response = await apperClient.fetchRecords('template', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      // Transform database fields to UI format
      const templates = (response.data || []).map(template => ({
        Id: template.Id,
        name: template.Name,
        description: template.description,
        category: template.category,
        thumbnail: template.thumbnail,
        nodes: template.nodes ? JSON.parse(template.nodes) : [],
        connections: template.connections ? JSON.parse(template.connections) : [],
        settings: template.settings ? JSON.parse(template.settings) : {},
        uses: template.uses || 0,
        rating: template.rating || 0,
        createdAt: template.created_at,
        updatedAt: template.updated_at,
        tags: template.Tags
      }));

      return templates;
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast.error("Failed to load templates");
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
          { field: { Name: "category" } },
          { field: { Name: "thumbnail" } },
          { field: { Name: "nodes" } },
          { field: { Name: "connections" } },
          { field: { Name: "settings" } },
          { field: { Name: "uses" } },
          { field: { Name: "rating" } },
          { field: { Name: "created_at" } },
          { field: { Name: "updated_at" } }
        ]
      };

      const response = await apperClient.getRecordById('template', parseInt(id, 10), params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (!response.data) {
        throw new Error('Template not found');
      }

      // Transform database fields to UI format
      const template = {
        Id: response.data.Id,
        name: response.data.Name,
        description: response.data.description,
        category: response.data.category,
        thumbnail: response.data.thumbnail,
        nodes: response.data.nodes ? JSON.parse(response.data.nodes) : [],
        connections: response.data.connections ? JSON.parse(response.data.connections) : [],
        settings: response.data.settings ? JSON.parse(response.data.settings) : {},
        uses: response.data.uses || 0,
        rating: response.data.rating || 0,
        createdAt: response.data.created_at,
        updatedAt: response.data.updated_at,
        tags: response.data.Tags
      };

      return template;
    } catch (error) {
      console.error(`Error fetching template with ID ${id}:`, error);
      throw error;
    }
  },

  async create(templateData) {
    try {
      const params = {
        records: [
          {
            Name: templateData.name,
            description: templateData.description,
            category: templateData.category,
            thumbnail: templateData.thumbnail,
            nodes: JSON.stringify(templateData.nodes || []),
            connections: JSON.stringify(templateData.connections || []),
            settings: JSON.stringify(templateData.settings || {}),
            uses: templateData.uses || 0,
            rating: templateData.rating || 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]
      };

      const response = await apperClient.createRecord('template', params);
      
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
      console.error("Error creating template:", error);
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
            category: updates.category,
            thumbnail: updates.thumbnail,
            nodes: JSON.stringify(updates.nodes || []),
            connections: JSON.stringify(updates.connections || []),
            settings: JSON.stringify(updates.settings || {}),
            uses: updates.uses || 0,
            rating: updates.rating || 0,
            updated_at: new Date().toISOString()
          }
        ]
      };

      const response = await apperClient.updateRecord('template', params);
      
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
      console.error("Error updating template:", error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const params = {
        RecordIds: [parseInt(id, 10)]
      };

      const response = await apperClient.deleteRecord('template', params);
      
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
      console.error("Error deleting template:", error);
      throw error;
    }
  },

  async useTemplate(id) {
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    await delay(400);
    
    const template = await this.getById(id);
    
    // Create a new prompt chain from template
    const newChain = {
      name: `${template.name} - Copy`,
      description: template.description,
      nodes: [...template.nodes],
      connections: [...template.connections],
      settings: { ...template.settings },
      category: template.category
    };

    return newChain;
  }
};

export default templateService;