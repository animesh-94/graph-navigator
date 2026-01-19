import { useCallback } from 'react';
import { Node, Edge, AlgorithmStep, NodeState } from '@/types/graph';

export const useGraphAlgorithms = () => {
  const buildAdjacencyList = useCallback((nodes: Node[], edges: Edge[]) => {
    const adj: Record<string, string[]> = {};
    nodes.forEach(node => {
      adj[node.id] = [];
    });
    edges.forEach(edge => {
      adj[edge.source].push(edge.target);
      adj[edge.target].push(edge.source);
    });
    return adj;
  }, []);

  const generateBFSSteps = useCallback((nodes: Node[], edges: Edge[], startNodeId: string): AlgorithmStep[] => {
    if (nodes.length === 0) return [];
    
    const adj = buildAdjacencyList(nodes, edges);
    const steps: AlgorithmStep[] = [];
    const visited = new Set<string>();
    const queue: string[] = [startNodeId];
    visited.add(startNodeId);

    const nodeStates: Record<string, NodeState> = {};
    nodes.forEach(n => nodeStates[n.id] = 'default');

    steps.push({
      nodeStates: { ...nodeStates },
      edgeStates: {},
      message: `Starting BFS from node ${nodes.find(n => n.id === startNodeId)?.label}`
    });

    while (queue.length > 0) {
      const current = queue.shift()!;
      nodeStates[current] = 'current';

      const activeEdges: Record<string, boolean> = {};
      edges.forEach(e => {
        if (e.source === current || e.target === current) {
          activeEdges[e.id] = true;
        }
      });

      steps.push({
        nodeStates: { ...nodeStates },
        edgeStates: activeEdges,
        currentNode: current,
        message: `Visiting node ${nodes.find(n => n.id === current)?.label}`
      });

      for (const neighbor of adj[current]) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
          nodeStates[neighbor] = 'visited';
        }
      }

      nodeStates[current] = 'visited';
    }

    steps.push({
      nodeStates: { ...nodeStates },
      edgeStates: {},
      message: 'BFS traversal complete!'
    });

    return steps;
  }, [buildAdjacencyList]);

  const generateDFSSteps = useCallback((nodes: Node[], edges: Edge[], startNodeId: string): AlgorithmStep[] => {
    if (nodes.length === 0) return [];
    
    const adj = buildAdjacencyList(nodes, edges);
    const steps: AlgorithmStep[] = [];
    const visited = new Set<string>();
    
    const nodeStates: Record<string, NodeState> = {};
    nodes.forEach(n => nodeStates[n.id] = 'default');

    steps.push({
      nodeStates: { ...nodeStates },
      edgeStates: {},
      message: `Starting DFS from node ${nodes.find(n => n.id === startNodeId)?.label}`
    });

    const dfs = (nodeId: string) => {
      visited.add(nodeId);
      nodeStates[nodeId] = 'current';

      const activeEdges: Record<string, boolean> = {};
      edges.forEach(e => {
        if (e.source === nodeId || e.target === nodeId) {
          activeEdges[e.id] = true;
        }
      });

      steps.push({
        nodeStates: { ...nodeStates },
        edgeStates: activeEdges,
        currentNode: nodeId,
        message: `Visiting node ${nodes.find(n => n.id === nodeId)?.label}`
      });

      for (const neighbor of adj[nodeId]) {
        if (!visited.has(neighbor)) {
          dfs(neighbor);
        }
      }

      nodeStates[nodeId] = 'visited';
      steps.push({
        nodeStates: { ...nodeStates },
        edgeStates: {},
        message: `Backtracking from node ${nodes.find(n => n.id === nodeId)?.label}`
      });
    };

    dfs(startNodeId);

    steps.push({
      nodeStates: { ...nodeStates },
      edgeStates: {},
      message: 'DFS traversal complete!'
    });

    return steps;
  }, [buildAdjacencyList]);

  const generateArticulationSteps = useCallback((nodes: Node[], edges: Edge[]): AlgorithmStep[] => {
    if (nodes.length === 0) return [];
    
    const adj = buildAdjacencyList(nodes, edges);
    const steps: AlgorithmStep[] = [];
    
    const nodeStates: Record<string, NodeState> = {};
    nodes.forEach(n => nodeStates[n.id] = 'default');

    const visited = new Set<string>();
    const disc: Record<string, number> = {};
    const low: Record<string, number> = {};
    const parent: Record<string, string | null> = {};
    const articulationPoints = new Set<string>();
    let time = 0;

    steps.push({
      nodeStates: { ...nodeStates },
      edgeStates: {},
      message: 'Starting articulation points detection...'
    });

    const dfs = (u: string) => {
      let children = 0;
      visited.add(u);
      disc[u] = low[u] = ++time;
      nodeStates[u] = 'current';

      steps.push({
        nodeStates: { ...nodeStates },
        edgeStates: {},
        currentNode: u,
        message: `Visiting ${nodes.find(n => n.id === u)?.label} (disc=${disc[u]}, low=${low[u]})`
      });

      for (const v of adj[u]) {
        if (!visited.has(v)) {
          children++;
          parent[v] = u;
          dfs(v);
          low[u] = Math.min(low[u], low[v]);

          if (parent[u] === null && children > 1) {
            articulationPoints.add(u);
          }
          if (parent[u] !== null && low[v] >= disc[u]) {
            articulationPoints.add(u);
          }
        } else if (v !== parent[u]) {
          low[u] = Math.min(low[u], disc[v]);
        }
      }

      nodeStates[u] = articulationPoints.has(u) ? 'articulation' : 'visited';
      steps.push({
        nodeStates: { ...nodeStates },
        edgeStates: {},
        message: articulationPoints.has(u) 
          ? `Node ${nodes.find(n => n.id === u)?.label} is an ARTICULATION POINT!`
          : `Completed ${nodes.find(n => n.id === u)?.label}`
      });
    };

    for (const node of nodes) {
      if (!visited.has(node.id)) {
        parent[node.id] = null;
        dfs(node.id);
      }
    }

    // Final step showing all articulation points
    nodes.forEach(n => {
      nodeStates[n.id] = articulationPoints.has(n.id) ? 'articulation' : 'visited';
    });

    steps.push({
      nodeStates: { ...nodeStates },
      edgeStates: {},
      message: articulationPoints.size > 0 
        ? `Found ${articulationPoints.size} articulation point(s): ${Array.from(articulationPoints).map(id => nodes.find(n => n.id === id)?.label).join(', ')}`
        : 'No articulation points found in this graph'
    });

    return steps;
  }, [buildAdjacencyList]);

  return {
    generateBFSSteps,
    generateDFSSteps,
    generateArticulationSteps
  };
};
