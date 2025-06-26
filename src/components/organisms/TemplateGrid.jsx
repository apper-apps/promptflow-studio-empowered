import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import ApperIcon from '@/components/ApperIcon';
import SearchBar from '@/components/molecules/SearchBar';

const TemplateGrid = ({ 
  templates = [], 
  onUseTemplate,
  className = '' 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const navigate = useNavigate();

  const categories = ['all', ...new Set(templates.map(t => t.category))];
  
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleUseTemplate = async (template) => {
    try {
      await onUseTemplate?.(template.Id);
      toast.success(`Using template: ${template.name}`);
      navigate('/chains');
    } catch (error) {
      toast.error('Failed to use template');
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Marketing': 'TrendingUp',
      'Research': 'Search',
      'Email Marketing': 'Mail',
      'Documentation': 'FileText',
      'Education': 'GraduationCap'
    };
    return icons[category] || 'Folder';
  };

  return (
    <div className={className}>
      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search templates..."
        />
        
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap
                transition-all duration-200
                ${selectedCategory === category
                  ? 'bg-primary text-white'
                  : 'bg-surface glass text-gray-300 hover:text-white hover:bg-white/10'
                }
              `}
            >
              {category === 'all' ? 'All Templates' : category}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template, index) => (
          <motion.div
            key={template.Id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card hover className="h-full flex flex-col">
              {/* Template Header */}
              <div className="p-6 border-b border-glass-border">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                    <ApperIcon 
                      name={getCategoryIcon(template.category)} 
                      size={24} 
                      className="text-primary" 
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" size="xs">
                      {template.category}
                    </Badge>
                  </div>
                </div>
                
                <h3 className="font-semibold text-white mb-2 line-clamp-2">
                  {template.name}
                </h3>
                <p className="text-sm text-gray-400 line-clamp-3">
                  {template.description}
                </p>
              </div>

              {/* Template Stats */}
              <div className="p-4 border-b border-glass-border">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-gray-400">
                    <ApperIcon name="Users" size={14} />
                    <span>{template.uses} uses</span>
                  </div>
                  <div className="flex items-center gap-1 text-warning">
                    <ApperIcon name="Star" size={14} />
                    <span>{template.rating}</span>
                  </div>
                </div>
              </div>

              {/* Template Nodes Preview */}
              <div className="p-4 flex-1">
                <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">
                  {template.nodes?.length || 0} Nodes
                </p>
                <div className="flex flex-wrap gap-1">
                  {template.nodes?.slice(0, 3).map((node, i) => (
                    <Badge key={i} variant="outline" size="xs">
                      {node.fieldType}
                    </Badge>
                  ))}
                  {template.nodes?.length > 3 && (
                    <Badge variant="outline" size="xs">
                      +{template.nodes.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 pt-0">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleUseTemplate(template)}
                    icon="Play"
                    className="flex-1"
                  >
                    Use Template
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    icon="Eye"
                    onClick={() => {
                      // Preview functionality could be added here
                      toast.info('Template preview coming soon');
                    }}
                  >
                    Preview
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <ApperIcon name="Search" size={32} className="text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No templates found</h3>
          <p className="text-gray-400">
            {searchQuery 
              ? `No templates match "${searchQuery}"`
              : 'No templates available in this category'
            }
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default TemplateGrid;