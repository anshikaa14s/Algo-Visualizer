import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database, 
  ArrowRight, 
  Plus, 
  Trash2, 
  ArrowDown, 
  ArrowUp 
} from 'lucide-react';

export function DataStructures() {
  const [activeTab, setActiveTab] = useState('stack'); // stack, queue, linkedlist
  
  // States for each DS
  const [stack, setStack] = useState([45, 12, 89]);
  const [queue, setQueue] = useState([23, 76, 54, 91]);
  const [linkedList, setLinkedList] = useState([
    { id: 1, val: 34 },
    { id: 2, val: 82 },
    { id: 3, val: 57 }
  ]);

  // Operational states
  const [nodeValue, setNodeValue] = useState(50);
  const [insertIndex, setInsertIndex] = useState(1);
  const [customInput, setCustomInput] = useState('');
  const [infoDesc, setInfoDesc] = useState("Perform operations to see data structures manipulate pointers.");

  // STACK OPERATIONS
  const pushStack = () => {
    if (stack.length >= 6) {
      setInfoDesc("Stack Overflow! The stack has reached its maximum visual limit (6 elements).");
      return;
    }
    const val = nodeValue || Math.floor(Math.random() * 90) + 10;
    setStack([val, ...stack]);
    setInfoDesc(`Pushed ${val} onto the top of the stack.`);
  };

  const popStack = () => {
    if (stack.length === 0) {
      setInfoDesc("Stack Underflow! The stack is completely empty.");
      return;
    }
    const val = stack[0];
    setStack(stack.slice(1));
    setInfoDesc(`Popped ${val} off the top of the stack.`);
  };

  // QUEUE OPERATIONS
  const enqueueQueue = () => {
    if (queue.length >= 6) {
      setInfoDesc("Queue Overflow! The queue has reached its maximum visual limit (6 elements).");
      return;
    }
    const val = nodeValue || Math.floor(Math.random() * 90) + 10;
    setQueue([...queue, val]);
    setInfoDesc(`Enqueued ${val} at the Rear pointer of the queue.`);
  };

  const dequeueQueue = () => {
    if (queue.length === 0) {
      setInfoDesc("Queue Underflow! The queue is completely empty.");
      return;
    }
    const val = queue[0];
    setQueue(queue.slice(1));
    setInfoDesc(`Dequeued ${val} from the Front pointer of the queue. All remaining nodes shift left.`);
  };

  // LINKED LIST OPERATIONS
  const insertHeadList = () => {
    if (linkedList.length >= 6) {
      setInfoDesc("Linked List visual limit reached!");
      return;
    }
    const val = nodeValue || Math.floor(Math.random() * 90) + 10;
    const newNode = { id: Date.now(), val: val };
    setLinkedList([newNode, ...linkedList]);
    setInfoDesc(`Inserted head node ${val}. Split pointer redirects from null to this new node.`);
  };

  const insertTailList = () => {
    if (linkedList.length >= 6) {
      setInfoDesc("Linked List visual limit reached!");
      return;
    }
    const val = nodeValue || Math.floor(Math.random() * 90) + 10;
    const newNode = { id: Date.now(), val: val };
    setLinkedList([...linkedList, newNode]);
    setInfoDesc(`Inserted tail node ${val}. Old tail next pointer redirected to this node.`);
  };

  const deleteHeadList = () => {
    if (linkedList.length === 0) {
      setInfoDesc("List is already empty!");
      return;
    }
    const removedVal = linkedList[0].val;
    setLinkedList(linkedList.slice(1));
    setInfoDesc(`Removed head node ${removedVal}. Head pointer shifts to next node.`);
  };

  const deleteTailList = () => {
    if (linkedList.length === 0) {
      setInfoDesc("List is already empty!");
      return;
    }
    const removedVal = linkedList[linkedList.length - 1].val;
    setLinkedList(linkedList.slice(0, -1));
    setInfoDesc(`Removed tail node ${removedVal}. Previous node next pointer redirects to null.`);
  };

  return (
    <div className="flex-1 overflow-y-auto px-8 py-8 relative z-10 grid-bg-overlay flex flex-col justify-between">
      <div>
        {/* Header Title */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
              <Database className="w-8 h-8 text-brand-primary" />
              Data Structure Visualizer
            </h1>
            <p className="text-text-muted text-xs font-mono mt-1">
              Visualize LIFO stack frames, FIFO queue shifts, and linked nodes pointer arrows
            </p>
          </div>

          {/* Sub-tab selection */}
          <div className="flex gap-1.5 bg-white/5 border border-white/5 p-1 rounded-2xl">
            <button
              onClick={() => { setActiveTab('stack'); setInfoDesc("Interactive Stack: Elements push and pop from the top."); }}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                activeTab === 'stack' ? 'bg-brand-primary text-black' : 'text-text-muted hover:text-white'
              }`}
            >
              Stack
            </button>
            <button
              onClick={() => { setActiveTab('queue'); setInfoDesc("Interactive Queue: Elements enqueue at rear, dequeue from front."); }}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                activeTab === 'queue' ? 'bg-brand-primary text-black' : 'text-text-muted hover:text-white'
              }`}
            >
              Queue
            </button>
            <button
              onClick={() => { setActiveTab('linkedlist'); setInfoDesc("Interactive Linked List: Insert and remove node elements."); }}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                activeTab === 'linkedlist' ? 'bg-brand-primary text-black' : 'text-text-muted hover:text-white'
              }`}
            >
              Linked List
            </button>
          </div>
        </div>

        {/* Sandbox Canvas Visualizer Frame */}
        <div className="glass-panel p-8 rounded-3xl border border-white/5 relative shadow-2xl bg-black/25 flex flex-col items-center justify-center min-h-[380px] mb-8">
          
          {/* 1. STACK CANVAS */}
          {activeTab === 'stack' && (
            <div className="flex flex-col items-center w-full max-w-sm">
              <span className="text-xs font-mono text-text-muted mb-4 block">STACK CONTAINER (LIFO)</span>
              
              {/* Vertical Stack Glass Tubing */}
              <div className="w-56 h-[260px] border-b-4 border-x-4 border-white/10 rounded-b-2xl flex flex-col justify-end p-3 gap-2 relative bg-black/20">
                <AnimatePresence initial={false}>
                  {stack.map((val, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ y: -200, opacity: 0, scale: 0.8 }}
                      animate={{ y: 0, opacity: 1, scale: 1 }}
                      exit={{ y: -150, opacity: 0, scale: 0.8 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                      className={`w-full py-3.5 px-4 rounded-xl border flex items-center justify-between text-white font-mono text-sm relative ${
                        idx === 0
                          ? 'bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 border-brand-primary/60 shadow-lg shadow-brand-glow'
                          : 'bg-white/5 border-white/10'
                      }`}
                    >
                      <span>Value: <strong className="text-brand-primary">{val}</strong></span>
                      {idx === 0 ? (
                        <span className="text-[10px] font-bold bg-brand-primary text-black px-2 py-0.5 rounded-md flex items-center gap-1">
                          <ArrowDown className="w-3 h-3" /> TOP
                        </span>
                      ) : (
                        <span className="text-[10px] opacity-35">idx: {stack.length - 1 - idx}</span>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {stack.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-mono text-text-muted">
                    Empty Stack
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. QUEUE CANVAS */}
          {activeTab === 'queue' && (
            <div className="flex flex-col items-center w-full max-w-2xl justify-center">
              <span className="text-xs font-mono text-text-muted mb-6 block">QUEUE TUBE CONTAINER (FIFO)</span>
              
              <div className="w-full border-y border-white/10 h-24 flex items-center p-4 gap-3 bg-black/20 rounded-xl relative justify-start">
                <AnimatePresence initial={false}>
                  {queue.map((val, idx) => (
                    <motion.div
                      key={idx}
                      layout
                      initial={{ x: 200, opacity: 0, scale: 0.8 }}
                      animate={{ x: 0, opacity: 1, scale: 1 }}
                      exit={{ x: -200, opacity: 0, scale: 0.8 }}
                      transition={{ type: 'spring', stiffness: 220, damping: 20 }}
                      className={`w-28 py-3.5 px-3 rounded-xl border flex flex-col items-center justify-center text-white font-mono text-sm relative ${
                        idx === 0 
                          ? 'bg-gradient-to-r from-brand-primary/10 to-brand-primary/5 border-brand-primary/60'
                          : idx === queue.length - 1
                          ? 'bg-gradient-to-r from-brand-secondary/10 to-brand-secondary/5 border-brand-secondary/60'
                          : 'bg-white/5 border-white/10'
                      }`}
                    >
                      <span className="font-bold text-brand-primary text-base">{val}</span>
                      
                      {/* Queue pointer text */}
                      {idx === 0 && (
                        <span className="text-[9px] font-bold text-brand-primary uppercase mt-1">FRONT</span>
                      )}
                      {idx === queue.length - 1 && idx !== 0 && (
                        <span className="text-[9px] font-bold text-brand-secondary uppercase mt-1">REAR</span>
                      )}
                      {idx !== 0 && idx !== queue.length - 1 && (
                        <span className="text-[9px] opacity-40 mt-1">idx: {idx}</span>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {queue.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-mono text-text-muted">
                    Empty Queue
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. LINKED LIST CANVAS */}
          {activeTab === 'linkedlist' && (
            <div className="flex flex-col items-center w-full max-w-4xl justify-center">
              <span className="text-xs font-mono text-text-muted mb-6 block">SINGLY LINKED LIST (POINTER CHAINS)</span>
              
              <div className="flex flex-wrap items-center justify-center gap-y-6 py-6 px-4 bg-black/10 rounded-2xl w-full">
                <div className="text-xs font-mono text-brand-primary font-bold mr-2 border border-brand-primary/20 px-2.5 py-1 rounded bg-brand-primary/5">
                  HEAD
                </div>
                
                <AnimatePresence initial={false}>
                  {linkedList.map((node, idx) => (
                    <div key={node.id} className="flex items-center">
                      <motion.div
                        layout
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        className="bg-bg-secondary border border-white/10 rounded-2xl p-3 w-28 flex flex-col font-mono text-xs items-center gap-1 shadow-md"
                      >
                        <span className="text-[10px] opacity-40">node_{idx}</span>
                        <div className="text-sm font-bold text-white bg-white/5 w-full text-center py-1.5 rounded-lg border border-white/5">
                          {node.val}
                        </div>
                        <div className="flex justify-between w-full text-[9px] opacity-50 border-t border-white/5 pt-1 mt-1">
                          <span>val</span>
                          <span>next</span>
                        </div>
                      </motion.div>

                      {/* animated SVG pointer arrow connector */}
                      {idx < linkedList.length - 1 && (
                        <div className="w-12 h-6 flex items-center justify-center overflow-hidden">
                          <svg className="w-full h-2 text-brand-primary" viewBox="0 0 100 10" preserveAspectRatio="none">
                            <line x1="0" y1="5" x2="90" y2="5" stroke="currentColor" strokeWidth="2" strokeDasharray="4 2" className="animate-pulse" />
                            <polygon points="90,1 98,5 90,9" fill="currentColor" />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                </AnimatePresence>
                
                <div className="w-10 h-6 flex items-center justify-center overflow-hidden">
                  <svg className="w-full h-2 text-brand-secondary opacity-50" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <line x1="0" y1="5" x2="90" y2="5" stroke="currentColor" strokeWidth="2" />
                    <polygon points="90,1 98,5 90,9" fill="currentColor" />
                  </svg>
                </div>

                <div className="text-xs font-mono text-text-muted border border-white/5 px-2.5 py-1 rounded bg-white/5">
                  NULL
                </div>

                {linkedList.length === 0 && (
                  <div className="w-full text-center text-xs font-mono text-text-muted mt-4">
                    Empty Linked List
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Dynamic controls and operations */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Operation controllers */}
          <div className="md:col-span-4 flex flex-col gap-4">
            <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-black/15 space-y-4">
              <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider font-semibold block">Operation Panel</span>
              
              {/* Input values */}
              <div className="flex flex-col">
                <label className="text-[10px] text-text-muted font-mono uppercase">Node Value</label>
                <input
                  type="number"
                  value={nodeValue}
                  onChange={(e) => setNodeValue(Math.min(99, Math.max(1, Number(e.target.value))))}
                  className="bg-bg-secondary border border-white/5 px-3 py-2 rounded-xl text-white font-mono text-sm mt-1 focus:outline-none focus:border-brand-primary"
                />
              </div>

              {/* Custom list input */}
              <div className="flex flex-col">
                <label className="text-[10px] text-text-muted font-mono uppercase">Custom Sequence Input</label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    placeholder="e.g. 12, 45, 67, 34"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    className="flex-1 bg-bg-secondary border border-white/5 px-3 py-2 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-brand-primary"
                  />
                  <button
                    onClick={() => {
                      if (!customInput) return;
                      const parsed = customInput.split(',').map(x => parseInt(x.trim(), 10)).filter(x => !isNaN(x));
                      if (parsed.length > 0) {
                        const limited = parsed.slice(0, 6);
                        if (activeTab === 'stack') {
                          setStack(limited);
                          setInfoDesc(`Set stack with custom values: ${limited.join(', ')}.`);
                        } else if (activeTab === 'queue') {
                          setQueue(limited);
                          setInfoDesc(`Set queue with custom values: ${limited.join(', ')}.`);
                        } else if (activeTab === 'linkedlist') {
                          setLinkedList(limited.map((val, idx) => ({ id: Date.now() + idx, val })));
                          setInfoDesc(`Set linked list with custom values: ${limited.join(', ')}.`);
                        }
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-brand-primary text-black font-bold text-xs cursor-pointer hover:bg-brand-primary/80 transition-colors"
                  >
                    Set
                  </button>
                </div>
              </div>

              {/* Action buttons stack */}
              <div className="space-y-3 pt-2">
                {activeTab === 'stack' && (
                  <>
                    <button
                      onClick={pushStack}
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-black font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-brand-glow text-sm"
                    >
                      <Plus className="w-4 h-4" /> Push Top
                    </button>
                    <button
                      onClick={popStack}
                      className="w-full py-3.5 px-4 rounded-xl border border-white/10 hover:border-rose-500/40 hover:bg-rose-500/5 text-white font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer bg-white/5 text-sm"
                    >
                      <Trash2 className="w-4 h-4 text-rose-500" /> Pop Top
                    </button>
                  </>
                )}

                {activeTab === 'queue' && (
                  <>
                    <button
                      onClick={enqueueQueue}
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-black font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-brand-glow text-sm"
                    >
                      <Plus className="w-4 h-4" /> Enqueue Rear
                    </button>
                    <button
                      onClick={dequeueQueue}
                      className="w-full py-3.5 px-4 rounded-xl border border-white/10 hover:border-rose-500/40 hover:bg-rose-500/5 text-white font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer bg-white/5 text-sm"
                    >
                      <Trash2 className="w-4 h-4 text-rose-500" /> Dequeue Front
                    </button>
                  </>
                )}

                {activeTab === 'linkedlist' && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={insertHeadList}
                      className="py-3 px-3 rounded-xl border border-white/5 bg-white/5 hover:border-brand-primary/30 text-white text-xs font-semibold cursor-pointer text-center"
                    >
                      Insert Head
                    </button>
                    <button
                      onClick={insertTailList}
                      className="py-3 px-3 rounded-xl border border-white/5 bg-white/5 hover:border-brand-primary/30 text-white text-xs font-semibold cursor-pointer text-center"
                    >
                      Insert Tail
                    </button>
                    <button
                      onClick={deleteHeadList}
                      className="py-3 px-3 rounded-xl border border-white/5 bg-white/5 hover:border-rose-500/30 text-rose-500/80 text-xs font-semibold cursor-pointer text-center"
                    >
                      Delete Head
                    </button>
                    <button
                      onClick={deleteTailList}
                      className="py-3 px-3 rounded-xl border border-white/5 bg-white/5 hover:border-rose-500/30 text-rose-500/80 text-xs font-semibold cursor-pointer text-center"
                    >
                      Delete Tail
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AI Explanation and notes */}
          <div className="md:col-span-8 flex flex-col gap-6">
            <div className="glass-panel rounded-2xl p-6 border border-brand-primary/20 bg-gradient-to-tr from-brand-primary/5 to-transparent relative shadow-xl">
              <div className="absolute top-4 right-4 text-[10px] font-mono text-brand-primary border border-brand-primary/30 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                AI Explanation Panel
              </div>
              <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider font-semibold block mb-3">Data Operations Analyzer</span>
              <p className="text-white leading-relaxed text-sm font-sans pr-24">
                "{infoDesc}"
              </p>
            </div>

            {/* Structured guidelines */}
            <div className="glass-panel rounded-2xl p-6 border border-white/5 bg-black/15">
              <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider font-semibold block mb-3">Structured Operations Guidelines</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs leading-relaxed font-sans text-text-muted">
                <div>
                  <h4 className="font-bold text-white mb-2 uppercase text-[10px] tracking-wide text-brand-primary">Stack LIFO</h4>
                  Elements push and pop exclusively from the top. Stack pointer highlights the current active node. Replicates local variable stacks.
                </div>
                <div>
                  <h4 className="font-bold text-white mb-2 uppercase text-[10px] tracking-wide text-brand-secondary">Queue FIFO</h4>
                  Nodes join rear, shift left, and exit front. Matches message passing architectures, buffered pipelines, and job schedulers.
                </div>
                <div>
                  <h4 className="font-bold text-white mb-2 uppercase text-[10px] tracking-wide text-cyan-400">Linked Chains</h4>
                  Addresses contain value and pointer properties. Pointers redirect recursively during deletion or head insertion.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
