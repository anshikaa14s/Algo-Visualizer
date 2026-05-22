import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronRight, 
  Search, 
  Layers, 
  Shuffle 
} from 'lucide-react';
import { linearSearch, binarySearch } from '../algorithms/searching';
import { useAudioSynth } from '../hooks/useAudioSynth';

export function SearchingPage() {
  const [searchMethod, setSearchMethod] = useState('linear'); // linear, binary
  const [array, setArray] = useState([]);
  const [target, setTarget] = useState(45);
  const [speed, setSpeed] = useState(250); // ms per step
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Search visual states
  const [activeIdx, setActiveIdx] = useState(null);
  const [foundIdx, setFoundIdx] = useState(null);
  const [checkedIdxs, setCheckedIdxs] = useState([]);
  const [lowBoundary, setLowBoundary] = useState(null);
  const [highBoundary, setHighBoundary] = useState(null);
  
  const [stepDesc, setStepDesc] = useState("Enter a target number and click 'Start Search'.");
  const [codeLine, setCodeLine] = useState(0);
  const [comparisons, setComparisons] = useState(0);

  const generatorRef = useRef(null);
  const timerRef = useRef(null);
  const arrayRef = useRef([]);

  const { soundEnabled, playTone } = useAudioSynth();

  const size = 16; // fixed size for neat layout

  // Generate a random array
  const generateNewArray = useCallback(() => {
    let newArray = [];
    const minVal = 10;
    const maxVal = 99;
    
    for (let i = 0; i < size; i++) {
      newArray.push(Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal);
    }

    if (searchMethod === 'binary') {
      newArray.sort((x, y) => x - y);
    }
    
    setArray(newArray);
    arrayRef.current = newArray;
    
    // Pick a random target from the array, or random value
    const shouldExist = Math.random() < 0.8;
    if (shouldExist) {
      const idx = Math.floor(Math.random() * size);
      setTarget(newArray[idx]);
    } else {
      setTarget(Math.floor(Math.random() * 80) + 15);
    }

    // Reset visualizer indicators
    setActiveIdx(null);
    setFoundIdx(null);
    setCheckedIdxs([]);
    setLowBoundary(null);
    setHighBoundary(null);
    setComparisons(0);
    setStepDesc(`Generated an array of ${size} elements. Click 'Start Search' to find target.`);
    setCodeLine(0);
    setIsPlaying(false);
    generatorRef.current = null;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [searchMethod]);

  // Regenerate when method toggles
  useEffect(() => {
    generateNewArray();
  }, [searchMethod, generateNewArray]);

  // Instantiate search generator
  const getGenerator = () => {
    if (searchMethod === 'linear') {
      return linearSearch(arrayRef.current, target);
    } else {
      return binarySearch(arrayRef.current, target);
    }
  };

  // Perform single step
  const stepForward = () => {
    if (!generatorRef.current) {
      generatorRef.current = getGenerator();
    }

    const { value, done } = generatorRef.current.next();

    if (done) {
      setIsPlaying(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // Set highlights
    setArray(value.array);
    setActiveIdx(value.active);
    setFoundIdx(value.found);
    setCheckedIdxs(value.checked || []);
    setLowBoundary(value.low);
    setHighBoundary(value.high);
    setStepDesc(value.desc);
    setCodeLine(value.codeLine);
    setComparisons(value.stats ? value.stats.comparisons : 0);

    // Play beeps on comparisons
    if (value.active !== null) {
      playTone(value.array[value.active], Math.max(...value.array));
    }
  };

  // Start continuous loop
  const startSearching = () => {
    if (isPlaying) return;
    setIsPlaying(true);
    stepForward();
    
    timerRef.current = setInterval(() => {
      stepForward();
    }, speed);
  };

  // Pause loop
  const pauseSearching = () => {
    setIsPlaying(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Speed adjust during execution
  useEffect(() => {
    if (isPlaying) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      timerRef.current = setInterval(() => {
        stepForward();
      }, speed);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [speed, isPlaying]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const algoDetails = {
    linear: {
      name: 'Linear Search',
      complexity: 'O(N)',
      space: 'O(1)',
      pseudocode: [
        "linearSearch(array, target):",
        "  for i = 0 to length - 1:",
        "    if array[i] == target: return i",
        "  return -1 (not found)"
      ]
    },
    binary: {
      name: 'Binary Search',
      complexity: 'O(log N)',
      space: 'O(1)',
      pseudocode: [
        "binarySearch(sorted_array, target):",
        "  low = 0, high = length - 1",
        "  while low <= high:",
        "    mid = (low + high) / 2",
        "    if array[mid] == target: return mid",
        "    if array[mid] < target: low = mid + 1",
        "    else: high = mid - 1",
        "  return -1 (not found)"
      ]
    }
  };

  // Dynamic block styling
  const getBlockStyles = (idx) => {
    if (foundIdx === idx) {
      return 'bg-gradient-to-tr from-emerald-500 to-green-600 border-green-400 text-white font-extrabold shadow-lg shadow-emerald-500/50 scale-105';
    }
    if (foundIdx === -1 && checkedIdxs.includes(idx)) {
      // not found state
      return 'bg-rose-950/20 border-rose-500/40 text-rose-500/40 opacity-40';
    }
    if (activeIdx === idx) {
      return 'bg-gradient-to-tr from-brand-primary to-cyan-500 border-white text-black font-extrabold shadow-md shadow-brand-primary/50 -translate-y-1';
    }
    if (searchMethod === 'binary' && lowBoundary !== null && highBoundary !== null) {
      // Gray out elements outside bounds
      if (idx < lowBoundary || idx > highBoundary) {
        return 'bg-bg-tertiary/10 border-white/5 text-text-muted/20 opacity-20 scale-95';
      }
    }
    if (checkedIdxs.includes(idx)) {
      return 'bg-white/5 border-white/10 text-text-muted/40';
    }
    return 'bg-bg-secondary border-white/10 text-white hover:border-brand-primary/30';
  };

  return (
    <div className="flex-1 overflow-y-auto px-8 py-8 relative z-10 grid-bg-overlay flex flex-col justify-between">
      <div>
        {/* Page header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
              <Search className="w-8 h-8 text-brand-primary" />
              Searching Visualizer
            </h1>
            <p className="text-text-muted text-xs font-mono mt-1">
              Visualize partition discards and step seeking scans in a modular block array
            </p>
          </div>

          {/* Action header panel */}
          <div className="flex flex-wrap items-center gap-4 bg-white/5 border border-white/5 px-4 py-3 rounded-2xl">
            {/* Search Type Toggle */}
            <div className="flex flex-col">
              <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider font-semibold">Search Algorithm</span>
              <select
                value={searchMethod}
                onChange={(e) => setSearchMethod(e.target.value)}
                disabled={isPlaying}
                className="bg-transparent text-sm font-semibold text-white focus:outline-none border-none cursor-pointer mt-1"
              >
                <option value="linear" className="bg-bg-secondary text-white">Linear Search</option>
                <option value="binary" className="bg-bg-secondary text-white">Binary Search (Sorted)</option>
              </select>
            </div>

            <div className="h-6 w-px bg-white/10" />

            {/* Target input */}
            <div className="flex flex-col w-20">
              <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider font-semibold">Target</span>
              <input
                type="number"
                value={target}
                disabled={isPlaying}
                onChange={(e) => setTarget(Math.min(99, Math.max(0, Number(e.target.value))))}
                className="bg-transparent text-sm font-semibold text-brand-primary focus:outline-none border-none mt-1 font-mono"
              />
            </div>

            <div className="h-6 w-px bg-white/10" />

            {/* Speed slider */}
            <div className="flex flex-col w-28">
              <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider font-semibold">
                Speed: {speed}ms
              </span>
              <input
                type="range"
                min="50"
                max="1000"
                step="50"
                value={1050 - speed}
                onChange={(e) => setSpeed(1050 - Number(e.target.value))}
                className="w-full accent-brand-primary h-1 rounded-lg mt-2.5 cursor-pointer bg-white/10"
              />
            </div>
          </div>
        </div>

        {/* Visualizer Blocks Grid */}
        <div className="glass-panel p-8 rounded-3xl border border-white/5 relative shadow-2xl bg-black/25 flex flex-col justify-center min-h-[220px] mb-8">
          <div className="absolute top-4 left-4 flex gap-4 text-xs font-mono text-text-muted">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Active Checking
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Target Found
            </div>
            {searchMethod === 'binary' && (
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-gray-600 opacity-30" /> Discarded Half
              </div>
            )}
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-16 gap-3 pt-6">
            {array.map((val, idx) => (
              <div
                key={idx}
                className={`aspect-square flex flex-col items-center justify-center rounded-xl border transition-all duration-300 ${getBlockStyles(
                  idx
                )}`}
              >
                <span className="text-[10px] font-mono opacity-50 block mb-1">i: {idx}</span>
                <span className="text-lg font-bold font-mono">{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-4 flex flex-col gap-4">
            <div className="flex gap-3">
              {isPlaying ? (
                <button
                  onClick={pauseSearching}
                  className="flex-1 px-6 py-3.5 rounded-xl border border-white/10 hover:border-brand-primary/50 text-white font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer bg-white/5"
                >
                  <Pause className="w-4 h-4 text-brand-primary" />
                  Pause
                </button>
              ) : (
                <button
                  onClick={startSearching}
                  className="glow-btn flex-1 px-6 py-3.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-black font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-brand-glow"
                >
                  <Play className="w-4 h-4 text-black fill-black" />
                  Search
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
                title="Regenerate Array"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>

            {/* Target helper generator */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  // pick a number that exists inside array
                  const idx = Math.floor(Math.random() * size);
                  setTarget(array[idx]);
                  generateNewArray();
                }}
                disabled={isPlaying}
                className="w-full px-4 py-3 rounded-xl border border-white/5 hover:border-brand-primary/30 text-xs font-mono font-semibold text-text-muted hover:text-white flex items-center justify-center gap-2 cursor-pointer transition-all bg-white/5"
              >
                <Layers className="w-3.5 h-3.5 text-brand-primary" />
                Target Exists
              </button>
              <button
                onClick={() => {
                  // pick random non-existing number
                  let randomNum;
                  do {
                    randomNum = Math.floor(Math.random() * 80) + 15;
                  } while (array.includes(randomNum));
                  setTarget(randomNum);
                  generateNewArray();
                }}
                disabled={isPlaying}
                className="w-full px-4 py-3 rounded-xl border border-white/5 hover:border-brand-primary/30 text-xs font-mono font-semibold text-text-muted hover:text-white flex items-center justify-center gap-2 cursor-pointer transition-all bg-white/5"
              >
                <Shuffle className="w-3.5 h-3.5 text-brand-secondary" />
                Target Absent
              </button>
            </div>

            {/* Quick comparisons statistics */}
            <div className="glass-panel rounded-2xl p-5 border border-white/5 space-y-3 font-mono text-sm bg-black/15">
              <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Details</span>
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-text-muted">Target Value:</span>
                <span className="text-brand-primary font-bold">{target}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-muted">Comparisons Made:</span>
                <span className="text-white font-bold">{comparisons}</span>
              </div>
            </div>
          </div>

          {/* AI explainer */}
          <div className="md:col-span-8 flex flex-col gap-6">
            <div className="glass-panel rounded-2xl p-6 border border-brand-primary/20 bg-gradient-to-tr from-brand-primary/5 to-transparent relative shadow-xl">
              <div className="absolute top-4 right-4 text-[10px] font-mono text-brand-primary border border-brand-primary/30 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                AI Explanation Panel
              </div>
              <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider font-semibold block mb-3">Live Search Logs</span>
              <p className="text-white leading-relaxed text-sm font-sans pr-24">
                "{stepDesc}"
              </p>
            </div>

            {/* Pseudocode & complexity details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Pseudocode Tracker */}
              <div className="glass-panel rounded-2xl p-6 border border-white/5 bg-black/15">
                <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider font-semibold block mb-3">
                  Pseudocode Tracker
                </span>
                <div className="space-y-1.5 font-mono text-xs text-text-muted select-none">
                  {algoDetails[searchMethod].pseudocode.map((line, idx) => (
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

              {/* Complexity Stats */}
              <div className="glass-panel rounded-2xl p-6 border border-white/5 bg-black/15 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider font-semibold block mb-3">
                    Asymptotic Complexity
                  </span>
                  <div className="space-y-4 font-mono text-xs mt-4">
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-text-muted">Algorithm Name:</span>
                      <span className="text-white font-bold">{algoDetails[searchMethod].name}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-text-muted">Time Complexity:</span>
                      <span className="text-emerald-400 font-bold">{algoDetails[searchMethod].complexity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Space Complexity:</span>
                      <span className="text-cyan-400 font-bold">{algoDetails[searchMethod].space}</span>
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
