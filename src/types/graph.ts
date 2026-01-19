export interface Node {
  id: string;
  x: number;
  y: number;
  label: string;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
}

export type NodeState = 'default' | 'visited' | 'current' | 'articulation';

export type AlgorithmType = 'none' | 'bfs' | 'dfs' | 'articulation';

export interface AlgorithmStep {
  nodeStates: Record<string, NodeState>;
  edgeStates: Record<string, boolean>;
  currentNode?: string;
  message: string;
}

export interface GraphState {
  nodes: Node[];
  edges: Edge[];
  nodeStates: Record<string, NodeState>;
  activeEdges: Set<string>;
}
