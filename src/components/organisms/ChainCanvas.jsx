import { useCallback, useRef } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion } from 'framer-motion';
import PromptNode from '@/components/molecules/PromptNode';
import Button from '@/components/atoms/Button';

const nodeTypes = {
  promptNode: PromptNode,
};

const ChainCanvas = ({ 
  nodes: initialNodes = [], 
  edges: initialEdges = [],
  onNodesChange: onNodesChangeCallback,
  onEdgesChange: onEdgesChangeCallback,
  onConnect,
  onAddNode,
  selectedNode,
  onNodeSelect,
  className = ''
}) => {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnectCallback = useCallback(
    (params) => {
      const newEdge = {
        ...params,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#3B82F6', strokeWidth: 2 }
      };
      setEdges((eds) => addEdge(newEdge, eds));
      onConnect?.(newEdge);
    },
    [setEdges, onConnect]
  );

  const handleNodesChange = useCallback((changes) => {
    onNodesChange(changes);
    onNodesChangeCallback?.(changes);
  }, [onNodesChange, onNodesChangeCallback]);

  const handleEdgesChange = useCallback((changes) => {
    onEdgesChange(changes);
    onEdgesChangeCallback?.(changes);
  }, [onEdgesChange, onEdgesChangeCallback]);

  const onNodeClick = useCallback((event, node) => {
    onNodeSelect?.(node);
  }, [onNodeSelect]);

  const onPaneClick = useCallback(() => {
    onNodeSelect?.(null);
  }, [onNodeSelect]);

  const handleAddNode = () => {
    const newNode = {
      id: `node-${Date.now()}`,
      type: 'promptNode',
      position: { x: Math.random() * 400, y: Math.random() * 300 },
      data: {
        label: 'New Prompt',
        variable: 'new_variable',
        fieldType: 'text',
        onEdit: (data) => {
          setNodes((nds) =>
            nds.map((node) =>
              node.id === newNode.id ? { ...node, data: { ...node.data, ...data } } : node
            )
          );
        }
      }
    };
    
    setNodes((nds) => [...nds, newNode]);
    onAddNode?.(newNode);
  };

  return (
    <div className={`h-full w-full ${className}`}>
      <ReactFlowProvider>
        <div className="relative h-full" ref={reactFlowWrapper}>
          {/* Canvas Toolbar */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-4 left-4 z-10 flex gap-2"
          >
            <Button 
              size="sm" 
              onClick={handleAddNode}
              icon="Plus"
              className="glass"
            >
              Add Node
            </Button>
            <Button 
              size="sm" 
              variant="secondary"
              icon="Play"
              className="glass"
            >
              Test Chain
            </Button>
          </motion.div>

          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={onConnectCallback}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            className="bg-background"
            connectionLineStyle={{ stroke: '#3B82F6', strokeWidth: 2 }}
            defaultEdgeOptions={{
              type: 'smoothstep',
              animated: true,
              style: { stroke: '#3B82F6', strokeWidth: 2 }
            }}
          >
            <Background 
              color="#334155" 
              gap={20} 
              size={1}
              variant="dots"
            />
            <Controls 
              className="bg-surface glass border border-glass-border"
              showInteractive={false}
            />
            <MiniMap 
              className="bg-surface glass border border-glass-border"
              nodeColor="#3B82F6"
              maskColor="rgba(15, 23, 42, 0.8)"
            />
          </ReactFlow>
        </div>
      </ReactFlowProvider>
    </div>
  );
};

export default ChainCanvas;