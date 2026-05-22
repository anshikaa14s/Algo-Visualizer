import { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronRight, 
  Network, 
  Trash2, 
  RefreshCw, 
  Cpu, 
  Database,
  HelpCircle
} from 'lucide-react';

export function GraphAlgorithms() {
  const { soundEnabled } = useApp();
  const audioCtxRef = useRef(null);

  // Graph state: node = { id, x, y, status } (status: normal, active, visited, queue, path)
  // edge = { from, to, isPath }
  const [nodes, setNodes] = useState([
    { id: 0, x: 150, y: 150, status: 'normal' },
    { id: 1, x: 300, y: 100, status: 'normal' },
    { id: 2, x: 300, y: 250, status: 'normal' },
    { id: 3, x: 450, y: 150, status: 'normal' },
    { id: 4, x: 450, y: 280, status: 'normal' },
    { id: 5, x: 600, y: 200, status: 'normal' }
  ]);

  const [edges, setEdges] = useState([
    { from: 0, to: 1, isPath: false },
    { from: 0, to: 2, isPath: false },
    { from: 1, to: 3, isPath: false },
    { from: 2, to: 3, isPath: false },
    { from: 2, to: 4, isPath: false },
    { from: 3, to: 5, isPath: false },
    { from: 4, to: 5, isPath: false }
  ]);

  const [selectedNode, setSelectedNode] = useState(null);
  const [startNode, setStartNode] = useState(0);
  const [targetNode, setTargetNode] = useState(5);
  const [algo, setAlgo] = useState('dijkstra'); // bfs, dfs, dijkstra
  const [speed, setSpeed] = useState(600); // ms per step
  const [isPlaying, setIsPlaying] = useState(false);

  // Execution states
  const [visited, setVisited] = useState(new Set());
  const [fringe, setFringe] = useState([]); // Queue (BFS) / Stack (DFS) / Heap (Dijkstra)
  const [parents, setParents] = useState({});
  const [distances, setDistances] = useState({});
  const [stepLog, setStepLog] = useState(["Double click canvas to add nodes. Click one then another to form links."]);
  const [codeLine, setCodeLine] = useState(0);
  const [comparisons, setComparisons] = useState(0);

  // Interaction refs
  const svgRef = useRef(null);
  const draggedNodeRef = useRef(null);
  const timerRef = useRef(null);

  // Audio tone synth generator
  const playTone = useCallback((nodeId) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      // Map node ID to frequency
      const freq = 261.63 + (nodeId * 40); // Standard pitch step
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      console.warn(e);
    }
  }, [soundEnabled]);

  // Generate Presets
  const generatePreset = (type) => {
    resetVisuals();
    if (type === 'ring') {
      const ringNodes = [];
      const ringEdges = [];
      const numNodes = 6;
      const radius = 120;
      const cx = 350;
      const cy = 200;

      for (let i = 0; i < numNodes; i++) {
        const angle = (2 * Math.PI * i) / numNodes;
        ringNodes.push({
          id: i,
          x: cx + radius * Math.cos(angle),
          y: cy + radius * Math.sin(angle),
          status: 'normal'
        });
        ringEdges.push({
          from: i,
          to: (i + 1) % numNodes,
          isPath: false
        });
      }
      setNodes(ringNodes);
      setEdges(ringEdges);
      setStartNode(0);
      setTargetNode(3);
    } else if (type === 'grid') {
      const gridNodes = [];
      const gridEdges = [];
      // 2x3 Grid
      let id = 0;
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 3; c++) {
          gridNodes.push({
            id,
            x: 180 + c * 180,
            y: 120 + r * 160,
            status: 'normal'
          });
          id++;
        }
      }
      gridEdges.push(
        { from: 0, to: 1, isPath: false },
        { from: 1, to: 2, isPath: false },
        { from: 3, to: 4, isPath: false },
        { from: 4, to: 5, isPath: false },
        { from: 0, to: 3, isPath: false },
        { from: 1, to: 4, isPath: false },
        { from: 2, to: 5, isPath: false }
      );
      setNodes(gridNodes);
      setEdges(gridEdges);
      setStartNode(0);
      setTargetNode(5);
    } else {
      // Star Graph
      const starNodes = [
        { id: 0, x: 350, y: 200, status: 'normal' } // Hub
      ];
      const starEdges = [];
      for (let i = 1; i <= 5; i++) {
        const angle = (2 * Math.PI * (i - 1)) / 5;
        starNodes.push({
          id: i,
          x: 350 + 130 * Math.cos(angle),
          y: 200 + 130 * Math.sin(angle),
          status: 'normal'
        });
        starEdges.push({ from: 0, to: i, isPath: false });
      }
      setNodes(starNodes);
      setEdges(starEdges);
      setStartNode(1);
      setTargetNode(4);
    }
  };

  // Node double click -> Remove Node
  const handleNodeDoubleClick = (nodeId) => {
    resetVisuals();
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    setEdges(prev => prev.filter(e => e.from !== nodeId && e.to !== nodeId));
  };

  // Canvas double click -> Add Node
  const handleCanvasDoubleClick = (e) => {
    if (e.target !== svgRef.current) return;
    resetVisuals();
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setNodes(prev => {
      const nextId = prev.length > 0 ? Math.max(...prev.map(n => n.id)) + 1 : 0;
      return [...prev, { id: nextId, x, y, status: 'normal' }];
    });
  };

  // Node Drag Handlers
  const handleNodeMouseDown = (e, node) => {
    e.stopPropagation();
    draggedNodeRef.current = node;
  };

  const handleMouseMove = (e) => {
    if (!draggedNodeRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = Math.max(20, Math.min(rect.width - 20, e.clientX - rect.left));
    const y = Math.max(20, Math.min(rect.height - 20, e.clientY - rect.top));

    setNodes(prev => prev.map(n => 
      n.id === draggedNodeRef.current.id ? { ...n, x, y } : n
    ));
  };

  const handleMouseUp = () => {
    draggedNodeRef.current = null;
  };

  // Node click -> Select Node / Create Edge
  const handleNodeClick = (e, nodeId) => {
    e.stopPropagation();
    resetVisuals();
    if (selectedNode === null) {
      setSelectedNode(nodeId);
    } else {
      if (selectedNode !== nodeId) {
        // Toggle edge existence
        const edgeExists = edges.some(edge => 
          (edge.from === selectedNode && edge.to === nodeId) ||
          (edge.from === nodeId && edge.to === selectedNode)
        );

        if (edgeExists) {
          setEdges(prev => prev.filter(edge => 
            !(edge.from === selectedNode && edge.to === nodeId) &&
            !(edge.from === nodeId && edge.to === selectedNode)
          ));
        } else {
          setEdges(prev => [...prev, { from: selectedNode, to: nodeId, isPath: false }]);
        }
      }
      setSelectedNode(null);
    }
  };

  // Reset visuals and solver structures
  const resetVisuals = () => {
    setIsPlaying(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setNodes(prev => prev.map(n => ({ ...n, status: 'normal' })));
    setEdges(prev => prev.map(e => ({ ...e, isPath: false })));
    setVisited(new Set());
    setFringe([]);
    setParents({});
    setDistances({});
    setStepLog(["Workspace state reset. Ready to initialize solver."]);
    setCodeLine(0);
    setComparisons(0);
  };

  // BFS / DFS / Dijkstra execution logic
  // BFS algorithm generator
  function* bfsGenerator() {
    let q = [startNode];
    let visitedSet = new Set([startNode]);
    let parentMap = {};
    
    setVisited(new Set([startNode]));
    setFringe([...q]);
    
    yield { line: 2, desc: `Initialize Queue with starting Node ${startNode}.`, nodeUpdates: { [startNode]: 'queue' } };

    while (q.length > 0) {
      let curr = q.shift();
      setFringe([...q]);
      playTone(curr);
      
      yield { 
        line: 4, 
        desc: `Dequeue Node ${curr} from Queue and inspect neighbors.`, 
        nodeUpdates: { [curr]: 'active' } 
      };

      if (curr === targetNode) {
        // Build path
        let pathNodes = [];
        let temp = targetNode;
        while (temp !== undefined) {
          pathNodes.unshift(temp);
          temp = parentMap[temp];
        }
        
        // Highlight edges
        const pathEdges = [];
        for (let i = 0; i < pathNodes.length - 1; i++) {
          pathEdges.push({ from: pathNodes[i], to: pathNodes[i+1] });
        }

        yield {
          line: 6,
          desc: `Shortest Path Found! Tracing links from ${startNode} to ${targetNode}.`,
          nodeUpdates: pathNodes.reduce((acc, nid) => ({ ...acc, [nid]: 'path' }), {}),
          pathEdges
        };
        return;
      }

      // Find neighbors
      const neighbors = edges
        .filter(e => e.from === curr || e.to === curr)
        .map(e => e.from === curr ? e.to : e.from)
        .filter(n => !visitedSet.has(n));

      for (let n of neighbors) {
        setComparisons(c => c + 1);
        visitedSet.add(n);
        parentMap[n] = curr;
        q.push(n);
        
        setVisited(new Set(visitedSet));
        setFringe([...q]);
        setParents({ ...parentMap });

        yield {
          line: 9,
          desc: `Discovered neighbor Node ${n}. Add to Queue & set parent to ${curr}.`,
          nodeUpdates: { [n]: 'queue', [curr]: 'visited' }
        };
      }
      
      yield {
        line: 12,
        desc: `Processed all neighbors of Node ${curr}. Mark Node ${curr} as Visited.`,
        nodeUpdates: { [curr]: 'visited' }
      };
    }

    yield { line: 14, desc: `Queue exhausted. No path found between ${startNode} and ${targetNode}.`, nodeUpdates: {} };
  }

  // DFS algorithm generator
  function* dfsGenerator() {
    let stack = [startNode];
    let visitedSet = new Set();
    let parentMap = {};
    
    setFringe([...stack]);
    
    yield { line: 2, desc: `Push starting Node ${startNode} onto stack.`, nodeUpdates: { [startNode]: 'queue' } };

    while (stack.length > 0) {
      let curr = stack.pop();
      setFringe([...stack]);
      
      if (visitedSet.has(curr)) continue;
      
      visitedSet.add(curr);
      setVisited(new Set(visitedSet));
      playTone(curr);

      yield { 
        line: 4, 
        desc: `Pop Node ${curr} from Stack. Mark as Visited and check links.`, 
        nodeUpdates: { [curr]: 'active' } 
      };

      if (curr === targetNode) {
        let pathNodes = [];
        let temp = targetNode;
        while (temp !== undefined) {
          pathNodes.unshift(temp);
          temp = parentMap[temp];
        }
        
        const pathEdges = [];
        for (let i = 0; i < pathNodes.length - 1; i++) {
          pathEdges.push({ from: pathNodes[i], to: pathNodes[i+1] });
        }

        yield {
          line: 6,
          desc: `DFS Path reached target Node ${targetNode}! Tracing final route.`,
          nodeUpdates: pathNodes.reduce((acc, nid) => ({ ...acc, [nid]: 'path' }), {}),
          pathEdges
        };
        return;
      }

      // Find neighbors
      const neighbors = edges
        .filter(e => e.from === curr || e.to === curr)
        .map(e => e.from === curr ? e.to : e.from)
        .filter(n => !visitedSet.has(n));

      for (let n of neighbors) {
        setComparisons(c => c + 1);
        if (!stack.includes(n)) {
          parentMap[n] = curr;
          stack.push(n);
          
          setFringe([...stack]);
          setParents({ ...parentMap });

          yield {
            line: 9,
            desc: `Link Node ${n} discovered. Push to Stack and link parent: ${curr}.`,
            nodeUpdates: { [n]: 'queue', [curr]: 'visited' }
          };
        }
      }

      yield {
        line: 12,
        desc: `Mark Node ${curr} visited. Stack state: [${stack.join(', ')}].`,
        nodeUpdates: { [curr]: 'visited' }
      };
    }

    yield { line: 14, desc: `Stack empty. Target Node unreachable from ${startNode}.`, nodeUpdates: {} };
  }

  // Dijkstra's algorithm generator
  function* dijkstraGenerator() {
    let pq = [{ node: startNode, dist: 0 }];
    let distMap = { [startNode]: 0 };
    let parentMap = {};
    let visitedSet = new Set();

    setDistances({ ...distMap });
    setFringe(pq.map(item => `${item.node}(d=${item.dist})`));

    yield { line: 2, desc: `Initialize starting distance map. Set distance to Node ${startNode} to 0.`, nodeUpdates: { [startNode]: 'queue' } };

    while (pq.length > 0) {
      // Sort to simulate Min-Priority Queue
      pq.sort((x, y) => x.dist - y.dist);
      let currItem = pq.shift();
      let curr = currItem.node;
      
      setFringe(pq.map(item => `${item.node}(d=${item.dist})`));

      if (visitedSet.has(curr)) continue;
      
      visitedSet.add(curr);
      setVisited(new Set(visitedSet));
      playTone(curr);

      yield {
        line: 5,
        desc: `Extract Node ${curr} with minimum distance (${currItem.dist}) from Heap.`,
        nodeUpdates: { [curr]: 'active' }
      };

      if (curr === targetNode) {
        let pathNodes = [];
        let temp = targetNode;
        while (temp !== undefined) {
          pathNodes.unshift(temp);
          temp = parentMap[temp];
        }
        
        const pathEdges = [];
        for (let i = 0; i < pathNodes.length - 1; i++) {
          pathEdges.push({ from: pathNodes[i], to: pathNodes[i+1] });
        }

        yield {
          line: 7,
          desc: `Target reached! Dijkstra confirmed shortest path weight is ${distMap[targetNode]}!`,
          nodeUpdates: pathNodes.reduce((acc, nid) => ({ ...acc, [nid]: 'path' }), {}),
          pathEdges
        };
        return;
      }

      // Process neighbors
      const neighbors = edges
        .filter(e => e.from === curr || e.to === curr)
        .map(e => e.from === curr ? e.to : e.from)
        .filter(n => !visitedSet.has(n));

      for (let n of neighbors) {
        setComparisons(c => c + 1);
        // Assume edge weight = 1 for simple canvas visualization
        let newDist = distMap[curr] + 1;
        
        if (distMap[n] === undefined || newDist < distMap[n]) {
          distMap[n] = newDist;
          parentMap[n] = curr;
          pq.push({ node: n, dist: newDist });

          setDistances({ ...distMap });
          setParents({ ...parentMap });
          setFringe(pq.map(item => `${item.node}(d=${item.dist})`));

          yield {
            line: 10,
            desc: `Relax edge ${curr} ➜ ${n}. Distance decreases to ${newDist}.`,
            nodeUpdates: { [n]: 'queue', [curr]: 'visited' }
          };
        }
      }

      yield {
        line: 13,
        desc: `Completed exploration of Node ${curr}. Distances: [${Object.entries(distMap).map(([k, v]) => `${k}:${v}`).join(', ')}].`,
        nodeUpdates: { [curr]: 'visited' }
      };
    }

    yield { line: 15, desc: `Min-Heap empty. Dijkstra reports target ${targetNode} is unreachable.`, nodeUpdates: {} };
  }

  // Handle visualizer runner loop
  const startSolving = () => {
    resetVisuals();
    setIsPlaying(true);

    const solver = algo === 'bfs' 
      ? bfsGenerator() 
      : algo === 'dfs' 
      ? dfsGenerator() 
      : dijkstraGenerator();

    timerRef.current = setInterval(() => {
      const step = solver.next();
      
      if (step.done) {
        setIsPlaying(false);
        clearInterval(timerRef.current);
        timerRef.current = null;
        return;
      }

      const { line, desc, nodeUpdates, pathEdges } = step.value;
      
      // Update nodes visual state
      setNodes(prev => prev.map(n => {
        if (nodeUpdates[n.id]) {
          return { ...n, status: nodeUpdates[n.id] };
        }
        return n;
      }));

      // Update edges path state
      if (pathEdges) {
        setEdges(prev => prev.map(e => {
          const partOfPath = pathEdges.some(pe => 
            (pe.from === e.from && pe.to === e.to) ||
            (pe.from === e.to && pe.to === e.from)
          );
          return { ...e, isPath: partOfPath };
        }));
      }

      // Add to logger
      setStepLog(prev => [...prev, desc]);
      setCodeLine(line);

    }, speed);
  };

  // Clear Interval on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Preset Codes definitions
  const codeSnippets = {
    bfs: [
      "function BFS(graph, start) {",
      "  let q = [start];",
      "  let visited = new Set([start]);",
      "  while (q.length > 0) {",
      "    let curr = q.shift();",
      "    if (curr === target) return path;",
      "    for (let neighbor of graph[curr]) {",
      "      if (!visited.has(neighbor)) {",
      "        visited.add(neighbor);",
      "        q.push(neighbor);",
      "      }",
      "    }",
      "  }",
      "}"
    ],
    dfs: [
      "function DFS(graph, start) {",
      "  let stack = [start];",
      "  let visited = new Set();",
      "  while (stack.length > 0) {",
      "    let curr = stack.pop();",
      "    if (!visited.has(curr)) {",
      "      visited.add(curr);",
      "      if (curr === target) return path;",
      "      for (let neighbor of graph[curr]) {",
      "        stack.push(neighbor);",
      "      }",
      "    }",
      "  }",
      "}"
    ],
    dijkstra: [
      "function Dijkstra(graph, start) {",
      "  let pq = new MinPriorityQueue();",
      "  pq.insert(start, 0);",
      "  while (!pq.isEmpty()) {",
      "    let { node, dist } = pq.extractMin();",
      "    if (node === target) return path;",
      "    for (let neighbor of graph[node]) {",
      "      let newDist = dist + weight(node, neighbor);",
      "      if (newDist < distances[neighbor]) {",
      "        distances[neighbor] = newDist;",
      "        pq.insert(neighbor, newDist);",
      "      }",
      "    }",
      "  }",
      "}"
    ]
  };

  const complexities = {
    bfs: { time: "O(V + E)", space: "O(V)" },
    dfs: { time: "O(V + E)", space: "O(V)" },
    dijkstra: { time: "O((V + E) log V)", space: "O(V)" }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative z-10">
      
      {/* LEFT: SVG Graph Canvas Editor */}
      <div className="flex-1 flex flex-col p-6 border-b lg:border-b-0 lg:border-r border-white/5 bg-black/10 overflow-hidden relative">
        {/* Controls Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 bg-white/5 border border-white/5 rounded-2xl p-4 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white leading-none">Graph Architecture Workspace</h2>
              <span className="text-[10px] font-mono text-text-muted">Interactive Node-Link Canvas</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => generatePreset('ring')}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-white/5"
            >
              <RefreshCw className="w-3 h-3 text-brand-primary" />
              Ring
            </button>
            <button
              onClick={() => generatePreset('grid')}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-white/5"
            >
              <RefreshCw className="w-3 h-3 text-brand-secondary" />
              Grid
            </button>
            <button
              onClick={() => generatePreset('star')}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-white/5"
            >
              <RefreshCw className="w-3 h-3 text-yellow-400" />
              Star
            </button>
            <button
              onClick={resetVisuals}
              className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
              title="Clear Canvas Visuals"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic canvas instruction overlay */}
        <div className="absolute top-26 left-10 flex items-center gap-2 bg-black/60 px-3 py-2 rounded-xl border border-white/5 text-[10px] text-text-muted font-mono z-10 pointer-events-none">
          <HelpCircle className="w-3.5 h-3.5 text-brand-primary animate-pulse" />
          <span>Double-click to create nodes. Click two nodes to add/remove a link. Drag to position.</span>
        </div>

        {/* SVG Node Workspace */}
        <div className="flex-1 rounded-3xl bg-black/30 border border-white/5 overflow-hidden relative shadow-inner">
          <svg
            ref={svgRef}
            onDoubleClick={handleCanvasDoubleClick}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className="w-full h-full cursor-crosshair select-none"
          >
            {/* Glow filters defs */}
            <defs>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Links/Edges */}
            {edges.map((edge, idx) => {
              const fromNode = nodes.find(n => n.id === edge.from);
              const toNode = nodes.find(n => n.id === edge.to);
              if (!fromNode || !toNode) return null;

              return (
                <line
                  key={idx}
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke={edge.isPath ? '#d946ef' : '#334155'}
                  strokeWidth={edge.isPath ? 4 : 2}
                  className="transition-all duration-300"
                  filter={edge.isPath ? 'url(#glow)' : ''}
                />
              );
            })}

            {/* Node elements */}
            {nodes.map((node) => {
              let circleColor = 'fill-[#0f172a] stroke-slate-600';
              let ringGlow = false;

              if (node.id === selectedNode) {
                circleColor = 'fill-black stroke-[#f59e0b]'; // gold active selection
                ringGlow = true;
              } else if (node.status === 'active') {
                circleColor = 'fill-black stroke-[#f59e0b]'; // active pivot
                ringGlow = true;
              } else if (node.status === 'path') {
                circleColor = 'fill-black stroke-[#d946ef]'; // final shortest path
                ringGlow = true;
              } else if (node.status === 'queue') {
                circleColor = 'fill-black stroke-[#a855f7]'; // queue/stack waitlist
                ringGlow = true;
              } else if (node.status === 'visited') {
                circleColor = 'fill-black stroke-[#10b981]'; // visited
              }

              return (
                <g
                  key={node.id}
                  className="cursor-pointer group"
                  onMouseDown={(e) => handleNodeMouseDown(e, node)}
                  onClick={(e) => handleNodeClick(e, node.id)}
                  onDoubleClick={(e) => { e.stopPropagation(); handleNodeDoubleClick(node.id); }}
                >
                  {/* Glowing halo indicator */}
                  {ringGlow && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={24}
                      fill="none"
                      stroke={node.status === 'path' ? '#d946ef' : node.status === 'queue' ? '#a855f7' : '#f59e0b'}
                      strokeWidth={1.5}
                      className="animate-ping opacity-25"
                    />
                  )}

                  {/* Standard body node */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={18}
                    className={`transition-all duration-300 ${circleColor} stroke-[2.5] group-hover:scale-110`}
                    filter={ringGlow ? 'url(#glow)' : ''}
                  />

                  {/* Node indices labels */}
                  <text
                    x={node.x}
                    y={node.y + 4}
                    textAnchor="middle"
                    fill="white"
                    className="text-xs font-mono font-bold select-none pointer-events-none"
                  >
                    {node.id}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* RIGHT: Solver Controls & Complexities Panels */}
      <div className="w-full lg:w-[480px] p-6 flex flex-col gap-6 overflow-y-auto max-h-full no-scrollbar">
        {/* Playback controls */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-mono font-bold text-text-muted uppercase">Select Algorithm Strategy</span>
            <div className="grid grid-cols-3 gap-2">
              {['dijkstra', 'bfs', 'dfs'].map((type) => (
                <button
                  key={type}
                  onClick={() => { setAlgo(type); resetVisuals(); }}
                  className={`py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                    algo === type
                      ? 'bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 border-brand-primary text-brand-primary shadow-inner shadow-brand-primary/5'
                      : 'border-white/5 bg-white/5 text-text-muted hover:text-white'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-text-muted uppercase">Start Node ID</span>
              <select
                value={startNode}
                onChange={(e) => { setStartNode(parseInt(e.target.value)); resetVisuals(); }}
                className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-brand-primary/50"
              >
                {nodes.map(n => (
                  <option key={n.id} value={n.id}>Node {n.id}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-text-muted uppercase">Target Node ID</span>
              <select
                value={targetNode}
                onChange={(e) => { setTargetNode(parseInt(e.target.value)); resetVisuals(); }}
                className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-brand-primary/50"
              >
                {nodes.map(n => (
                  <option key={n.id} value={n.id}>Node {n.id}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Trigger keys */}
          <div className="flex items-center gap-3 pt-2">
            {!isPlaying ? (
              <button
                onClick={startSolving}
                disabled={nodes.length < 2}
                className="flex-1 glow-btn py-3 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-black text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-brand-glow disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-black" />
                Initialize Solve
              </button>
            ) : (
              <button
                onClick={resetVisuals}
                className="flex-1 py-3 rounded-xl border border-white/10 hover:border-brand-primary/40 text-white text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-all cursor-pointer bg-white/5"
              >
                <Pause className="w-3.5 h-3.5 text-brand-primary" />
                Halt Solver
              </button>
            )}

            <div className="flex items-center gap-2 border border-white/5 bg-black/30 rounded-xl px-3 py-2">
              <span className="text-[10px] font-mono font-semibold text-text-muted">Speed:</span>
              <input
                type="range"
                min="150"
                max="1500"
                step="50"
                value={speed}
                onChange={(e) => setSpeed(parseInt(e.target.value))}
                className="w-20 accent-brand-primary h-1 rounded-lg bg-slate-700 appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Complexity Matrix details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-panel p-4 rounded-xl border border-white/5 text-center">
            <div className="flex items-center justify-center gap-2 text-text-muted text-[10px] font-mono font-bold uppercase mb-1">
              <Cpu className="w-3.5 h-3.5 text-brand-primary" />
              Time Complexity
            </div>
            <span className="text-xl font-bold tracking-tight text-white font-mono">
              {complexities[algo].time}
            </span>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-white/5 text-center">
            <div className="flex items-center justify-center gap-2 text-text-muted text-[10px] font-mono font-bold uppercase mb-1">
              <Database className="w-3.5 h-3.5 text-brand-secondary" />
              Space Complexity
            </div>
            <span className="text-xl font-bold tracking-tight text-white font-mono">
              {complexities[algo].space}
            </span>
          </div>
        </div>

        {/* Trace Stack Debug list */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 flex-1 flex flex-col min-h-[220px]">
          <span className="text-[10px] font-mono font-bold text-text-muted uppercase mb-3 block">Real-Time Traversal Trace</span>
          <div className="flex-1 bg-black/40 border border-white/5 rounded-xl p-4 overflow-y-auto font-mono text-[11px] leading-relaxed space-y-2 no-scrollbar">
            {stepLog.map((log, idx) => (
              <div key={idx} className="flex items-start gap-2 text-text-muted">
                <ChevronRight className="w-3.5 h-3.5 text-brand-primary flex-shrink-0 mt-0.5" />
                <span className={idx === stepLog.length - 1 ? "text-white font-bold" : ""}>
                  {log}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between text-[10px] text-text-muted font-mono border-t border-white/5 pt-3">
            <span>Fringe State: [{fringe.join(', ')}]</span>
            <span>Relax checks: {comparisons}</span>
          </div>
        </div>

        {/* Standard algorithm implementation code display */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5">
          <span className="text-[10px] font-mono font-bold text-text-muted uppercase mb-3 block">Structured Implementation Code</span>
          <div className="bg-black/40 border border-white/5 rounded-xl p-4 font-mono text-[10px] leading-relaxed overflow-hidden">
            {codeSnippets[algo].map((line, idx) => (
              <div
                key={idx}
                className={`py-0.5 px-2 rounded transition-all duration-200 ${
                  codeLine === idx + 1
                    ? 'bg-brand-primary/20 text-white font-bold border-l-2 border-brand-primary'
                    : 'text-text-muted'
                }`}
              >
                {line}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
