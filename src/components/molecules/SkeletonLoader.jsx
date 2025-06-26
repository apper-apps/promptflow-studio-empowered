import { motion } from 'framer-motion';

const SkeletonLoader = ({ 
  count = 3, 
  height = 'h-20', 
  className = '',
  variant = 'card'
}) => {
  const variants = {
    card: 'rounded-lg',
    text: 'rounded',
    circle: 'rounded-full w-12 h-12',
    button: 'rounded-lg h-10 w-24'
  };

  const shimmerVariants = {
    start: { x: '-100%' },
    end: { x: '100%' }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {[...Array(count)].map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1 }}
          className={`
            relative overflow-hidden bg-surface/50 
            ${height} ${variants[variant]}
          `}
        >
          <motion.div
            variants={shimmerVariants}
            animate="end"
            initial="start"
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          />
        </motion.div>
      ))}
    </div>
  );
};

export default SkeletonLoader;