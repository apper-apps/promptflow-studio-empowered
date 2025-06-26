import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ChainCanvas from '@/components/organisms/ChainCanvas';
import PropertiesPanel from '@/components/organisms/PropertiesPanel';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Card from '@/components/atoms/Card';
import Badge from '@/components/atoms/Badge';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import ErrorState from '@/components/molecules/ErrorState';
import ApperIcon from '@/components/ApperIcon';
import promptChainService from '@/services/api/promptChainService';
import WizardBuilder from '@/components/organisms/WizardBuilder';

const ChainEditor = () => {
  const [currentChain, setCurrentChain] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [chainName, setChainName] = useState('Untitled Chain');
  const [chainDescription, setChainDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Initialize with a basic setup
    initializeNewChain();
  }, []);

  const initializeNewChain = () => {
    const initialNodes = [
      {
        id: 'node-1',
        type: 'promptNode',
        position: { x: 250, y: 100 },
        data: {
          label: 'Start Here',
          variable: 'user_input',
          fieldType: 'text',
          required: true,
          onEdit: handleNodeUpdate
        }
      }
    ];

    setNodes(initialNodes);
    setEdges([]);
    setChainName('Untitled Chain');
    setChainDescription('');
    setSelectedNode(null);
  };

  const handleNodeUpdate = useCallback((nodeId, updates) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...updates } }
          : node
      )
    );
  }, []);

  const handleNodeDelete = useCallback((nodeId) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => 
      edge.source !== nodeId && edge.target !== nodeId
    ));
    setSelectedNode(null);
    toast.success('Node deleted');
  }, []);

  const handleAddNode = useCallback(() => {
    const newNode = {
      id: `node-${Date.now()}`,
      type: 'promptNode',
      position: { 
        x: Math.random() * 400 + 100, 
        y: Math.random() * 300 + 100 
      },
      data: {
        label: 'New Prompt',
        variable: 'new_variable',
        fieldType: 'text',
        required: false,
        onEdit: handleNodeUpdate
      }
    };

    setNodes((nds) => [...nds, newNode]);
    setSelectedNode(newNode);
    toast.success('Node added');
  }, [handleNodeUpdate]);

  const handleSaveChain = async () => {
    if (!chainName.trim()) {
      toast.error('Please enter a chain name');
      return;
    }

    setSaving(true);
    try {
      const chainData = {
        name: chainName,
        description: chainDescription,
        nodes: nodes.map(node => ({
          id: node.id,
          label: node.data.label,
          variable: node.data.variable,
          fieldType: node.data.fieldType,
          options: node.data.options || [],
          conditions: node.data.conditions || [],
          position: node.position,
          required: node.data.required || false
        })),
        connections: edges.map(edge => ({
          source: edge.source,
          target: edge.target
        })),
        settings: {
          autoSave: true,
          version: '1.0'
        },
        status: 'draft'
      };

      if (currentChain) {
        await promptChainService.update(currentChain.Id, chainData);
        toast.success('Chain updated successfully');
      } else {
        const newChain = await promptChainService.create(chainData);
        setCurrentChain(newChain);
        toast.success('Chain created successfully');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save chain');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateForm = async () => {
    if (nodes.length === 0) {
      toast.error('Add some nodes first');
      return;
    }

    try {
      await handleSaveChain(); // Save current state first
      toast.success('Form generation started');
      // Navigate to preview would happen here
    } catch (err) {
      toast.error('Failed to generate form');
    }
  };

  const handleTestChain = () => {
    if (nodes.length === 0) {
      toast.error('Add some nodes to test');
      return;
    }
    
    toast.success('Test execution started');
    // Test logic would go here
  };

  if (loading) {
    return (
      <div className="h-full flex">
        <div className="flex-1 p-6">
          <SkeletonLoader count={1} height="h-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <ErrorState message={error} onRetry={initializeNewChain} />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-shrink-0 p-6 bg-surface glass border-b border-glass-border"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="flex-1 min-w-0 max-w-md">
              <Input
                value={chainName}
                onChange={(e) => setChainName(e.target.value)}
                placeholder="Chain name"
                className="text-xl font-semibold"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary" size="sm">
                {nodes.length} nodes
              </Badge>
              <Badge variant="outline" size="sm">
                Draft
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleTestChain}
              icon="Play"
            >
              Test
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateForm}
              icon="FileText"
            >
              Generate Form
            </Button>
            <Button
              onClick={handleSaveChain}
              loading={saving}
              icon="Save"
              size="sm"
            >
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>

        {/* Description */}
        <div className="mt-4">
          <Input
            value={chainDescription}
            onChange={(e) => setChainDescription(e.target.value)}
            placeholder="Add a description for your chain..."
            className="text-sm"
          />
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Canvas Area */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 relative"
        >
          <ChainCanvas
            nodes={nodes}
            edges={edges}
            onNodesChange={(changes) => {
              // Handle node changes from ReactFlow
              const updatedNodes = [...nodes];
              changes.forEach(change => {
                if (change.type === 'position' && change.dragging === false) {
                  const nodeIndex = updatedNodes.findIndex(n => n.id === change.id);
                  if (nodeIndex !== -1) {
                    updatedNodes[nodeIndex] = {
                      ...updatedNodes[nodeIndex],
                      position: change.position
                    };
                  }
                }
              });
              setNodes(updatedNodes);
            }}
            onEdgesChange={(changes) => {
              // Handle edge changes from ReactFlow
              setEdges(currentEdges => {
                let newEdges = [...currentEdges];
                changes.forEach(change => {
                  if (change.type === 'remove') {
                    newEdges = newEdges.filter(edge => edge.id !== change.id);
                  }
                });
                return newEdges;
              });
            }}
            onConnect={(connection) => {
              setEdges(eds => [...eds, {
                id: `edge-${connection.source}-${connection.target}`,
                ...connection
              }]);
            }}
            selectedNode={selectedNode}
            onNodeSelect={setSelectedNode}
            onAddNode={handleAddNode}
          />

          {/* Floating Action Button */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute bottom-6 right-6"
          >
            <Button
              onClick={handleAddNode}
              icon="Plus"
              size="lg"
              className="rounded-full w-14 h-14 shadow-xl"
            >
            </Button>
          </motion.div>
        </motion.div>

        {/* Properties Panel */}
        <PropertiesPanel
          selectedNode={selectedNode}
          onNodeUpdate={handleNodeUpdate}
          onNodeDelete={handleNodeDelete}
        />
      </div>
    </div>
  );
};

export default ChainEditor;