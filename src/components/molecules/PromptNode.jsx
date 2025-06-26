import { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { motion } from 'framer-motion';
import Card from '@/components/atoms/Card';
import ApperIcon from '@/components/ApperIcon';
import Badge from '@/components/atoms/Badge';

const PromptNode = ({ data, selected }) => {
  const [isEditing, setIsEditing] = useState(false);

  const fieldTypeIcons = {
    text: 'Type',
    textarea: 'FileText',
    select: 'List',
    multiselect: 'CheckSquare',
    number: 'Hash',
    email: 'Mail',
    url: 'Link'
  };

  const fieldTypeColors = {
    text: 'primary',
    textarea: 'secondary',
    select: 'success',
    multiselect: 'warning',
    number: 'primary',
    email: 'secondary',
    url: 'success'
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      animate={selected ? { scale: 1.05, boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)' } : {}}
      transition={{ duration: 0.2 }}
    >
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-3 h-3 bg-primary border-2 border-white"
      />
      
      <Card 
        className={`
          min-w-[250px] transition-all duration-200
          ${selected ? 'border-primary ring-2 ring-primary/50' : ''}
        `}
        padding="md"
      >
        <div className="space-y-3">
          {/* Node Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-white text-sm line-clamp-2">
                {data.label || 'Untitled Prompt'}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                {data.variable ? `{{${data.variable}}}` : 'No variable'}
              </p>
            </div>
            
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-1 hover:bg-white/10 rounded transition-colors"
            >
              <ApperIcon name="Edit3" size={14} className="text-gray-400" />
            </button>
          </div>

          {/* Field Type Badge */}
          <div className="flex items-center gap-2">
            <Badge 
              variant={fieldTypeColors[data.fieldType] || 'default'}
              size="xs"
              className="flex items-center gap-1"
            >
              <ApperIcon 
                name={fieldTypeIcons[data.fieldType] || 'HelpCircle'} 
                size={10} 
              />
              {data.fieldType || 'text'}
            </Badge>
            
            {data.required && (
              <Badge variant="error" size="xs">
                Required
              </Badge>
            )}
          </div>

          {/* Options Preview */}
          {data.options && data.options.length > 0 && (
            <div className="text-xs text-gray-400">
              <p className="mb-1">Options:</p>
              <div className="flex flex-wrap gap-1">
                {data.options.slice(0, 3).map((option, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-surface/50 rounded text-xs"
                  >
                    {option}
                  </span>
                ))}
                {data.options.length > 3 && (
                  <span className="px-2 py-1 bg-surface/50 rounded text-xs">
                    +{data.options.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Conditions Indicator */}
          {data.conditions && data.conditions.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-warning">
              <ApperIcon name="GitBranch" size={12} />
              <span>{data.conditions.length} condition{data.conditions.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </Card>

      <Handle 
        type="source" 
        position={Position.Right} 
        className="w-3 h-3 bg-primary border-2 border-white"
      />
    </motion.div>
  );
};

export default PromptNode;