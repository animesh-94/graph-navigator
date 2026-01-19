import { useState, useCallback, useEffect, useRef } from 'react';
import { Node, Edge, AlgorithmType, AlgorithmStep, NodeState } from '@/types/graph';
import { useGraphAlgorithms } from '@/hooks/useGraphAlgorithms';
import GraphCanvas from './GraphCanvas';
import ControlPanel from './ControlPanel';
import GraphLegend from './GraphLegend';

const GraphEditor = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [edgeMode, setEdgeMode] = useState(false);
  const [edgeStart, setEdgeStart] = useState<string | null>(null);
  
  const [algorithm, setAlgorithm] = useState<AlgorithmType>('none');
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [steps, setSteps] = useState<AlgorithmStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [message, setMessage] = useState('Click on the canvas to add nodes');
  
  const [nodeStates, setNodeStates] = useState<Record<string, NodeState>>({});
  const [activeEdges, setActiveEdges] = useState<Set<string>>(new Set());
  
  const nodeCounter = useRef(0);
  const intervalRef = useRef<number | null>(null);

  const { generateBFSSteps, generateDFSSteps, generateArticulationSteps } = useGraphAlgorithms();

  const handleNodeAdd = useCallback((x: number, y: number) => {
    const id = `node-${nodeCounter.current++}`;
    const label = String.fromCharCode(65 + (nodes.length % 26));
    setNodes(prev => [...prev, { id, x, y, label }]);
    setNodeStates(prev => ({ ...prev, [id]: 'default' }));
    setMessage(`Added node ${label}`);
  }, [nodes.length]);

  const handleNodeMove = useCallback((id: string, x: number, y: number) => {
    setNodes(prev => prev.map(node => 
      node.id === id ? { ...node, x, y } : node
    ));
  }, []);

  const handleNodeSelect = useCallback((id: string | null) => {
    if (edgeMode) {
      if (id === null) {
        setEdgeStart(null);
      } else if (edgeStart === null) {
        setEdgeStart(id);
        setMessage(`Select target node for edge from ${nodes.find(n => n.id === id)?.label}`);
      }
    } else {
      setSelectedNode(id);
      if (id) {
        setMessage(`Selected node ${nodes.find(n => n.id === id)?.label}`);
      }
    }
  }, [edgeMode, edgeStart, nodes]);

  const handleEdgeCreate = useCallback((source: string, target: string) => {
    // Check if edge already exists
    const exists = edges.some(e => 
      (e.source === source && e.target === target) ||
      (e.source === target && e.target === source)
    );
    
    if (!exists && source !== target) {
      const id = `edge-${source}-${target}`;
      setEdges(prev => [...prev, { id, source, target }]);
      const sourceLabel = nodes.find(n => n.id === source)?.label;
      const targetLabel = nodes.find(n => n.id === target)?.label;
      setMessage(`Created edge ${sourceLabel} → ${targetLabel}`);
    }
    setEdgeStart(null);
  }, [edges, nodes]);

  const handleNodeDelete = useCallback((id: string) => {
    const nodeLabel = nodes.find(n => n.id === id)?.label;
    setNodes(prev => prev.filter(n => n.id !== id));
    setEdges(prev => prev.filter(e => e.source !== id && e.target !== id));
    setNodeStates(prev => {
      const newStates = { ...prev };
      delete newStates[id];
      return newStates;
    });
    if (selectedNode === id) setSelectedNode(null);
    if (edgeStart === id) setEdgeStart(null);
    setMessage(`Deleted node ${nodeLabel}`);
  }, [nodes, selectedNode, edgeStart]);

  const handleAlgorithmSelect = useCallback((algo: AlgorithmType) => {
    setAlgorithm(algo);
    handleReset();
    if (algo !== 'none') {
      setMessage(`Selected ${algo.toUpperCase()} algorithm. ${algo !== 'articulation' ? 'Click a node to set start point, then press play.' : 'Press play to find articulation points.'}`);
    }
  }, []);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setSteps([]);
    setCurrentStep(0);
    setActiveEdges(new Set());
    setNodeStates(Object.fromEntries(nodes.map(n => [n.id, 'default' as NodeState])));
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setMessage('Reset complete. Ready to run algorithm.');
  }, [nodes]);

  const handleStart = useCallback(() => {
    if (nodes.length === 0) {
      setMessage('Add some nodes first!');
      return;
    }

    let generatedSteps: AlgorithmStep[] = [];
    const startNode = selectedNode || nodes[0].id;

    switch (algorithm) {
      case 'bfs':
        generatedSteps = generateBFSSteps(nodes, edges, startNode);
        break;
      case 'dfs':
        generatedSteps = generateDFSSteps(nodes, edges, startNode);
        break;
      case 'articulation':
        generatedSteps = generateArticulationSteps(nodes, edges);
        break;
    }

    setSteps(generatedSteps);
    setCurrentStep(0);
    setIsRunning(true);
  }, [nodes, edges, algorithm, selectedNode, generateBFSSteps, generateDFSSteps, generateArticulationSteps]);

  const handlePause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const handleStep = useCallback(() => {
    if (steps.length === 0) {
      handleStart();
      handlePause();
      return;
    }
    
    if (currentStep < steps.length) {
      const step = steps[currentStep];
      setNodeStates(step.nodeStates);
      setActiveEdges(new Set(Object.keys(step.edgeStates).filter(k => step.edgeStates[k])));
      setMessage(step.message);
      setCurrentStep(prev => prev + 1);
    }
  }, [steps, currentStep, handleStart, handlePause]);

  const handleClearGraph = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setNodeStates({});
    setActiveEdges(new Set());
    setSelectedNode(null);
    setEdgeStart(null);
    nodeCounter.current = 0;
    handleReset();
    setMessage('Graph cleared. Click to add nodes.');
  }, [handleReset]);

  const handleEdgeModeToggle = useCallback(() => {
    setEdgeMode(prev => !prev);
    setEdgeStart(null);
    setSelectedNode(null);
    setMessage(edgeMode ? 'Select mode: Click nodes to select, drag to move' : 'Connect mode: Click two nodes to create an edge');
  }, [edgeMode]);

  // Animation loop
  useEffect(() => {
    if (isRunning && steps.length > 0) {
      intervalRef.current = window.setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= steps.length) {
            setIsRunning(false);
            return prev;
          }
          const step = steps[prev];
          setNodeStates(step.nodeStates);
          setActiveEdges(new Set(Object.keys(step.edgeStates).filter(k => step.edgeStates[k])));
          setMessage(step.message);
          return prev + 1;
        });
      }, speed);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, steps, speed]);

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-background">
      {/* Header */}
      <div className="lg:hidden p-4 border-b border-border">
        <h1 className="text-xl font-bold text-primary text-glow font-mono">Graph Editor</h1>
      </div>

      {/* Sidebar */}
      <div className="w-full lg:w-80 p-4 border-b lg:border-b-0 lg:border-r border-border overflow-y-auto flex-shrink-0">
        <div className="hidden lg:block mb-6">
          <h1 className="text-2xl font-bold text-primary text-glow font-mono">Graph Editor</h1>
          <p className="text-sm text-muted-foreground mt-1">Visualize BFS, DFS & Articulation Points</p>
        </div>
        
        <div className="space-y-4">
          <ControlPanel
            algorithm={algorithm}
            isRunning={isRunning}
            speed={speed}
            edgeMode={edgeMode}
            selectedNode={selectedNode}
            nodes={nodes}
            onAlgorithmSelect={handleAlgorithmSelect}
            onStart={handleStart}
            onPause={handlePause}
            onReset={handleReset}
            onStep={handleStep}
            onSpeedChange={setSpeed}
            onEdgeModeToggle={handleEdgeModeToggle}
            onClearGraph={handleClearGraph}
            message={message}
          />
          <GraphLegend />
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden">
        <GraphCanvas
          nodes={nodes}
          edges={edges}
          nodeStates={nodeStates}
          activeEdges={activeEdges}
          selectedNode={selectedNode}
          edgeMode={edgeMode}
          edgeStart={edgeStart}
          onNodeAdd={handleNodeAdd}
          onNodeMove={handleNodeMove}
          onNodeSelect={handleNodeSelect}
          onEdgeCreate={handleEdgeCreate}
          onNodeDelete={handleNodeDelete}
        />
        
        {/* Stats overlay */}
        <div className="absolute bottom-4 right-4 bg-card/80 backdrop-blur-sm border border-border rounded-lg px-4 py-2 font-mono text-sm">
          <span className="text-muted-foreground">Nodes: </span>
          <span className="text-primary">{nodes.length}</span>
          <span className="text-muted-foreground ml-4">Edges: </span>
          <span className="text-primary">{edges.length}</span>
        </div>
      </div>
    </div>
  );
};

export default GraphEditor;
