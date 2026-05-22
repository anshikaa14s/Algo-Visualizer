import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronRight, 
  Volume2, 
  VolumeX, 
  HelpCircle, 
  Zap, 
  Layers 
} from 'lucide-react';
import { 
  bubbleSort, 
  selectionSort, 
  insertionSort, 
  mergeSort, 
  quickSort 
} from '../algorithms/sorting';
import { useAudioSynth } from '../hooks/useAudioSynth';

export function SortingPage() {
  const [algorithm, setAlgorithm] = useState('bubble');
  const [array, setArray] = useState([]);
  const [arraySize, setArraySize] = useState(35);
  const [speed, setSpeed] = useState(300); // ms per step
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Highlighting states
  const [compared, setCompared] = useState([]);
  const [swapped, setSwapped] = useState([]);
  const [active, setActive] = useState([]);
  const [sorted, setSorted] = useState([]);
  
  // Narrative states
  const [stepDesc, setStepDesc] = useState("Click 'Start' to begin sorting the array.");
  const [codeLine, setCodeLine] = useState(0);
  const [stats, setStats] = useState({ comparisons: 0, swaps: 0 });

  // Refs for tracking generator execution
  const generatorRef = useRef(null);
  const timerRef = useRef(null);
  const arrayRef = useRef([]);

  const speedRef = useRef(speed);
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  const { soundEnabled, toggleSound, playTone } = useAudioSynth();

  // Pseudocode and complexities database
  const algoDetails = {
    bubble: {
      name: "Bubble Sort",
      best: "O(N)",
      avg: "O(N²)",
      worst: "O(N²)",
      space: "O(1)",
      pseudocode: [
        "for i = 0 to n - 1:",
        "  for j = 0 to n - i - 1:",
        "    if arr[j] > arr[j+1]:",
        "      swap(arr[j], arr[j+1])",
        "  element in place",
        "array sorted!"
      ]
    },
    selection: {
      name: "Selection Sort",
      best: "O(N²)",
      avg: "O(N²)",
      worst: "O(N²)",
      space: "O(1)",
      pseudocode: [
        "for i = 0 to n - 1:",
        "  min_idx = i",
        "  for j = i + 1 to n:",
        "    if arr[j] < arr[min_idx]: min_idx = j",
        "  if min_idx != i: swap(arr[i], arr[min_idx])",
        "array sorted!"
      ]
    },
    insertion: {
      name: "Insertion Sort",
      best: "O(N)",
      avg: "O(N²)",
      worst: "O(N²)",
      space: "O(1)",
      pseudocode: [
        "for i = 1 to n:",
        "  key = arr[i], j = i - 1",
        "  while j >= 0 and arr[j] > key:",
        "    arr[j + 1] = arr[j], j--",
        "  arr[j + 1] = key",
        "array sorted!"
      ]
    },
    merge: {
      name: "Merge Sort",
      best: "O(N log N)",
      avg: "O(N log N)",
      worst: "O(N log N)",
      space: "O(N)",
      pseudocode: [
        "mergeSort(left, right):",
        "  if left >= right: return",
        "  mid = (left + right) / 2",
        "  mergeSort(left, mid), mergeSort(mid+1, right)",
        "  merge(left, mid, right)",
        "array sorted!"
      ]
    },
    quick: {
      name: "Quick Sort",
      best: "O(N log N)",
      avg: "O(N log N)",
      worst: "O(N²)",
      space: "O(log N)",
      pseudocode: [
        "quickSort(left, right):",
        "  if left >= right: return",
        "  pivot_idx = partition(left, right)",
        "  quickSort(left, pivot_idx - 1)",
        "  quickSort(pivot_idx + 1, right)",
        "array sorted!"
      ]
    }
  };

  // Generate a random array
  const generateNewArray = useCallback(() => {
    const newArray = [];
    const maxVal = 200;
    const minVal = 20;
    for (let i = 0; i < arraySize; i++) {
      newArray.push(Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal);
    }
    setArray(newArray);
    arrayRef.current = newArray;
    
    // Reset highlights and states
    setCompared([]);
    setSwapped([]);
    setActive([]);
    setSorted([]);
    setStats({ comparisons: 0, swaps: 0 });
    setStepDesc(`Generated a new random array of ${arraySize} elements. Select an algorithm and click 'Start'.`);
    setCodeLine(0);
    setIsPlaying(false);
    generatorRef.current = null;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [arraySize]);

  // Generate on size change
  useEffect(() => {
    generateNewArray();
  }, [generateNewArray]);

  // Instantiate sorting generator
  const getGenerator = () => {
    const arrCopy = [...arrayRef.current];
    if (algorithm === 'bubble') return bubbleSort(arrCopy);
    if (algorithm === 'selection') return selectionSort(arrCopy);
    if (algorithm === 'insertion') return insertionSort(arrCopy);
    if (algorithm === 'merge') return mergeSort(arrCopy);
    if (algorithm === 'quick') return quickSort(arrCopy);
    return bubbleSort(arrCopy);
  };

  // Perform a single step of the algorithm
  const stepForward = () => {
    if (!generatorRef.current) {
      generatorRef.current = getGenerator();
    }

    const { value, done } = generatorRef.current.next();

    if (done) {
      setIsPlaying(false);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setCompared([]);
      setSwapped([]);
      setActive([]);
      setStepDesc("Sorting finished successfully!");
      return true;
    }

    // Apply values yielded by generator
    setArray(value.array);
    setCompared(value.compared || []);
    setSwapped(value.swapped || []);
    setActive(value.active || []);
    setSorted(value.sorted || []);
    setStepDesc(value.desc);
    setStats(value.stats || { comparisons: 0, swaps: 0 });
    setCodeLine(value.codeLine !== undefined ? value.codeLine : 0);

    // Audio synth beep
    if (value.compared && value.compared.length > 0) {
      const idx = value.compared[0];
      playTone(value.array[idx], Math.max(...value.array));
    } else if (value.swapped && value.swapped.length > 0) {
      const idx = value.swapped[0];
      playTone(value.array[idx], Math.max(...value.array));
    }
    return false;
  };

  const scheduleNextSortingStep = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    
    timerRef.current = setTimeout(() => {
      const isDone = stepForward();
      if (!isDone) {
        scheduleNextSortingStep();
      }
    }, speedRef.current);
  }, []);

  // Start continuous loop
  const startSorting = () => {
    if (isPlaying) return;
    setIsPlaying(true);
    scheduleNextSortingStep();
  };

  // Pause loop
  const pauseSorting = () => {
    setIsPlaying(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // Clean up timers
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleAlgorithmChange = (e) => {
    setAlgorithm(e.target.value);
    // Force regeneration to avoid illegal pointer frames
    setTimeout(() => {
      generateNewArray();
    }, 50);
  };

  // Dynamic bar styling class
  const getBarColorClass = (idx) => {
    if (swapped.includes(idx)) return 'from-rose-500 to-red-600 shadow-lg shadow-rose-900/50 scale-y-105'; // Swapped
    if (compared.includes(idx)) return 'from-amber-400 to-yellow-500 shadow-md shadow-yellow-900/40'; // Compared
    if (active.includes(idx)) return 'from-cyan-400 to-sky-500 shadow-md shadow-cyan-900/30'; // Active pivot/min
    if (sorted.includes(idx)) return 'from-brand-secondary to-purple-600 shadow-sm scale-y-100'; // Sorted
    return 'from-brand-primary/60 to-brand-primary/95'; // Standard bar
  };

  return (
    <div className="flex-1 overflow-y-auto px-8 py-8 relative z-10 grid-bg-overlay flex flex-col justify-between">
      <div>
        {/* Page title header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
              <Layers className="w-8 h-8 text-brand-primary" />
              Sorting Visualizer
            </h1>
            <p className="text-text-muted text-xs font-mono mt-1">
              Visualize sorting array nodes with color indicators and pitch modulations
            </p>
          </div>
          
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center gap-4 bg-white/5 border border-white/5 px-4 py-3 rounded-2xl">
            <div className="flex flex-col">
              <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider font-semibold">Algorithm</span>
              <select
                value={algorithm}
                onChange={handleAlgorithmChange}
                disabled={isPlaying}
                className="bg-transparent text-sm font-semibold text-white focus:outline-none border-none cursor-pointer mt-1"
              >
                <option value="bubble" className="bg-bg-secondary text-white">Bubble Sort</option>
                <option value="selection" className="bg-bg-secondary text-white">Selection Sort</option>
                <option value="insertion" className="bg-bg-secondary text-white">Insertion Sort</option>
                <option value="merge" className="bg-bg-secondary text-white">Merge Sort</option>
                <option value="quick" className="bg-bg-secondary text-white">Quick Sort</option>
              </select>
            </div>
            
            <div className="h-6 w-px bg-white/10" />

            {/* Speed slider */}
            <div className="flex flex-col w-28">
              <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider font-semibold">
                Speed: {speed}ms
              </span>
              <input
                type="range"
                min="10"
                max="800"
                step="10"
                value={810 - speed}
                onChange={(e) => setSpeed(810 - Number(e.target.value))}
                className="w-full accent-brand-primary h-1 rounded-lg mt-2.5 cursor-pointer bg-white/10"
              />
            </div>

            <div className="h-6 w-px bg-white/10" />

            {/* Size slider */}
            <div className="flex flex-col w-28">
              <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider font-semibold">
                Size: {arraySize} bars
              </span>
              <input
                type="range"
                min="10"
                max="80"
                step="1"
                value={arraySize}
                disabled={isPlaying}
                onChange={(e) => setArraySize(Number(e.target.value))}
                className="w-full accent-brand-primary h-1 rounded-lg mt-2.5 cursor-pointer bg-white/10"
              />
            </div>
          </div>
        </div>

        {/* Visualizer Frame */}
        <div className="glass-panel p-8 rounded-3xl border border-white/5 relative shadow-2xl bg-black/25 flex flex-col justify-between h-[360px] mb-8">
          <div className="absolute top-4 left-4 flex gap-4 text-xs font-mono text-text-muted">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Active/Pivot
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" /> Comparison
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Swap
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-secondary" /> Sorted
            </div>
          </div>

          <div className="flex-1 flex items-end justify-center gap-1 md:gap-2 px-4 pb-2 mt-4 overflow-hidden h-[250px]">
            {array.map((val, idx) => {
              const maxVal = Math.max(...array) || 1;
              const heightPct = `${(val / maxVal) * 70 + 12}%`; // Scaled to leave exact margins for labels
              const transitionDuration = isPlaying ? `${Math.min(speed / 2, 200)}ms` : '150ms';

              const isCompared = compared.includes(idx);
              const isSwapped = swapped.includes(idx);
              const isActive = active.includes(idx);

              return (
                <div 
                  key={idx}
                  className="flex flex-col items-center justify-end h-full flex-1 max-w-[30px] group relative"
                >
                  {/* Numerical Value Label above the bar */}
                  {arraySize <= 35 && (
                    <span className="text-[9px] font-mono font-bold text-white mb-1 select-none animate-fade-in opacity-80 group-hover:opacity-100 transition-opacity">
                      {val}
                    </span>
                  )}

                  {/* The Graphic Bar element */}
                  <div
                    style={{ height: heightPct, transitionDuration }}
                    className={`w-full rounded-t-md bg-gradient-to-t transition-all ${getBarColorClass(idx)} relative`}
                    title={`Index: ${idx}, Value: ${val}`}
                  >
                    {/* Pulsing neon notification light for active operations */}
                    {(isCompared || isSwapped || isActive) && (
                      <div className={`absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full animate-ping ${
                        isSwapped ? 'bg-rose-500' : isCompared ? 'bg-yellow-400' : 'bg-cyan-400'
                      }`} />
                    )}
                  </div>

                  {/* Array Index Label below the bar */}
                  {arraySize <= 35 && (
                    <span className="text-[9px] font-mono text-text-muted mt-1 select-none font-semibold">
                      {idx}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Control Buttons Group */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Action triggers */}
          <div className="md:col-span-4 flex flex-col gap-4">
            <div className="flex gap-3">
              {isPlaying ? (
                <button
                  onClick={pauseSorting}
                  className="flex-1 px-6 py-3.5 rounded-xl border border-white/10 hover:border-brand-primary/50 text-white font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer bg-white/5"
                >
                  <Pause className="w-4 h-4 text-brand-primary" />
                  Pause
                </button>
              ) : (
                <button
                  onClick={startSorting}
                  className="glow-btn flex-1 px-6 py-3.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-black font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-brand-glow"
                >
                  <Play className="w-4 h-4 text-black fill-black" />
                  Start
                </button>
              )}

              <button
                onClick={stepForward}
                disabled={isPlaying}
                className="px-4 py-3.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 disabled:opacity-40 disabled:hover:bg-white/5 text-white cursor-pointer transition-all"
                title="Step Forward"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <button
                onClick={generateNewArray}
                className="px-4 py-3.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 text-white cursor-pointer transition-all"
                title="Shuffle Array"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>

            {/* Dynamic statistics card */}
            <div className="glass-panel rounded-2xl p-5 border border-white/5 space-y-3 font-mono text-sm bg-black/15">
              <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Execution Statistics</span>
              <div className="flex justify-between items-center border-b border-white/5 pb-2 mt-2">
                <span className="text-text-muted">Comparisons:</span>
                <span className="text-white font-bold">{stats.comparisons}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-muted">Swaps / Writes:</span>
                <span className="text-brand-primary font-bold">{stats.swaps}</span>
              </div>
            </div>
          </div>

          {/* AI Explanation Console */}
          <div className="md:col-span-8 flex flex-col gap-6">
            <div className="glass-panel rounded-2xl p-6 border border-brand-primary/20 bg-gradient-to-tr from-brand-primary/5 to-transparent relative shadow-xl">
              <div className="absolute top-4 right-4 text-[10px] font-mono text-brand-primary border border-brand-primary/30 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                AI Explanation Panel
              </div>
              <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider font-semibold block mb-3">Live Analysis Console</span>
              <p className="text-white leading-relaxed text-sm font-sans pr-24">
                "{stepDesc}"
              </p>
            </div>

            {/* Complexity & Pseudocode Panels */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Pseudocode Highlight Panel */}
              <div className="glass-panel rounded-2xl p-6 border border-white/5 bg-black/15">
                <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider font-semibold block mb-3">
                  Pseudocode Tracker
                </span>
                <div className="space-y-1.5 font-mono text-xs text-text-muted select-none">
                  {algoDetails[algorithm].pseudocode.map((line, idx) => (
                    <div
                      key={idx}
                      className={`py-1 px-2.5 rounded-md transition-colors ${
                        codeLine === idx
                          ? 'bg-brand-primary/10 border-l-2 border-brand-primary text-brand-primary font-semibold'
                          : ''
                      }`}
                    >
                      {line}
                    </div>
                  ))}
                </div>
              </div>

              {/* Complexity Table */}
              <div className="glass-panel rounded-2xl p-6 border border-white/5 bg-black/15 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider font-semibold block mb-3">
                    Asymptotic Complexity
                  </span>
                  <div className="space-y-3.5 font-mono text-xs mt-2">
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-text-muted">Best Case:</span>
                      <span className="text-emerald-400 font-bold">{algoDetails[algorithm].best}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-text-muted">Average Case:</span>
                      <span className="text-yellow-400 font-bold">{algoDetails[algorithm].avg}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-text-muted">Worst Case:</span>
                      <span className="text-rose-400 font-bold">{algoDetails[algorithm].worst}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Auxiliary Space:</span>
                      <span className="text-cyan-400 font-bold">{algoDetails[algorithm].space}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
