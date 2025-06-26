import { templates } from '../mockData/templates.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let data = [...templates];

export const templateService = {
  async getAll() {
    await delay(300);
    return [...data];
  },

  async getById(id) {
    await delay(250);
    const template = data.find(item => item.Id === parseInt(id, 10));
    if (!template) {
      throw new Error('Template not found');
    }
    return { ...template };
  },

  async create(templateData) {
    await delay(400);
    const maxId = Math.max(...data.map(item => item.Id), 0);
    const newTemplate = {
      ...templateData,
      Id: maxId + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    data.push(newTemplate);
    return { ...newTemplate };
  },

  async update(id, updates) {
    await delay(350);
    const index = data.findIndex(item => item.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Template not found');
    }
    
    const updated = {
      ...data[index],
      ...updates,
      Id: data[index].Id,
      updatedAt: new Date().toISOString()
    };
    
    data[index] = updated;
    return { ...updated };
  },

  async delete(id) {
    await delay(300);
    const index = data.findIndex(item => item.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Template not found');
    }
    
    const deleted = data[index];
    data.splice(index, 1);
    return { ...deleted };
  },

  async useTemplate(id) {
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