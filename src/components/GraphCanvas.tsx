import { useRef, useState, useCallback, useEffect } from 'react';
import { Node, Edge, NodeState } from '@/types/graph';

interface GraphCanvasProps {
  nodes: Node[];
  edges: Edge[];
  nodeStates: Record<string, NodeState>;
  activeEdges: Set<string>;
  selectedNode: string | null;
  edgeMode: boolean;
  edgeStart: string | null;
  onNodeAdd: (x: number, y: number) => void;
  onNodeMove: (id: string, x: number, y: number) => void;
  onNodeSelect: (id: string | null) => void;
  onEdgeCreate: (source: string, target: string) => void;
  onNodeDelete: (id: string) => void;
}

const GraphCanvas = ({
  nodes,
  edges,
  nodeStates,
  activeEdges,
  selectedNode,
  edgeMode,
  edgeStart,
  onNodeAdd,
  onNodeMove,
  onNodeSelect,
  onEdgeCreate,
  onNodeDelete
}: GraphCanvasProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const getNodeColor = (state: NodeState) => {
    switch (state) {
      case 'current': return 'hsl(145, 70%, 50%)';
      case 'visited': return 'hsl(280, 70%, 50%)';
      case 'articulation': return 'hsl(0, 85%, 55%)';
      default: return 'hsl(220, 25%, 25%)';
    }
  };

  const getNodeGlow = (state: NodeState) => {
    switch (state) {
      case 'current': return '0 0 20px hsl(145, 70%, 50%), 0 0 40px hsl(145, 70%, 30%)';
      case 'visited': return '0 0 15px hsl(280, 70%, 40%)';
      case 'articulation': return '0 0 20px hsl(0, 85%, 55%), 0 0 40px hsl(0, 85%, 35%)';
      default: return 'none';
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (dragging) return;
    
    const svg = svgRef.current;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicked on empty space
    const clickedOnNode = nodes.some(node => {
      const dx = node.x - x;
      const dy = node.y - y;
      return Math.sqrt(dx * dx + dy * dy) < 30;
    });

    if (!clickedOnNode && !edgeMode) {
      onNodeAdd(x, y);
    }
  };

  const handleNodeClick = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    
    if (edgeMode) {
      if (edgeStart && edgeStart !== nodeId) {
        onEdgeCreate(edgeStart, nodeId);
      } else {
        onNodeSelect(nodeId);
      }
    } else {
      onNodeSelect(nodeId === selectedNode ? null : nodeId);
    }
  };

  const handleNodeDoubleClick = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    onNodeDelete(nodeId);
  };

  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    if (!edgeMode) {
      setDragging(nodeId);
    }
  };

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    if (dragging) {
      onNodeMove(dragging, x, y);
    }
  }, [dragging, onNodeMove]);

  const handleMouseUp = () => {
    setDragging(null);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setDragging(null);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  const startNode = edgeStart ? nodes.find(n => n.id === edgeStart) : null;

  return (
    <svg
      ref={svgRef}
      className="w-full h-full grid-pattern cursor-crosshair"
      onClick={handleCanvasClick}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Edges */}
      {edges.map(edge => {
        const source = nodes.find(n => n.id === edge.source);
        const target = nodes.find(n => n.id === edge.target);
        if (!source || !target) return null;

        const isActive = activeEdges.has(edge.id);

        return (
          <line
            key={edge.id}
            x1={source.x}
            y1={source.y}
            x2={target.x}
            y2={target.y}
            stroke={isActive ? 'hsl(175, 85%, 50%)' : 'hsl(220, 20%, 35%)'}
            strokeWidth={isActive ? 3 : 2}
            strokeLinecap="round"
            style={{
              filter: isActive ? 'drop-shadow(0 0 8px hsl(175, 85%, 50%))' : 'none',
              transition: 'all 0.3s ease'
            }}
          />
        );
      })}

      {/* Edge creation preview */}
      {edgeMode && startNode && (
        <line
          x1={startNode.x}
          y1={startNode.y}
          x2={mousePos.x}
          y2={mousePos.y}
          stroke="hsl(175, 85%, 50%)"
          strokeWidth={2}
          strokeDasharray="8 4"
          opacity={0.6}
        />
      )}

      {/* Nodes */}
      {nodes.map(node => {
        const state = nodeStates[node.id] || 'default';
        const isSelected = node.id === selectedNode;
        const isEdgeStart = node.id === edgeStart;

        return (
          <g
            key={node.id}
            style={{ cursor: edgeMode ? 'pointer' : 'grab' }}
            onClick={(e) => handleNodeClick(e, node.id)}
            onDoubleClick={(e) => handleNodeDoubleClick(e, node.id)}
            onMouseDown={(e) => handleMouseDown(e, node.id)}
          >
            {/* Outer glow ring for selected/active nodes */}
            {(isSelected || isEdgeStart || state === 'current') && (
              <circle
                cx={node.x}
                cy={node.y}
                r={35}
                fill="none"
                stroke={state === 'current' ? 'hsl(145, 70%, 50%)' : 'hsl(175, 85%, 50%)'}
                strokeWidth={2}
                opacity={0.5}
                className={state === 'current' ? 'node-pulse' : ''}
              />
            )}
            
            {/* Main node circle */}
            <circle
              cx={node.x}
              cy={node.y}
              r={28}
              fill={getNodeColor(state)}
              stroke={isSelected || isEdgeStart ? 'hsl(175, 85%, 50%)' : 'hsl(220, 20%, 40%)'}
              strokeWidth={isSelected || isEdgeStart ? 3 : 2}
              style={{
                filter: getNodeGlow(state) !== 'none' ? `drop-shadow(${getNodeGlow(state)})` : 'none',
                transition: 'all 0.3s ease'
              }}
            />
            
            {/* Node label */}
            <text
              x={node.x}
              y={node.y}
              textAnchor="middle"
              dominantBaseline="central"
              fill="hsl(180, 100%, 95%)"
              fontSize="14"
              fontWeight="600"
              fontFamily="'JetBrains Mono', monospace"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {node.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export default GraphCanvas;
