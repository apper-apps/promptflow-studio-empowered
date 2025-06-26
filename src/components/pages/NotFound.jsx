import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md mx-auto"
      >
        {/* 404 Animation */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="relative">
            <motion.div
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-8xl font-bold text-primary mb-4"
            >
              404
            </motion.div>
            
            {/* Floating icons */}
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 360]
              }}
              transition={{ 
                duration: 6, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -top-4 -right-4 w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center"
            >
              <ApperIcon name="Workflow" size={24} className="text-secondary" />
            </motion.div>
            
            <motion.div
              animate={{ 
                y: [0, 10, 0],
                rotate: [360, 0]
              }}
              transition={{ 
                duration: 8, 
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
              className="absolute -bottom-2 -left-6 w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center"
            >
              <ApperIcon name="Sparkles" size={16} className="text-accent" />
            </motion.div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <h1 className="text-2xl font-bold text-white">
            Page Not Found
          </h1>
          
          <p className="text-gray-400 leading-relaxed">
            Looks like this prompt chain got lost in the digital void. 
            The page you're looking for doesn't exist or may have been moved.
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-3 justify-center mt-8"
        >
          <Button
            onClick={() => navigate('/')}
            icon="Home"
            size="lg"
          >
            Go Home
          </Button>
          
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            icon="ArrowLeft"
            size="lg"
          >
            Go Back
          </Button>
        </motion.div>

        {/* Help Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 pt-8 border-t border-glass-border"
        >
          <h3 className="text-sm font-medium text-gray-400 mb-4">
            Need help? Try these popular sections:
          </h3>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <button
              onClick={() => navigate('/chains')}
              className="flex items-center gap-2 p-3 bg-surface/50 glass rounded-lg hover:bg-surface/70 transition-colors text-left"
            >
              <ApperIcon name="Workflow" size={16} className="text-primary" />
              <span className="text-gray-300">Prompt Chains</span>
            </button>
            
            <button
              onClick={() => navigate('/templates')}
              className="flex items-center gap-2 p-3 bg-surface/50 glass rounded-lg hover:bg-surface/70 transition-colors text-left"
            >
              <ApperIcon name="FileTemplate" size={16} className="text-secondary" />
              <span className="text-gray-300">Templates</span>
            </button>
            
            <button
              onClick={() => navigate('/settings')}
              className="flex items-center gap-2 p-3 bg-surface/50 glass rounded-lg hover:bg-surface/70 transition-colors text-left"
            >
              <ApperIcon name="Settings" size={16} className="text-accent" />
              <span className="text-gray-300">API Settings</span>
            </button>
            
            <button
              onClick={() => navigate('/analytics')}
              className="flex items-center gap-2 p-3 bg-surface/50 glass rounded-lg hover:bg-surface/70 transition-colors text-left"
            >
              <ApperIcon name="BarChart3" size={16} className="text-warning" />
              <span className="text-gray-300">Analytics</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;