import { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  RotateCcw, 
  Trash2, 
  Grid, 
  Cpu, 
  MapPin, 
  Compass, 
  Sparkles,
  ChevronRight,
  Database
} from 'lucide-react';
import { dijkstra, bfs, dfs, generateRecursiveDivisionMaze } from '../algorithms/pathfinding';
import { useAudioSynth } from '../hooks/useAudioSynth';

export function PathfindingPage() {
  const ROWS = 18;
  const COLS = 32;

  // Start & Target node coordinates in state
  const [startCoords, setStartCoords] = useState({ row: 8, col: 6 });
  const [endCoords, setEndCoords] = useState({ row: 8, col: 25 });

  const [grid, setGrid] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [algorithm, setAlgorithm] = useState('dijkstra'); // dijkstra, bfs, dfs
  const [infoDesc, setInfoDesc] = useState("Draw walls by dragging, relocate start/end pins, and click 'Solve Grid'!");
  const [speed, setSpeed] = useState(40); // delay in ms per search step
  const [codeLine, setCodeLine] = useState(0);

  // Mouse drag states
  const [isDrawingWall, setIsDrawingWall] = useState(false);
  const [isDraggingStart, setIsDraggingStart] = useState(false);
  const [isDraggingEnd, setIsDraggingEnd] = useState(false);

  const { soundEnabled, playTone } = useAudioSynth();
  const timeoutsRef = useRef([]);
  const gridStatesRef = useRef({}); // Tracks visual states: visited, path, wall, ''

  const speedRef = useRef(speed);
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

  const codeSnippets = {
    dijkstra: [
      "function Dijkstra(grid, start, end) {",
      "  let q = getAllNodes(grid);",
      "  while (q.length > 0) {",
      "    let curr = extractClosestNode(q);",
      "    if (curr === end) return buildPath(end);",
      "    if (curr.distance === Infinity) break;",
      "    curr.isVisited = true;",
      "    updateUnvisitedNeighbors(curr, grid);",
      "  }",
      "}"
    ],
    bfs: [
      "function BFS(grid, start, end) {",
      "  let q = [start];",
      "  while (q.length > 0) {",
      "    let curr = q.shift();",
      "    if (curr === end) return buildPath(end);",
      "    curr.isVisited = true;",
      "    for (let neighbor of neighbors) {",
      "      neighbor.previous = curr;",
      "      q.push(neighbor);",
      "      neighbor.isVisited = true;",
      "    }",
      "  }",
      "}"
    ],
    dfs: [
      "function DFS(grid, start, end) {",
      "  let stack = [start];",
      "  while (stack.length > 0) {",
      "    let curr = stack.pop();",
      "    if (curr === end) return buildPath(end);",
      "    if (!curr.isVisited) {",
      "      curr.isVisited = true;",
      "      for (let neighbor of neighbors) {",
      "        neighbor.previous = curr;",
      "        stack.push(neighbor);",
      "      }",
      "    }",
      "  }",
      "}"
    ]
  };

  const complexities = {
    dijkstra: { time: "O(V log V + E)", space: "O(V)" },
    bfs: { time: "O(V + E)", space: "O(V)" },
    dfs: { time: "O(V + E)", space: "O(V)" }
  };

  // Initialize standard grid
  const initializeGrid = (clearAll = true) => {
    clearAllTimeouts();
    setCodeLine(0);
    if (clearAll) {
      gridStatesRef.current = {};
    } else {
      const newStates = {};
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const key = `${r}-${c}`;
          if (gridStatesRef.current[key] === 'wall') {
            newStates[key] = 'wall';
          }
        }
      }
      gridStatesRef.current = newStates;
    }
    const newGrid = [];
    for (let r = 0; r < ROWS; r++) {
      const currentRow = [];
      for (let c = 0; c < COLS; c++) {
        // Keep walls if we are only clearing path
        let isWall = false;
        if (!clearAll && grid[r] && grid[r][c]) {
          isWall = grid[r][c].isWall;
        }

        currentRow.push({
          row: r,
          col: c,
          isStart: r === startCoords.row && c === startCoords.col,
          isEnd: r === endCoords.row && c === endCoords.col,
          isWall: isWall,
          isVisited: false,
          distance: Infinity,
          previousNode: null
        });

        // Reset DOM classes manually to cut off slow react re-renders during speed solves
        const element = document.getElementById(`node-${r}-${c}`);
        if (element) {
          element.className = 'w-full aspect-square border border-white/5 rounded-xs transition-all duration-300 bg-black/20';
          if (r === startCoords.row && c === startCoords.col) {
            element.classList.add('bg-emerald-500', 'shadow-md', 'shadow-emerald-500/50');
          } else if (r === endCoords.row && c === endCoords.col) {
            element.classList.add('bg-rose-500', 'shadow-md', 'shadow-rose-500/50');
          } else if (isWall) {
            element.classList.add('bg-slate-700', 'border-slate-600', 'shadow-sm');
          }
        }
      }
      newGrid.push(currentRow);
    }
    setGrid(newGrid);
    setIsPlaying(false);
  };

  // Re-render when coordinates change
  useEffect(() => {
    initializeGrid(false);
  }, [startCoords, endCoords]);

  useEffect(() => {
    initializeGrid(true);
  }, []);

  // MOUSE EVENTS
  const handleMouseDown = (row, col) => {
    if (isPlaying) return;
    
    const node = grid[row][col];
    if (node.isStart) {
      setIsDraggingStart(true);
    } else if (node.isEnd) {
      setIsDraggingEnd(true);
    } else {
      setIsDrawingWall(true);
      toggleWall(row, col);
    }
  };

  const handleMouseEnter = (row, col) => {
    if (isPlaying) return;

    if (isDraggingStart) {
      // Don't place start over end coordinates
      if (row === endCoords.row && col === endCoords.col) return;
      setStartCoords({ row, col });
    } else if (isDraggingEnd) {
      if (row === startCoords.row && col === startCoords.col) return;
      setEndCoords({ row, col });
    } else if (isDrawingWall) {
      toggleWall(row, col);
    }
  };

  const handleMouseUp = () => {
    setIsDrawingWall(false);
    setIsDraggingStart(false);
    setIsDraggingEnd(false);
  };

  const toggleWall = (row, col) => {
    const node = grid[row][col];
    if (node.isStart || node.isEnd) return;

    const newGrid = [...grid];
    newGrid[row][col].isWall = !node.isWall;
    setGrid(newGrid);

    const key = `${row}-${col}`;
    if (newGrid[row][col].isWall) {
      gridStatesRef.current[key] = 'wall';
    } else {
      delete gridStatesRef.current[key];
    }

    // Apply styles instantly via DOM to prevent lagging
    const element = document.getElementById(`node-${row}-${col}`);
    if (element) {
      if (newGrid[row][col].isWall) {
        element.className = 'w-full aspect-square border border-slate-600 rounded-xs bg-slate-700 shadow-sm';
      } else {
        element.className = 'w-full aspect-square border border-white/5 rounded-xs bg-black/20';
      }
    }
  };

  // SOLVER ANIMATOR
  const visualizePathfinding = () => {
    if (isPlaying) return;
    setIsPlaying(true);
    setInfoDesc(`Running ${
      algorithm === 'dijkstra' 
        ? "Dijkstra's weighted solver..." 
        : algorithm === 'bfs' 
        ? "Breadth-First Search queue..." 
        : "Depth-First Search stack..."
    }`);

    // Create fresh grid state for solver (resets previous runs while preserving walls)
    const activeGrid = [];
    for (let r = 0; r < ROWS; r++) {
      const row = [];
      for (let c = 0; c < COLS; c++) {
        const node = grid[r][c];
        node.isVisited = false;
        node.distance = Infinity;
        node.previousNode = null;
        row.push(node);
        
        const key = `${r}-${c}`;
        if (gridStatesRef.current[key] === 'visited' || gridStatesRef.current[key] === 'path') {
          delete gridStatesRef.current[key];
        }

        // Remove animation styles from previous solvers
        const element = document.getElementById(`node-${r}-${c}`);
        if (element && !node.isStart && !node.isEnd && !node.isWall) {
          element.className = 'w-full aspect-square border border-white/5 rounded-xs bg-black/20';
        }
      }
      activeGrid.push(row);
    }

    const startNode = activeGrid[startCoords.row][startCoords.col];
    const endNode = activeGrid[endCoords.row][endCoords.col];

    let result;
    if (algorithm === 'dijkstra') {
      result = dijkstra(activeGrid, startNode, endNode);
    } else if (algorithm === 'bfs') {
      result = bfs(activeGrid, startNode, endNode);
    } else {
      result = dfs(activeGrid, startNode, endNode);
    }

    const { visitedNodesInOrder, shortestPath } = result;

    animateSearchRecursive(visitedNodesInOrder, shortestPath, 0);
  };

  const animateSearchRecursive = (visitedNodes, path, index = 0) => {
    if (index === visitedNodes.length) {
      animateShortestPathRecursive(path, 0);
      return;
    }

    const tId = setTimeout(() => {
      const node = visitedNodes[index];
      if (!node.isStart && !node.isEnd) {
        gridStatesRef.current[`${node.row}-${node.col}`] = 'visited';
        const element = document.getElementById(`node-${node.row}-${node.col}`);
        if (element) {
          element.classList.add('cell-animation-visited');
        }
      }
      
      // Dynamic code line debugger highlights simulation
      const lineOfCode = algorithm === 'dijkstra' 
        ? [3, 4, 5, 8][index % 4] 
        : algorithm === 'bfs'
        ? [4, 5, 6, 7][index % 4]
        : [3, 4, 5, 8][index % 4];
      setCodeLine(lineOfCode);

      // Play beeping tones periodically to prevent sound crash
      if (index % 4 === 0) {
        playTone(node.row * 10 + node.col, ROWS * 10 + COLS);
      }

      animateSearchRecursive(visitedNodes, path, index + 1);
    }, speedRef.current);
    timeoutsRef.current.push(tId);
  };

  const animateShortestPathRecursive = (path, index = 0) => {
    if (path.length === 0) {
      setInfoDesc("Solver finished! No path exists between start and end pins.");
      setIsPlaying(false);
      setCodeLine(0);
      return;
    }

    if (index === path.length) {
      setInfoDesc("Shortest path mapped successfully!");
      setIsPlaying(false);
      return;
    }

    const tId = setTimeout(() => {
      const node = path[index];
      if (!node.isStart && !node.isEnd) {
        gridStatesRef.current[`${node.row}-${node.col}`] = 'path';
        const element = document.getElementById(`node-${node.row}-${node.col}`);
        if (element) {
          element.classList.remove('cell-animation-visited');
          element.classList.add('cell-animation-path');
        }
      }
      setCodeLine(5); // Highlight buildPath / return path line
      playTone(node.row * 15 + node.col, ROWS * 15 + COLS);

      animateShortestPathRecursive(path, index + 1);
    }, speedRef.current * 2);
    timeoutsRef.current.push(tId);
  };

  // MAZE GENERATION
  const generateMaze = () => {
    if (isPlaying) return;
    
    // Clear everything first
    initializeGrid(true);
    
    const startNode = { row: startCoords.row, col: startCoords.col };
    const endNode = { row: endCoords.row, col: endCoords.col };

    const wallCoords = generateRecursiveDivisionMaze(ROWS, COLS, startNode, endNode);
    
    // Animate walls sliding in sequentially
    setIsPlaying(true);
    setInfoDesc("Generating Recursive Division Maze...");

    const tempGrid = [];
    for (let r = 0; r < ROWS; r++) {
      const row = [];
      for (let c = 0; c < COLS; c++) {
        row.push({
          row: r,
          col: c,
          isStart: r === startCoords.row && c === startCoords.col,
          isEnd: r === endCoords.row && c === endCoords.col,
          isWall: false,
          isVisited: false,
          distance: Infinity,
          previousNode: null
        });
      }
      tempGrid.push(row);
    }

    for (let i = 0; i < wallCoords.length; i++) {
      const tId = setTimeout(() => {
        const { row, col } = wallCoords[i];
        tempGrid[row][col].isWall = true;
        gridStatesRef.current[`${row}-${col}`] = 'wall';
        
        const element = document.getElementById(`node-${row}-${col}`);
        if (element) {
          element.className = 'w-full aspect-square border border-slate-600 rounded-xs bg-slate-700 shadow-sm';
        }

        if (i === wallCoords.length - 1) {
          setGrid(tempGrid);
          setIsPlaying(false);
          setInfoDesc("Recursive division maze complete! Relocate start/end pins or press Solve Grid.");
        }
      }, 4 * i);
      timeoutsRef.current.push(tId);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-8 py-8 relative z-10 grid-bg-overlay flex flex-col justify-between" onMouseUp={handleMouseUp}>
      <div>
        {/* Page Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
              <Grid className="w-8 h-8 text-brand-primary" />
              Pathfinding Visualizer
            </h1>
            <p className="text-text-muted text-xs font-mono mt-1">
              Draw wall partitions, drag start/end coordinates, and solve using search grids
            </p>
          </div>

          {/* Action panels */}
          <div className="flex flex-wrap items-center gap-4 bg-white/5 border border-white/5 px-4 py-3 rounded-2xl">
            {/* Algorithm Select */}
            <div className="flex flex-col">
              <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider font-semibold">Algorithm</span>
              <select
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value)}
                disabled={isPlaying}
                className="bg-transparent text-sm font-semibold text-white focus:outline-none border-none cursor-pointer mt-1"
              >
                <option value="dijkstra" className="bg-bg-secondary text-white">Dijkstra's Algorithm</option>
                <option value="bfs" className="bg-bg-secondary text-white">Breadth-First Search (BFS)</option>
                <option value="dfs" className="bg-bg-secondary text-white">Depth-First Search (DFS)</option>
              </select>
            </div>
            
            <div className="h-6 w-px bg-white/10" />

            {/* Speed Range Slider */}
            <div className="flex flex-col">
              <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider font-semibold">Solve Delay: {speed}ms</span>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="range"
                  min="5"
                  max="200"
                  step="5"
                  value={205 - speed}
                  onChange={(e) => setSpeed(205 - parseInt(e.target.value))}
                  className="w-24 accent-brand-primary h-1 rounded bg-slate-700 appearance-none cursor-pointer"
                />
              </div>
            </div>

            <div className="h-6 w-px bg-white/10" />

            <button
              onClick={generateMaze}
              disabled={isPlaying}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/5 hover:border-brand-secondary/30 rounded-xl text-xs font-semibold font-mono flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-secondary" />
              Maze Generator
            </button>
          </div>
        </div>

        {/* Visualizer Grid Panel */}
        <div className="glass-panel p-6 rounded-3xl border border-white/5 relative shadow-2xl bg-black/25 flex flex-col justify-center mb-8 overflow-x-auto select-none">
          <div className="flex gap-6 mb-4 text-xs font-mono text-text-muted px-2">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-emerald-500 border border-emerald-400" /> Start Node (Drag)
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-rose-500 border border-rose-400" /> Target Node (Drag)
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-slate-700 border border-slate-600" /> Wall Node (Draw)
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-cyan-500/20 border border-cyan-500/35" /> Visited Cell
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-amber-500 border border-amber-400 animate-pulse" /> Shortest Path
            </div>
          </div>

          {/* Core Grid Matrix */}
          <div className="grid gap-[2px] bg-white/5 border border-white/10 p-[2px] rounded-xl min-w-[700px]">
            {grid.map((row, rIdx) => (
              <div key={rIdx} className="flex gap-[2px]">
                {row.map((node, cIdx) => {
                  const key = `${rIdx}-${cIdx}`;
                  const state = gridStatesRef.current[key];
                  let extraClasses = 'bg-black/20';
                  if (node.isStart) {
                    extraClasses = 'bg-emerald-500 shadow-md shadow-emerald-500/50';
                  } else if (node.isEnd) {
                    extraClasses = 'bg-rose-500 shadow-md shadow-rose-500/50';
                  } else if (state === 'wall' || node.isWall) {
                    extraClasses = 'bg-slate-700 border-slate-600 shadow-sm';
                  } else if (state === 'path') {
                    extraClasses = 'cell-animation-path';
                  } else if (state === 'visited') {
                    extraClasses = 'cell-animation-visited';
                  }

                  return (
                    <div
                      key={`${rIdx}-${cIdx}`}
                      id={`node-${rIdx}-${cIdx}`}
                      onMouseDown={() => handleMouseDown(rIdx, cIdx)}
                      onMouseEnter={() => handleMouseEnter(rIdx, cIdx)}
                      className={`w-full aspect-square border border-white/5 rounded-xs transition-all duration-300 ${extraClasses}`}
                      title={`Coords: (${rIdx}, ${cIdx})`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Action Controls Footer */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-4 flex flex-col gap-4">
            <div className="flex gap-3">
              <button
                onClick={visualizePathfinding}
                disabled={isPlaying}
                className="glow-btn flex-1 px-6 py-3.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-black font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-brand-glow text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="w-4 h-4 text-black fill-black" />
                Solve Grid
              </button>

              <button
                onClick={() => initializeGrid(false)}
                disabled={isPlaying}
                className="px-4 py-3.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 text-white cursor-pointer transition-all disabled:opacity-50"
                title="Clear Path Only"
              >
                <RotateCcw className="w-5 h-5 text-brand-primary" />
              </button>

              <button
                onClick={() => initializeGrid(true)}
                disabled={isPlaying}
                className="px-4 py-3.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 text-white cursor-pointer transition-all disabled:opacity-50"
                title="Clear All (Grid + Walls)"
              >
                <Trash2 className="w-5 h-5 text-rose-500" />
              </button>
            </div>

            {/* Complexity Matrix details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-panel p-4 rounded-xl border border-white/5 text-center bg-black/15">
                <div className="flex items-center justify-center gap-1.5 text-text-muted text-[10px] font-mono font-bold uppercase mb-1">
                  <Cpu className="w-3.5 h-3.5 text-brand-primary" />
                  Time Complexity
                </div>
                <span className="text-[13px] font-bold tracking-tight text-white font-mono">
                  {complexities[algorithm].time}
                </span>
              </div>

              <div className="glass-panel p-4 rounded-xl border border-white/5 text-center bg-black/15">
                <div className="flex items-center justify-center gap-1.5 text-text-muted text-[10px] font-mono font-bold uppercase mb-1">
                  <Database className="w-3.5 h-3.5 text-brand-secondary" />
                  Space Complexity
                </div>
                <span className="text-[13px] font-bold tracking-tight text-white font-mono">
                  {complexities[algorithm].space}
                </span>
              </div>
            </div>

            {/* Quick manual hints */}
            <div className="glass-panel rounded-2xl p-5 border border-white/5 font-mono text-xs text-text-muted space-y-3 bg-black/15">
              <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold block">Grid Solving Rules</span>
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>Drag the GREEN pin to move start coordinate.</span>
              </div>
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <Compass className="w-4 h-4 text-rose-400" />
                <span>Drag the RED pin to move end target coordinate.</span>
              </div>
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>Click and drag on black tiles to construct walls.</span>
              </div>
            </div>
          </div>

          {/* AI explainer */}
          <div className="md:col-span-8 flex flex-col gap-6">
            <div className="glass-panel rounded-2xl p-6 border border-brand-primary/20 bg-gradient-to-tr from-brand-primary/5 to-transparent relative shadow-xl">
              <div className="absolute top-4 right-4 text-[10px] font-mono text-brand-primary border border-brand-primary/30 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                AI Explanation Panel
              </div>
              <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider font-semibold block mb-3">Live Solver Logger</span>
              <p className="text-white leading-relaxed text-sm font-sans pr-24">
                "{infoDesc}"
              </p>
            </div>

            {/* Structured Pseudocode Display */}
            <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-black/15">
              <span className="text-[10px] font-mono font-bold text-text-muted uppercase mb-3 block">Structured Implementation Code</span>
              <div className="bg-black/40 border border-white/5 rounded-xl p-4 font-mono text-[10px] leading-relaxed overflow-hidden">
                {codeSnippets[algorithm].map((line, idx) => (
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

            {/* Algorithm info boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="glass-panel rounded-2xl p-5 border border-white/5 bg-black/15 text-xs leading-relaxed font-sans text-text-muted space-y-1">
                <h4 className="font-bold text-white uppercase text-[10px] tracking-wide text-brand-primary">Dijkstra's Algorithm</h4>
                <p className="text-[11px]">
                  A weighted search algorithm prioritizing the shortest path from start. Treats wall cells as infinite weight.
                </p>
              </div>

              <div className="glass-panel rounded-2xl p-5 border border-white/5 bg-black/15 text-xs leading-relaxed font-sans text-text-muted space-y-1">
                <h4 className="font-bold text-white uppercase text-[10px] tracking-wide text-brand-secondary">Breadth-First Search</h4>
                <p className="text-[11px]">
                  An unweighted layer-by-layer queue search. Guarantees finding the shortest path on grid layouts.
                </p>
              </div>

              <div className="glass-panel rounded-2xl p-5 border border-white/5 bg-black/15 text-xs leading-relaxed font-sans text-text-muted space-y-1">
                <h4 className="font-bold text-white uppercase text-[10px] tracking-wide text-yellow-400">Depth-First Search</h4>
                <p className="text-[11px]">
                  An unweighted stack-based search exploring deeply along each branch. Does not guarantee the shortest path.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
