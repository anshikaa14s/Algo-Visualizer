import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Search, 
  Database, 
  Grid, 
  Zap, 
  ArrowRight, 
  Code, 
  Cpu, 
  Play,
  Network
} from 'lucide-react';
import { SpotlightCard } from '../components/common/SpotlightCard';
import { ShinyText } from '../components/common/ShinyText';

export function Landing() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [activeTab, setActiveTab] = useState('sorting');

  // Interactive Live Algorithm Preview inside the Hero Section
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    let array = [];
    const size = 30;
    
    const resetArray = () => {
      array = [];
      for (let i = 0; i < size; i++) {
        array.push({
          value: Math.floor(Math.random() * 120) + 30,
          state: 'normal' // normal, active, sorted
        });
      }
    };

    resetArray();

    let i = 0;
    let j = 0;
    let isSorting = true;

    const getPrimaryColor = () => {
      const theme = document.documentElement.getAttribute('data-theme');
      if (theme === 'cyberpunk') return '#f5e050';
      if (theme === 'matrix') return '#00ff66';
      if (theme === 'ocean') return '#00d2ff';
      return '#00f2fe';
    };

    const getSecondaryColor = () => {
      const theme = document.documentElement.getAttribute('data-theme');
      if (theme === 'cyberpunk') return '#ff007f';
      if (theme === 'matrix') return '#39ff14';
      if (theme === 'ocean') return '#0072ff';
      return '#9d4edd';
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = canvas.width / size - 4;
      const primaryColor = getPrimaryColor();
      const secondaryColor = getSecondaryColor();

      for (let k = 0; k < array.length; k++) {
        const x = k * (barWidth + 4);
        const y = canvas.height - array[k].value;
        const height = array[k].value;

        // Custom rounded bars
        const radius = 3;
        ctx.beginPath();
        ctx.moveTo(x, canvas.height);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.lineTo(x + barWidth - radius, y);
        ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
        ctx.lineTo(x + barWidth, canvas.height);
        ctx.closePath();

        // Coloring states
        if (array[k].state === 'active') {
          ctx.fillStyle = '#f59e0b'; // Gold
        } else if (array[k].state === 'sorted') {
          ctx.fillStyle = secondaryColor;
        } else {
          ctx.fillStyle = `${primaryColor}aa`;
        }

        ctx.fill();
      }
    };

    const bubbleSortStep = () => {
      if (!isSorting) return;

      if (i < array.length - 1) {
        if (j < array.length - i - 1) {
          // Reset states
          array.forEach(x => { if (x.state !== 'sorted') x.state = 'normal'; });
          array[j].state = 'active';
          array[j + 1].state = 'active';

          if (array[j].value > array[j + 1].value) {
            const temp = array[j].value;
            array[j].value = array[j + 1].value;
            array[j + 1].value = temp;
          }
          j++;
        } else {
          array[array.length - 1 - i].state = 'sorted';
          i++;
          j = 0;
        }
      } else {
        array[0].state = 'sorted';
        isSorting = false;
        // Pause for 3 seconds, then reset
        setTimeout(() => {
          resetArray();
          i = 0;
          j = 0;
          isSorting = true;
        }, 3000);
      }
    };

    const loop = () => {
      bubbleSortStep();
      draw();
      animId = setTimeout(loop, 40);
    };

    loop();

    return () => {
      clearTimeout(animId);
    };
  }, []);

  const featureCards = [
    {
      title: 'Sorting Visualizer',
      desc: 'Watch classic algorithms like Quick, Merge, and Bubble Sort sort randomized bars in real-time, highlighted with custom color and audio synth.',
      icon: BarChart3,
      path: '/sorting',
      color: 'from-cyan-400 to-blue-500'
    },
    {
      title: 'Searching Visualizer',
      desc: 'Understand indexing scans and index-seeking algorithms like Linear Search and Binary Search inside a beautifully structured block array.',
      icon: Search,
      path: '/searching',
      color: 'from-purple-400 to-pink-500'
    },
    {
      title: 'Data Structures',
      desc: 'Interact with Stack pushes, Queue dequeues, and Linked List insertions using modular capsule structures and animated SVG connector nodes.',
      icon: Database,
      path: '/datastructures',
      color: 'from-emerald-400 to-teal-500'
    },
    {
      title: 'Pathfinding Visualizer',
      desc: 'Draw obstacles, place points, and trigger Breadth-First Search (BFS) or Dijkstra solvers to map out paths with glowing ripples.',
      icon: Grid,
      path: '/pathfinding',
      color: 'from-amber-400 to-orange-500'
    },
    {
      title: 'Tree Visualizer',
      desc: 'Explore binary search trees (BST). Visualize dynamic insertion, deletion, and inorder, preorder, and postorder traversals with animated waves.',
      icon: Network,
      path: '/tree',
      color: 'from-blue-400 to-indigo-500'
    },
    {
      title: 'Graph Visualizer',
      desc: 'Understand complex graph network traversals (BFS, DFS, Dijkstra) on an interactive customizable canvas node-link editor.',
      icon: Network,
      path: '/graph',
      color: 'from-indigo-400 to-purple-500'
    },
    {
      title: 'Algorithm Race Mode',
      desc: 'Compare two sorting operations side-by-side on identical arrays. Track comparisons, writes, and timers to announce the absolute winner.',
      icon: Zap,
      path: '/race',
      color: 'from-red-400 to-rose-500'
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto px-8 py-10 relative z-10 grid-bg-overlay">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-20 left-1/3 w-96 h-96 rounded-full bg-brand-primary/10 blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] rounded-full bg-brand-secondary/10 blur-[150px] pointer-events-none" />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20 mt-6">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border border-white/5 text-xs text-brand-primary font-mono tracking-wide">
            <Cpu className="w-3.5 h-3.5 text-brand-primary" />
            <ShinyText text="NEXUSALGO ENGINE v2.4" speed={3.5} />
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-none text-white">
            Visualize Algorithms <br />
            <span className="text-gradient">In Real Time</span>
          </h1>

          <p className="text-text-muted text-base md:text-lg max-w-xl leading-relaxed">
            Step away from boring syntax sheets. Interact directly with codebases, map complex nodes, trigger automated synthesized retro soundscapes, and visually master core algorithms and data structures.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={() => navigate('/sorting')}
              className="glow-btn px-7 py-4 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-black font-bold tracking-wide flex items-center gap-2 cursor-pointer shadow-lg shadow-brand-glow text-sm"
            >
              Start Visualizing
              <ArrowRight className="w-4 h-4 text-black" />
            </button>
            <button
              onClick={() => navigate('/race')}
              className="px-7 py-4 rounded-xl border border-white/10 hover:border-brand-primary/40 hover:bg-white/5 text-white font-semibold tracking-wide flex items-center gap-2 transition-all cursor-pointer text-sm"
            >
              Race Mode
              <Zap className="w-4 h-4 text-brand-primary" />
            </button>
          </div>
        </div>

        {/* Live Simulation Card */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-3xl relative border border-white/5 shadow-2xl shadow-black">
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-white/5 text-[10px] text-text-muted font-mono z-10">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
            LIVE SIMULATION: BUBBLE_SORT
          </div>
          
          <div className="h-60 flex items-end justify-center rounded-2xl bg-black/30 p-4 border border-white/5 overflow-hidden">
            <canvas ref={canvasRef} width="400" height="200" className="w-full h-full" />
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-text-muted font-mono border-t border-white/5 pt-4">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-brand-primary" />
              <span>Yield-state: suspended</span>
            </div>
            <span>Size: 30 indices</span>
          </div>
        </div>
      </div>

      {/* NexusAlgo Lab Key Highlights */}
      <div className="max-w-7xl mx-auto mb-24">
        <div className="text-center space-y-3 mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-white">Project Modules</h2>
          <p className="text-text-muted max-w-xl mx-auto">
            Choose an interactive environment built with state-of-the-art visual highlights, pseudocode tracing, and AI step explainers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureCards.map((card, idx) => (
            <SpotlightCard 
              key={idx}
              onClick={() => navigate(card.path)}
              className="p-8 rounded-2xl hover:border-brand-primary/30 border border-white/5 transition-all duration-300 group cursor-pointer hover:-translate-y-1.5 shadow-xl hover:shadow-2xl shadow-black relative overflow-hidden"
              spotlightColor="0, 242, 254"
            >
              {/* Card top border glow gradient */}
              <div className={`absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r ${card.color} opacity-80`} />

              <div className="mb-6 w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-brand-primary group-hover:bg-gradient-to-br group-hover:from-brand-primary/20 group-hover:to-transparent transition-colors">
                <card.icon className="w-6 h-6 text-brand-primary" />
              </div>

              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-brand-primary transition-colors flex items-center gap-2">
                {card.title}
              </h3>
              
              <p className="text-text-muted text-sm leading-relaxed mb-6">
                {card.desc}
              </p>

              <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-brand-primary uppercase opacity-60 group-hover:opacity-100 transition-opacity">
                Enter Visualizer <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </SpotlightCard>
          ))}
        </div>
      </div>

      {/* Engine Metrics Summary Card */}
      <div className="max-w-7xl mx-auto glass-panel p-8 md:p-12 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden bg-gradient-to-r from-bg-secondary to-bg-primary">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-gradient-to-l from-brand-primary/5 to-transparent pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
          <div className="space-y-4 max-w-xl">
            <h3 className="text-2xl md:text-3xl font-extrabold text-white">NexusAlgo Diagnostics Console</h3>
            <p className="text-text-muted text-sm md:text-base leading-relaxed">
              This sandbox contains fully reactive algorithmic structures running at high refresh rates. Built under standard modular components with zero runtime errors, custom synthetic frequencies, and step-by-step debugger controls.
            </p>
          </div>
          <div className="flex flex-col gap-3 min-w-[200px]">
            <div className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs font-mono text-white">
              <span className="w-2 h-2 bg-cyan-400 rounded-full" />
              High Fidelity 60FPS
            </div>
            <div className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs font-mono text-white">
              <span className="w-2 h-2 bg-yellow-400 rounded-full" />
              Audio Synth Modulators
            </div>
            <div className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs font-mono text-white">
              <span className="w-2 h-2 bg-purple-400 rounded-full" />
              Algorithm Race Engines
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
