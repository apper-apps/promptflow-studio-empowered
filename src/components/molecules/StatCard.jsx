import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Card from '@/components/atoms/Card';

const StatCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'positive',
  icon, 
  className = '',
  ...props 
}) => {
  const changeColors = {
    positive: 'text-success',
    negative: 'text-error',
    neutral: 'text-gray-400'
  };

  const changeIcons = {
    positive: 'TrendingUp',
    negative: 'TrendingDown',
    neutral: 'Minus'
  };

  return (
    <Card hover className={className} {...props}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-white mb-2">{value}</p>
          
          {change !== undefined && (
            <div className={`flex items-center gap-1 text-sm ${changeColors[changeType]}`}>
              <ApperIcon name={changeIcons[changeType]} size={14} />
              <span>{Math.abs(change)}%</span>
              <span className="text-gray-500 ml-1">vs last period</span>
            </div>
          )}
        </div>
        
        {icon && (
          <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
            <ApperIcon name={icon} size={24} className="text-primary" />
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatCard;