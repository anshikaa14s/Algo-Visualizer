import { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  RotateCcw, 
  Zap, 
  HelpCircle, 
  Volume2, 
  VolumeX, 
  Trophy 
} from 'lucide-react';
import { 
  bubbleSort, 
  selectionSort, 
  insertionSort, 
  mergeSort, 
  quickSort 
} from '../algorithms/sorting';
import { 
  linearSearch, 
  binarySearch 
} from '../algorithms/searching';
import { useAudioSynth } from '../hooks/useAudioSynth';
import confetti from 'canvas-confetti';

export function RaceModePage() {
  const [algoLeft, setAlgoLeft] = useState('quick');
  const [algoRight, setAlgoRight] = useState('bubble');
  const [arraySize, setArraySize] = useState(25);
  const [speed, setSpeed] = useState(80); // speed of tick in ms
  const [isPlaying, setIsPlaying] = useState(false);
  const [raceCategory, setRaceCategory] = useState('sorting'); // 'sorting' or 'searching'
  const [target, setTarget] = useState(45);

  // Separate visual arrays (must start identical)
  const [arrayLeft, setArrayLeft] = useState([]);
  const [arrayRight, setArrayRight] = useState([]);

  // Stats trackers
  const [statsLeft, setStatsLeft] = useState({ comparisons: 0, swaps: 0, time: 0 });
  const [statsRight, setStatsRight] = useState({ comparisons: 0, swaps: 0, time: 0 });

  // Highlighting trackers
  const [comparedLeft, setComparedLeft] = useState([]);
  const [swappedLeft, setSwappedLeft] = useState([]);
  const [sortedLeft, setSortedLeft] = useState([]);
  
  const [comparedRight, setComparedRight] = useState([]);
  const [swappedRight, setSwappedRight] = useState([]);
  const [sortedRight, setSortedRight] = useState([]);

  // Winner modal states
  const [raceFinished, setRaceFinished] = useState(false);
  const [winnerDetails, setWinnerDetails] = useState(null);

  // References for concurrent execution
  const genLeftRef = useRef(null);
  const genRightRef = useRef(null);
  const timerRef = useRef(null);
  const initialSeedRef = useRef([]);

  // Timers to calculate actual duration
  const startTimeRef = useRef(null);
  const leftDoneTimeRef = useRef(null);
  const rightDoneTimeRef = useRef(null);

  const { soundEnabled, toggleSound, playTone } = useAudioSynth();

  // Initialize a synchronized shared seed array
  const generateSharedArray = () => {
    const seed = [];
    const minVal = 15;
    const maxVal = 140;
    for (let i = 0; i < arraySize; i++) {
      seed.push(Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal);
    }
    
    if (raceCategory === 'searching') {
      seed.sort((x, y) => x - y);
      const shouldExist = Math.random() < 0.8;
      if (shouldExist) {
        const idx = Math.floor(Math.random() * arraySize);
        setTarget(seed[idx]);
      } else {
        setTarget(Math.floor(Math.random() * 120) + 15);
      }
    }
    
    initialSeedRef.current = seed;
    
    // Distribute identical arrays
    setArrayLeft([...seed]);
    setArrayRight([...seed]);

    // Reset markers
    setComparedLeft([]);
    setSwappedLeft([]);
    setSortedLeft([]);
    setComparedRight([]);
    setSwappedRight([]);
    setSortedRight([]);

    // Reset stats
    setStatsLeft({ comparisons: 0, swaps: 0, time: 0 });
    setStatsRight({ comparisons: 0, swaps: 0, time: 0 });

    setIsPlaying(false);
    setRaceFinished(false);
    setWinnerDetails(null);

    genLeftRef.current = null;
    genRightRef.current = null;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleCategoryChange = (cat) => {
    setRaceCategory(cat);
    if (cat === 'sorting') {
      setAlgoLeft('quick');
      setAlgoRight('bubble');
    } else {
      setAlgoLeft('linear');
      setAlgoRight('binary');
    }
  };

  useEffect(() => {
    generateSharedArray();
  }, [arraySize, raceCategory]);

  const getGenerator = (algoType, arr) => {
    if (raceCategory === 'sorting') {
      if (algoType === 'bubble') return bubbleSort(arr);
      if (algoType === 'selection') return selectionSort(arr);
      if (algoType === 'insertion') return insertionSort(arr);
      if (algoType === 'merge') return mergeSort(arr);
      if (algoType === 'quick') return quickSort(arr);
      return bubbleSort(arr);
    } else {
      if (algoType === 'linear') return linearSearch(arr, target);
      if (algoType === 'binary') return binarySearch(arr, target);
      return linearSearch(arr, target);
    }
  };

  const startRace = () => {
    if (isPlaying || raceFinished) return;
    setIsPlaying(true);
    
    // Instantiate generators with copies of initial seeds
    genLeftRef.current = getGenerator(algoLeft, [...initialSeedRef.current]);
    genRightRef.current = getGenerator(algoRight, [...initialSeedRef.current]);

    // Set starting clock references
    startTimeRef.current = performance.now();
    leftDoneTimeRef.current = null;
    rightDoneTimeRef.current = null;

    let leftFinished = false;
    let rightFinished = false;

    timerRef.current = setInterval(() => {
      const now = performance.now();
      const currentElapsed = Math.round(now - startTimeRef.current);

      // 1. STEP LEFT GENERATOR
      if (!leftFinished) {
        const step = genLeftRef.current.next();
        if (step.done) {
          leftFinished = true;
          leftDoneTimeRef.current = currentElapsed;
          setComparedLeft([]);
          setSwappedLeft([]);
        } else {
          setArrayLeft(step.value.array);
          if (raceCategory === 'sorting') {
            setComparedLeft(step.value.compared || []);
            setSwappedLeft(step.value.swapped || []);
            setSortedLeft(step.value.sorted || []);
            setStatsLeft({
              comparisons: step.value.stats.comparisons,
              swaps: step.value.stats.swaps,
              time: currentElapsed
            });
          } else {
            setComparedLeft(step.value.active !== null ? [step.value.active] : []);
            setSwappedLeft(step.value.found !== null && step.value.found !== -1 ? [step.value.found] : []);
            setSortedLeft(step.value.checked || []);
            setStatsLeft({
              comparisons: step.value.stats.comparisons,
              swaps: 0,
              time: currentElapsed
            });
            if (step.value.found !== null) {
              leftFinished = true;
              leftDoneTimeRef.current = currentElapsed;
              setComparedLeft([]);
            }
          }
          if (soundEnabled && step.value.compared && step.value.compared.length > 0) {
            playTone(step.value.array[step.value.compared[0]], 150);
          } else if (soundEnabled && step.value.active !== null) {
            playTone(step.value.array[step.value.active], 150);
          }
        }
      }

      // 2. STEP RIGHT GENERATOR
      if (!rightFinished) {
        const step = genRightRef.current.next();
        if (step.done) {
          rightFinished = true;
          rightDoneTimeRef.current = currentElapsed;
          setComparedRight([]);
          setSwappedRight([]);
        } else {
          setArrayRight(step.value.array);
          if (raceCategory === 'sorting') {
            setComparedRight(step.value.compared || []);
            setSwappedRight(step.value.swapped || []);
            setSortedRight(step.value.sorted || []);
            setStatsRight({
              comparisons: step.value.stats.comparisons,
              swaps: step.value.stats.swaps,
              time: currentElapsed
            });
          } else {
            setComparedRight(step.value.active !== null ? [step.value.active] : []);
            setSwappedRight(step.value.found !== null && step.value.found !== -1 ? [step.value.found] : []);
            setSortedRight(step.value.checked || []);
            setStatsRight({
              comparisons: step.value.stats.comparisons,
              swaps: 0,
              time: currentElapsed
            });
            if (step.value.found !== null) {
              rightFinished = true;
              rightDoneTimeRef.current = currentElapsed;
              setComparedRight([]);
            }
          }
          if (soundEnabled && step.value.compared && step.value.compared.length > 0) {
            playTone(step.value.array[step.value.compared[0]], 150);
          } else if (soundEnabled && step.value.active !== null) {
            playTone(step.value.array[step.value.active], 150);
          }
        }
      }

      // 3. CHECK END OF RACE
      if (leftFinished && rightFinished) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        setIsPlaying(false);
        declareWinner();
      }
    }, speed);
  };

  const declareWinner = () => {
    // Determine winner based on completed millisecond clocks
    const tL = leftDoneTimeRef.current || 99999;
    const tR = rightDoneTimeRef.current || 99999;

    let winnerName = "";
    let loserName = "";
    let winnerTime = 0;
    let loserTime = 0;
    let desc = "";

    const nameL = algoLeft.charAt(0).toUpperCase() + algoLeft.slice(1) + (raceCategory === 'sorting' ? " Sort" : " Search");
    const nameR = algoRight.charAt(0).toUpperCase() + algoRight.slice(1) + (raceCategory === 'sorting' ? " Sort" : " Search");

    if (tL < tR) {
      winnerName = nameL;
      loserName = nameR;
      winnerTime = tL;
      loserTime = tR;
      desc = `${winnerName} finished first, completing the ${raceCategory} task in ${winnerTime}ms compared to ${loserTime}ms!`;
    } else if (tR < tL) {
      winnerName = nameR;
      loserName = nameL;
      winnerTime = tR;
      loserTime = tL;
      desc = `${winnerName} dominated the race, wrapping up in ${winnerTime}ms, beating out ${loserName}'s ${loserTime}ms!`;
    } else {
      winnerName = "It's a Tie!";
      desc = `Both algorithms solved the identical ${raceCategory} arrays in the exact same time!`;
    }

    setWinnerDetails({
      winner: winnerName,
      loser: loserName,
      winnerTime,
      loserTime,
      desc
    });
    setRaceFinished(true);

    // Trigger canvas confetti celebration!
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const getBarColorLeft = (idx) => {
    if (swappedLeft.includes(idx)) return 'from-rose-500 to-red-600 scale-y-105';
    if (comparedLeft.includes(idx)) return 'from-yellow-400 to-amber-500';
    if (sortedLeft.includes(idx)) return 'from-brand-secondary to-purple-600';
    return 'from-brand-primary/50 to-brand-primary/90';
  };

  const getBarColorRight = (idx) => {
    if (swappedRight.includes(idx)) return 'from-rose-500 to-red-600 scale-y-105';
    if (comparedRight.includes(idx)) return 'from-yellow-400 to-amber-500';
    if (sortedRight.includes(idx)) return 'from-brand-secondary to-purple-600';
    return 'from-brand-primary/50 to-brand-primary/90';
  };

  return (
    <div className="flex-1 overflow-y-auto px-8 py-8 relative z-10 grid-bg-overlay flex flex-col justify-between">
      <div>
        {/* Page title */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
              <Zap className="w-8 h-8 text-brand-primary animate-pulse" />
              Algorithm Race Mode
            </h1>
            <p className="text-text-muted text-xs font-mono mt-1">
              Select two routines to solve identical datasets and benchmark their efficiency side-by-side
            </p>
          </div>

          {/* Quick controls bar */}
          <div className="flex flex-wrap items-center gap-4 bg-white/5 border border-white/5 px-4 py-3 rounded-2xl">
            {/* Race Category selection */}
            <div className="flex flex-col">
              <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider font-semibold">Race Category</span>
              <select
                value={raceCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                disabled={isPlaying}
                className="bg-transparent text-sm font-semibold text-white focus:outline-none border-none cursor-pointer mt-1"
              >
                <option value="sorting" className="bg-bg-secondary text-white">Sorting</option>
                <option value="searching" className="bg-bg-secondary text-white">Searching</option>
              </select>
            </div>

            <div className="h-6 w-px bg-white/10" />

            {/* Speed selection */}
            <div className="flex flex-col w-24">
              <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider font-semibold">Tick Speed</span>
              <select
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                disabled={isPlaying}
                className="bg-transparent text-sm font-semibold text-white focus:outline-none border-none cursor-pointer mt-1"
              >
                <option value="150" className="bg-bg-secondary text-white">Slow (150ms)</option>
                <option value="80" className="bg-bg-secondary text-white">Normal (80ms)</option>
                <option value="25" className="bg-bg-secondary text-white">Turbo (25ms)</option>
              </select>
            </div>

            <div className="h-6 w-px bg-white/10" />

            {/* Size selection */}
            <div className="flex flex-col w-20">
              <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider font-semibold">Size</span>
              <select
                value={arraySize}
                onChange={(e) => setArraySize(Number(e.target.value))}
                disabled={isPlaying}
                className="bg-transparent text-sm font-semibold text-white focus:outline-none border-none cursor-pointer mt-1 font-mono"
              >
                <option value="15" className="bg-bg-secondary text-white">15 nodes</option>
                <option value="25" className="bg-bg-secondary text-white">25 nodes</option>
                <option value="35" className="bg-bg-secondary text-white">35 nodes</option>
              </select>
            </div>

            {raceCategory === 'searching' && (
              <>
                <div className="h-6 w-px bg-white/10" />
                <div className="flex flex-col w-20">
                  <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider font-semibold">Target</span>
                  <input
                    type="number"
                    value={target}
                    disabled={isPlaying}
                    onChange={(e) => {
                      const newTarget = Math.max(0, Number(e.target.value));
                      setTarget(newTarget);
                      genLeftRef.current = null;
                      genRightRef.current = null;
                      setRaceFinished(false);
                      setWinnerDetails(null);
                    }}
                    className="bg-transparent text-sm font-semibold text-brand-primary focus:outline-none border-none mt-1 font-mono w-full"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Side-by-side Dual Visualizers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* LEFT RUNNER */}
          <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-black/20 flex flex-col justify-between h-[360px] relative">
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
              <select
                value={algoLeft}
                onChange={(e) => setAlgoLeft(e.target.value)}
                disabled={isPlaying}
                className="bg-bg-secondary border border-white/5 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none font-bold"
              >
                {raceCategory === 'sorting' ? (
                  <>
                    <option value="bubble">Bubble Sort</option>
                    <option value="selection">Selection Sort</option>
                    <option value="insertion">Insertion Sort</option>
                    <option value="merge">Merge Sort</option>
                    <option value="quick">Quick Sort</option>
                  </>
                ) : (
                  <>
                    <option value="linear">Linear Search</option>
                    <option value="binary">Binary Search</option>
                  </>
                )}
              </select>
              
              <div className="flex gap-4 font-mono text-[10px] text-text-muted">
                <span>Compares: <strong className="text-white">{statsLeft.comparisons}</strong></span>
                {raceCategory === 'sorting' && (
                  <span>Swaps: <strong className="text-brand-primary">{statsLeft.swaps}</strong></span>
                )}
                <span>Clock: <strong className="text-brand-secondary">{statsLeft.time}ms</strong></span>
              </div>
            </div>

            {/* Bars Area */}
            <div className="flex-1 flex items-end justify-center gap-1 md:gap-1.5 px-2 pb-2 mt-12 overflow-hidden h-[240px]">
              {arrayLeft.map((val, idx) => {
                const max = Math.max(...arrayLeft) || 1;
                const pct = `${(val / max) * 80 + 10}%`;
                return (
                  <div
                    key={idx}
                    className="flex flex-col items-center justify-end h-full flex-1 group relative"
                  >
                    <span 
                      style={{ 
                        bottom: `calc(${pct} + 2px)`,
                        transform: arraySize <= 25 ? 'translateX(-50%)' : 'translateX(-50%) rotate(-90deg) translateY(-2px)',
                        transformOrigin: 'left center'
                      }}
                      className={`absolute left-1/2 font-mono font-bold text-white select-none animate-fade-in transition-all z-10 ${
                        arraySize <= 25 ? 'text-[8px] opacity-85' : 'text-[6px] opacity-70 whitespace-nowrap'
                      }`}
                    >
                      {val}
                    </span>

                    <div
                      style={{ height: pct }}
                      className={`w-full rounded-t-sm bg-gradient-to-t transition-all duration-300 ${getBarColorLeft(idx)}`}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT RUNNER */}
          <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-black/20 flex flex-col justify-between h-[360px] relative">
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
              <select
                value={algoRight}
                onChange={(e) => setAlgoRight(e.target.value)}
                disabled={isPlaying}
                className="bg-bg-secondary border border-white/5 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none font-bold"
              >
                {raceCategory === 'sorting' ? (
                  <>
                    <option value="bubble">Bubble Sort</option>
                    <option value="selection">Selection Sort</option>
                    <option value="insertion">Insertion Sort</option>
                    <option value="merge">Merge Sort</option>
                    <option value="quick">Quick Sort</option>
                  </>
                ) : (
                  <>
                    <option value="linear">Linear Search</option>
                    <option value="binary">Binary Search</option>
                  </>
                )}
              </select>
              
              <div className="flex gap-4 font-mono text-[10px] text-text-muted">
                <span>Compares: <strong className="text-white">{statsRight.comparisons}</strong></span>
                {raceCategory === 'sorting' && (
                  <span>Swaps: <strong className="text-brand-primary">{statsRight.swaps}</strong></span>
                )}
                <span>Clock: <strong className="text-brand-secondary">{statsRight.time}ms</strong></span>
              </div>
            </div>

            {/* Bars Area */}
            <div className="flex-1 flex items-end justify-center gap-1 md:gap-1.5 px-2 pb-2 mt-12 overflow-hidden h-[240px]">
              {arrayRight.map((val, idx) => {
                const max = Math.max(...arrayRight) || 1;
                const pct = `${(val / max) * 80 + 10}%`;
                return (
                  <div
                    key={idx}
                    className="flex flex-col items-center justify-end h-full flex-1 group relative"
                  >
                    <span 
                      style={{ 
                        bottom: `calc(${pct} + 2px)`,
                        transform: arraySize <= 25 ? 'translateX(-50%)' : 'translateX(-50%) rotate(-90deg) translateY(-2px)',
                        transformOrigin: 'left center'
                      }}
                      className={`absolute left-1/2 font-mono font-bold text-white select-none animate-fade-in transition-all z-10 ${
                        arraySize <= 25 ? 'text-[8px] opacity-85' : 'text-[6px] opacity-70 whitespace-nowrap'
                      }`}
                    >
                      {val}
                    </span>

                    <div
                      style={{ height: pct }}
                      className={`w-full rounded-t-sm bg-gradient-to-t transition-all duration-300 ${getBarColorRight(idx)}`}
                    />
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Buttons Trigger Block */}
        <div className="flex flex-col md:flex-row items-center gap-4 bg-white/5 border border-white/5 p-6 rounded-3xl justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white">Begin Concurrent Race solver</span>
            <span className="text-[10px] text-text-muted font-mono mt-0.5">
              Tracks asynchronous loops to benchmark step counts and milliseconds
            </span>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={startRace}
              disabled={isPlaying || raceFinished}
              className="glow-btn flex-1 md:flex-initial px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-black font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-brand-glow text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Zap className="w-4 h-4 fill-black text-black" />
              Start Race!
            </button>
            <button
              onClick={generateSharedArray}
              className="px-5 py-3.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 text-white cursor-pointer transition-all"
              title="Shuffle Shared Arrays"
            >
              <RotateCcw className="w-5 h-5 text-brand-primary" />
            </button>
          </div>
        </div>
      </div>

      {/* WINNER BANNER OVERLAY MODAL */}
      {raceFinished && winnerDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-filter backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="glass-panel max-w-lg w-full rounded-3xl p-8 border border-brand-primary/30 relative text-center bg-gradient-to-b from-bg-secondary to-bg-primary shadow-2xl">
            <div className="w-20 h-20 rounded-full bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-brand-glow animate-pulse">
              <Trophy className="w-10 h-10 text-brand-primary" />
            </div>

            <h3 className="text-3xl font-black text-white leading-none">
              {winnerDetails.winner} Wins!
            </h3>
            
            <p className="text-brand-primary font-mono text-[10px] tracking-widest uppercase font-bold mt-2">
              ALGORITHM SOLVED SUCCESSFULLY
            </p>

            <p className="text-text-muted mt-4 text-sm leading-relaxed">
              {winnerDetails.desc}
            </p>

            {/* Benchmark stats comparison */}
            <div className="grid grid-cols-2 gap-4 mt-6 bg-black/30 border border-white/5 p-4 rounded-2xl text-xs font-mono text-left">
              <div>
                <span className="text-[10px] text-text-muted font-bold block mb-1">LEFT SOLVER</span>
                <span className="text-white block font-bold">Time: {statsLeft.time}ms</span>
                <span className="text-text-muted block">Compares: {statsLeft.comparisons}</span>
                <span className="text-text-muted block">Swaps: {statsLeft.swaps}</span>
              </div>
              <div className="border-l border-white/5 pl-4">
                <span className="text-[10px] text-text-muted font-bold block mb-1">RIGHT SOLVER</span>
                <span className="text-white block font-bold">Time: {statsRight.time}ms</span>
                <span className="text-text-muted block">Compares: {statsRight.comparisons}</span>
                <span className="text-text-muted block">Swaps: {statsRight.swaps}</span>
              </div>
            </div>

            <button
              onClick={generateSharedArray}
              className="mt-6 w-full py-3.5 px-6 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 text-xs font-bold font-mono tracking-wider uppercase cursor-pointer transition-all"
            >
              Reset Race Panel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
