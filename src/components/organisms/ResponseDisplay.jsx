import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import ApperIcon from '@/components/ApperIcon';

const ResponseDisplay = ({ 
  response, 
  prompt,
  tokenUsage,
  model,
  className = '' 
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  if (!response) {
    return null;
  }

  return (
    <div className={className}>
      <Card>
        <div className="p-6 border-b border-glass-border">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <ApperIcon name="Sparkles" size={24} />
              AI Response
            </h2>
            
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="sm">
                {model}
              </Badge>
              {tokenUsage && (
                <Badge variant="secondary" size="sm">
                  {tokenUsage.total} tokens
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Final Prompt */}
          {prompt && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                  Final Prompt
                </h3>
                <Button
                  size="sm"
                  variant="ghost"
                  icon={copied ? "Check" : "Copy"}
                  onClick={() => copyToClipboard(prompt)}
                >
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
              
              <div className="bg-background/50 border border-glass-border rounded-lg p-4">
                <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                  {prompt}
                </pre>
              </div>
            </motion.div>
          )}

          {/* AI Response */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                Generated Response
              </h3>
              <Button
                size="sm"
                variant="ghost"
                icon="Copy"
                onClick={() => copyToClipboard(response)}
              >
                Copy Response
              </Button>
            </div>
            
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20 rounded-lg p-6">
              <div className="prose prose-invert max-w-none">
                <div className="text-white whitespace-pre-wrap leading-relaxed">
                  {response}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Token Usage */}
          {tokenUsage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-3 gap-4"
            >
              <div className="text-center p-4 bg-background/30 rounded-lg">
                <p className="text-2xl font-bold text-primary">{tokenUsage.prompt}</p>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Prompt Tokens</p>
              </div>
              <div className="text-center p-4 bg-background/30 rounded-lg">
                <p className="text-2xl font-bold text-secondary">{tokenUsage.completion}</p>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Completion Tokens</p>
              </div>
              <div className="text-center p-4 bg-background/30 rounded-lg">
                <p className="text-2xl font-bold text-accent">{tokenUsage.total}</p>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Total Tokens</p>
              </div>
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-glass-border">
            <Button variant="outline" icon="RefreshCw" className="flex-1">
              Regenerate
            </Button>
            <Button variant="secondary" icon="Download" className="flex-1">
              Export
            </Button>
            <Button variant="secondary" icon="Share" className="flex-1">
              Share
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ResponseDisplay;