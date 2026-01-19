import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { AlgorithmType, Node } from '@/types/graph';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  GitBranch, 
  Workflow, 
  Target,
  MousePointer,
  Link2,
  Trash2,
  SkipForward
} from 'lucide-react';

interface ControlPanelProps {
  algorithm: AlgorithmType;
  isRunning: boolean;
  speed: number;
  edgeMode: boolean;
  selectedNode: string | null;
  nodes: Node[];
  onAlgorithmSelect: (algo: AlgorithmType) => void;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onStep: () => void;
  onSpeedChange: (speed: number) => void;
  onEdgeModeToggle: () => void;
  onClearGraph: () => void;
  message: string;
}

const ControlPanel = ({
  algorithm,
  isRunning,
  speed,
  edgeMode,
  selectedNode,
  nodes,
  onAlgorithmSelect,
  onStart,
  onPause,
  onReset,
  onStep,
  onSpeedChange,
  onEdgeModeToggle,
  onClearGraph,
  message
}: ControlPanelProps) => {
  const algorithms: { type: AlgorithmType; label: string; icon: React.ReactNode }[] = [
    { type: 'bfs', label: 'BFS', icon: <Workflow className="w-4 h-4" /> },
    { type: 'dfs', label: 'DFS', icon: <GitBranch className="w-4 h-4" /> },
    { type: 'articulation', label: 'Articulation', icon: <Target className="w-4 h-4" /> }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-6 animate-fade-in">
      {/* Mode Toggle */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Mode</h3>
        <div className="flex gap-2">
          <Button
            variant={!edgeMode ? "default" : "outline"}
            size="sm"
            onClick={() => edgeMode && onEdgeModeToggle()}
            className="flex-1"
          >
            <MousePointer className="w-4 h-4 mr-2" />
            Select
          </Button>
          <Button
            variant={edgeMode ? "default" : "outline"}
            size="sm"
            onClick={() => !edgeMode && onEdgeModeToggle()}
            className="flex-1"
          >
            <Link2 className="w-4 h-4 mr-2" />
            Connect
          </Button>
        </div>
      </div>

      {/* Algorithm Selection */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Algorithm</h3>
        <div className="grid grid-cols-1 gap-2">
          {algorithms.map(({ type, label, icon }) => (
            <Button
              key={type}
              variant={algorithm === type ? "default" : "outline"}
              size="sm"
              onClick={() => onAlgorithmSelect(type)}
              disabled={isRunning}
              className="justify-start"
            >
              {icon}
              <span className="ml-2">{label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Playback Controls */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Controls</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={isRunning ? onPause : onStart}
            disabled={algorithm === 'none' || nodes.length === 0}
            className="flex-1 h-10"
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={onStep}
            disabled={isRunning || algorithm === 'none' || nodes.length === 0}
            className="flex-1 h-10"
          >
            <SkipForward className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={onReset}
            className="flex-1 h-10"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Speed Control */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Speed</h3>
          <span className="text-sm font-mono text-primary">{speed}ms</span>
        </div>
        <Slider
          value={[speed]}
          onValueChange={([value]) => onSpeedChange(value)}
          min={100}
          max={2000}
          step={100}
          className="w-full"
        />
      </div>

      {/* Clear Graph */}
      <Button
        variant="destructive"
        size="sm"
        onClick={onClearGraph}
        disabled={isRunning}
        className="w-full"
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Clear Graph
      </Button>

      {/* Status Message */}
      {message && (
        <div className="p-3 bg-muted rounded-md border border-border">
          <p className="text-sm font-mono text-foreground">{message}</p>
        </div>
      )}

      {/* Instructions */}
      <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-border">
        <p>• Click canvas to add nodes</p>
        <p>• Drag nodes to reposition</p>
        <p>• Double-click node to delete</p>
        <p>• Use Connect mode to add edges</p>
        <p>• Select start node before running BFS/DFS</p>
      </div>
    </div>
  );
};

export default ControlPanel;
