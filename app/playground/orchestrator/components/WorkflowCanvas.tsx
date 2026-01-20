'use client';

import { useCallback, useRef, useEffect, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Connection,
  Edge,
  Node,
  useNodesState,
  useEdgesState,
  NodeTypes,
  Panel,
  ReactFlowProvider,
} from '@xyflow/react';
// React Flow CSS imported in globals.css;

import TaskNode from './TaskNode';
import { useWorkflowStore } from '@/store/workflowStore';

// Custom edge styles
const customEdgeStyle = {
  stroke: '#6B7280',
  strokeWidth: 2,
};

const animatedEdgeStyle = {
  stroke: '#8B5CF6',
  strokeWidth: 2,
  strokeDasharray: '5 5',
};

interface WorkflowCanvasProps {
  onNodeSelect: (nodeId: string | null) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nodeTypes: NodeTypes = {
  taskNode: TaskNode as any,
};

function WorkflowCanvasInner({ onNodeSelect }: WorkflowCanvasProps) {
  const workflowNodes = useWorkflowStore(state => state.nodes);
  const connections = useWorkflowStore(state => state.connections);
  const addNode = useWorkflowStore(state => state.addNode);
  const removeNode = useWorkflowStore(state => state.removeNode);
  const updateNodePosition = useWorkflowStore(state => state.updateNodePosition);
  const addConnection = useWorkflowStore(state => state.addConnection);
  const removeConnection = useWorkflowStore(state => state.removeConnection);
  const selectNode = useWorkflowStore(state => state.selectNode);
  const isSimulating = useWorkflowStore(state => state.isSimulating);

  const [nodes, setNodes, onNodesChange] = useNodesState([] as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([] as Edge[]);

  // Track if this is the initial mount
  const isInitialMount = useRef(true);

  // Convert workflow nodes to React Flow nodes
  useEffect(() => {
    const reactFlowNodes: Node[] = workflowNodes.map(node => ({
      id: node.id,
      type: 'taskNode',
      position: node.position,
      data: {
        taskId: node.taskId,
        status: node.status,
        nodeId: node.id,
      },
    }));
    setNodes(reactFlowNodes);
  }, [workflowNodes, setNodes]);

  // Convert workflow connections to React Flow edges
  useEffect(() => {
    const reactFlowEdges: Edge[] = connections.map(conn => ({
      id: conn.id,
      source: conn.sourceNode,
      target: conn.targetNode,
      sourceHandle: conn.sourceHandle,
      targetHandle: conn.targetHandle,
      animated: isSimulating,
      style: isSimulating ? animatedEdgeStyle : customEdgeStyle,
    }));
    setEdges(reactFlowEdges);
  }, [connections, isSimulating, setEdges]);

  // Handle new connections
  const onConnect = useCallback(
    (params: Connection) => {
      if (params.source && params.target) {
        addConnection({
          sourceNode: params.source,
          sourceHandle: params.sourceHandle || 'default',
          targetNode: params.target,
          targetHandle: params.targetHandle || 'default',
        });
      }
    },
    [addConnection]
  );

  // Handle node position changes
  const onNodeDragStop = useCallback(
    (_: any, node: Node) => {
      updateNodePosition(node.id, node.position);
    },
    [updateNodePosition]
  );

  // Handle node selection
  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes }: { nodes: Node[] }) => {
      const selectedNode = selectedNodes[0];
      selectNode(selectedNode?.id || null);
      onNodeSelect(selectedNode?.id || null);
    },
    [selectNode, onNodeSelect]
  );

  // Handle edge deletion
  const onEdgeClick = useCallback(
    (_: any, edge: Edge) => {
      removeConnection(edge.id);
    },
    [removeConnection]
  );

  // Handle drop from task library
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const data = event.dataTransfer.getData('application/json');
      if (!data) return;

      const { taskId } = JSON.parse(data);
      if (!taskId) return;

      // Get the drop position relative to the canvas
      const reactFlowBounds = event.currentTarget.getBoundingClientRect();
      const position = {
        x: event.clientX - reactFlowBounds.left - 70,
        y: event.clientY - reactFlowBounds.top - 40,
      };

      addNode(taskId, position);
    },
    [addNode]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  return (
    <div className="w-full h-full" onDrop={onDrop} onDragOver={onDragOver}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        onSelectionChange={onSelectionChange}
        onEdgeClick={onEdgeClick}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid
        snapGrid={[16, 16]}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        minZoom={0.5}
        maxZoom={2}
        deleteKeyCode="Backspace"
        className="bg-background"
      >
        <Background color="#374151" gap={16} />
        <Controls
          className="!bg-card !border-gray-700 !rounded-card [&>button]:!bg-card [&>button]:!border-gray-700 [&>button]:!rounded-button [&>button:hover]:!bg-card-hover"
        />
        <MiniMap
          nodeColor={(node) => {
            const status = node.data?.status;
            if (status === 'completed') return '#22C55E';
            if (status === 'error') return '#DC2626';
            if (status === 'running') return '#8B5CF6';
            return '#6B7280';
          }}
          maskColor="rgba(0, 0, 0, 0.8)"
          className="!bg-card !border-gray-700 !rounded-card"
        />

        {/* Empty state */}
        {nodes.length === 0 && (
          <Panel position="top-center" className="!top-1/2 !-translate-y-1/2">
            <div className="text-center px-8 py-6 bg-card/50 backdrop-blur border border-gray-700 rounded-card">
              <div className="text-4xl mb-3">🎨</div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Start Building Your Workflow
              </h3>
              <p className="text-sm text-gray-400 max-w-xs">
                Drag tasks from the library on the left, or click &quot;Add&quot; to place them on the canvas.
                Connect tasks to create your workflow.
              </p>
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}

export default function WorkflowCanvas(props: WorkflowCanvasProps) {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
