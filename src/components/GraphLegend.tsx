const GraphLegend = () => {
  const items = [
    { color: 'bg-node-default', label: 'Unvisited', glow: false },
    { color: 'bg-success', label: 'Current', glow: true },
    { color: 'bg-accent', label: 'Visited', glow: true },
    { color: 'bg-destructive', label: 'Articulation Point', glow: true },
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-4 animate-fade-in">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Legend</h3>
      <div className="space-y-2">
        {items.map(({ color, label, glow }) => (
          <div key={label} className="flex items-center gap-3">
            <div 
              className={`w-4 h-4 rounded-full ${color} ${glow ? 'glow-primary' : ''}`}
              style={glow ? { boxShadow: `0 0 10px currentColor` } : {}}
            />
            <span className="text-sm text-foreground">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GraphLegend;
