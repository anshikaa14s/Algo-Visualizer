import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, 
  RotateCcw, 
  Plus, 
  Trash2, 
  HelpCircle, 
  Search, 
  Database,
  ChevronRight,
  Cpu,
  Layers,
  Network
} from 'lucide-react';
import { useAudioSynth } from '../hooks/useAudioSynth';
import { ShinyText } from '../components/common/ShinyText';

// BST Node helper
const createNode = (val) => ({
  value: val,
  left: null,
  right: null,
  status: 'normal', // normal, active, visited, target
  x: 0,
  y: 0
});

// Recursively calculates node coordinates for visual rendering
const calculateLayout = (node, x = 350, y = 60, level = 0, spacingX = 140, spacingY = 65) => {
  if (!node) return null;
  node.x = x;
  node.y = y;
  
  if (node.left) {
    calculateLayout(node.left, x - spacingX / Math.pow(1.4, level), y + spacingY, level + 1, spacingX, spacingY);
  }
  if (node.right) {
    calculateLayout(node.right, x + spacingX / Math.pow(1.4, level), y + spacingY, level + 1, spacingX, spacingY);
  }
  return node;
};

// Deep clones a tree
const cloneTree = (node) => {
  if (!node) return null;
  return {
    value: node.value,
    left: cloneTree(node.left),
    right: cloneTree(node.right),
    status: node.status || 'normal',
    x: node.x,
    y: node.y
  };
};

// Calculate maximum height/depth of tree
const getTreeDepth = (node) => {
  if (!node) return 0;
  return 1 + Math.max(getTreeDepth(node.left), getTreeDepth(node.right));
};

// Flattens tree into list of nodes and links for easy SVG rendering
const flattenTree = (node, list = [], parent = null) => {
  if (!node) return list;
  list.push({
    value: node.value,
    x: node.x,
    y: node.y,
    status: node.status,
    parentId: parent ? parent.value : null,
    parentX: parent ? parent.x : null,
    parentY: parent ? parent.y : null
  });
  flattenTree(node.left, list, node);
  flattenTree(node.right, list, node);
  return list;
};

export function TreePage() {
  const [treeRoot, setTreeRoot] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [traversalType, setTraversalType] = useState('preorder'); // preorder, inorder, postorder
  const [speed, setSpeed] = useState(700); // ms per step
  const [codeLine, setCodeLine] = useState(0);
  const [infoDesc, setInfoDesc] = useState("Insert numbers (1-99) into the BST, select a traversal type, and press 'Run Traversal'!");
  const [stepLog, setStepLog] = useState(["Workspace initialized. Ready for operations."]);
  const [traversalOutput, setTraversalOutput] = useState([]);
  
  const { soundEnabled, playTone } = useAudioSynth();
  const speedRef = useRef(speed);
  const timeoutsRef = useRef([]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

  useEffect(() => {
    generatePreset();
    return () => clearAllTimeouts();
  }, []);

  const resetNodeStatus = (node) => {
    if (!node) return;
    node.status = 'normal';
    resetNodeStatus(node.left);
    resetNodeStatus(node.right);
  };

  const handleResetVisuals = () => {
    clearAllTimeouts();
    setIsPlaying(false);
    setCodeLine(0);
    setTraversalOutput([]);
    setInfoDesc("Tree visuals reset to standard states.");
    
    if (treeRoot) {
      const rootCopy = cloneTree(treeRoot);
      resetNodeStatus(rootCopy);
      calculateLayout(rootCopy);
      setTreeRoot(rootCopy);
    }
  };

  const generatePreset = () => {
    clearAllTimeouts();
    setIsPlaying(false);
    setCodeLine(0);
    setTraversalOutput([]);

    // Balanced tree inserting: 50, 25, 75, 12, 35, 60, 88
    let root = createNode(50);
    const inserts = [25, 75, 12, 35, 60, 88];
    
    const insertBST = (currNode, val) => {
      if (!currNode) return createNode(val);
      if (val < currNode.value) {
        currNode.left = insertBST(currNode.left, val);
      } else if (val > currNode.value) {
        currNode.right = insertBST(currNode.right, val);
      }
      return currNode;
    };

    inserts.forEach(val => {
      root = insertBST(root, val);
    });

    calculateLayout(root);
    setTreeRoot(root);
    setInfoDesc("Loaded balanced Binary Search Tree preset.");
    setStepLog(["Tree preset loaded. Ready for traversal."]);
  };

  // BST operations with path tracking animations
  const handleInsert = () => {
    const val = parseInt(inputValue);
    if (isNaN(val) || val < 1 || val > 99) {
      setInfoDesc("⚠️ Please enter a valid integer between 1 and 99.");
      return;
    }

    // Check if duplicate
    const checkDuplicate = (node) => {
      if (!node) return false;
      if (val === node.value) return true;
      return val < node.value ? checkDuplicate(node.left) : checkDuplicate(node.right);
    };
    if (checkDuplicate(treeRoot)) {
      setInfoDesc("⚠️ Value already exists in the BST!");
      return;
    }

    // Check depth
    const rootCloneForDepth = cloneTree(treeRoot);
    const insertBSTHelper = (currNode, value) => {
      if (!currNode) return createNode(value);
      if (value < currNode.value) {
        currNode.left = insertBSTHelper(currNode.left, value);
      } else if (value > currNode.value) {
        currNode.right = insertBSTHelper(currNode.right, value);
      }
      return currNode;
    };
    const testNode = insertBSTHelper(rootCloneForDepth, val);
    if (getTreeDepth(testNode) > 5) {
      setInfoDesc("⚠️ Tree depth limit exceeded (max 5 levels)! Please keep the tree balanced.");
      return;
    }

    handleResetVisuals();
    setIsPlaying(true);
    setInfoDesc(`Finding insertion point for node ${val}...`);

    // Trace the path of insertion
    const insertPath = [];
    const getInsertPath = (node) => {
      if (!node) return;
      insertPath.push(node.value);
      if (val < node.value) {
        if (!node.left) return;
        getInsertPath(node.left);
      } else if (val > node.value) {
        if (!node.right) return;
        getInsertPath(node.right);
      }
    };
    getInsertPath(treeRoot);

    const animateInsertion = (pathIndex = 0) => {
      if (pathIndex === insertPath.length) {
        // Perform final insertion
        const rootClone = cloneTree(treeRoot);
        const res = insertBSTHelper(rootClone, val);
        calculateLayout(res);
        
        // Reset status for all except the newly inserted node
        const resetNodeStatus = (n) => {
          if (!n) return;
          n.status = n.value === val ? 'target' : 'normal';
          resetNodeStatus(n.left);
          resetNodeStatus(n.right);
        };
        resetNodeStatus(res);

        setTreeRoot(res);
        setIsPlaying(false);
        setInputValue('');
        setInfoDesc(`🎉 Successfully inserted node ${val} at its correct position.`);
        setStepLog(prev => [...prev, `Inserted Node ${val}`]);
        return;
      }

      const tId = setTimeout(() => {
        const currentInspectVal = insertPath[pathIndex];
        
        setTreeRoot(prev => {
          const rootCopy = cloneTree(prev);
          const updateStatus = (n) => {
            if (!n) return;
            if (n.value === currentInspectVal) {
              n.status = 'active';
            } else if (insertPath.slice(0, pathIndex).includes(n.value)) {
              n.status = 'visited';
            } else {
              n.status = 'normal';
            }
            updateStatus(n.left);
            updateStatus(n.right);
          };
          updateStatus(rootCopy);
          return rootCopy;
        });

        playTone(currentInspectVal, 100);
        setStepLog(prev => [
          ...prev, 
          `Compare ${val} with Node ${currentInspectVal}: ${val} ${val < currentInspectVal ? '<' : '>'} ${currentInspectVal}. Go ${val < currentInspectVal ? 'Left ↙' : 'Right ↘'}`
        ]);
        animateInsertion(pathIndex + 1);
      }, speedRef.current);
      timeoutsRef.current.push(tId);
    };

    if (insertPath.length > 0) {
      animateInsertion(0);
    } else {
      // Tree is empty, insert root immediately
      const newRoot = createNode(val);
      calculateLayout(newRoot);
      setTreeRoot(newRoot);
      setInputValue('');
      setInfoDesc(`🎉 Successfully inserted node ${val} as the root node.`);
      setIsPlaying(false);
    }
  };

  const handleDelete = () => {
    const val = parseInt(inputValue);
    if (isNaN(val)) {
      setInfoDesc("⚠️ Please enter a valid number to delete.");
      return;
    }

    // Check if node exists
    const checkExists = (node) => {
      if (!node) return false;
      if (val === node.value) return true;
      return val < node.value ? checkExists(node.left) : checkExists(node.right);
    };

    if (!checkExists(treeRoot)) {
      setInfoDesc(`⚠️ Node ${val} does not exist in the BST.`);
      return;
    }

    handleResetVisuals();
    setIsPlaying(true);
    setInfoDesc(`Finding node ${val} to delete...`);

    // Trace path to target node
    const deletePath = [];
    const getDeletePath = (node) => {
      if (!node) return;
      deletePath.push(node.value);
      if (val === node.value) return;
      if (val < node.value) getDeletePath(node.left);
      else getDeletePath(node.right);
    };
    getDeletePath(treeRoot);

    const animateDeletion = (pathIndex = 0) => {
      if (pathIndex === deletePath.length) {
        // Node found, execute actual deletion
        const rootClone = cloneTree(treeRoot);
        
        const deleteHelper = (currNode, value) => {
          if (!currNode) return null;
          if (value < currNode.value) {
            currNode.left = deleteHelper(currNode.left, value);
          } else if (value > currNode.value) {
            currNode.right = deleteHelper(currNode.right, value);
          } else {
            // Node found
            if (!currNode.left) return currNode.right;
            if (!currNode.right) return currNode.left;
            
            // successor selection
            let successor = currNode.right;
            while (successor.left) {
              successor = successor.left;
            }
            currNode.value = successor.value;
            currNode.right = deleteHelper(currNode.right, successor.value);
          }
          return currNode;
        };

        const newRoot = deleteHelper(rootClone, val);
        calculateLayout(newRoot);
        
        // Reset statuses
        const resetNodeStatus = (n) => {
          if (!n) return;
          n.status = 'normal';
          resetNodeStatus(n.left);
          resetNodeStatus(n.right);
        };
        resetNodeStatus(newRoot);

        setTreeRoot(newRoot);
        setIsPlaying(false);
        setInputValue('');
        setInfoDesc(`🎉 Successfully deleted node ${val} from the BST.`);
        setStepLog(prev => [...prev, `Deleted Node ${val}`]);
        return;
      }

      const tId = setTimeout(() => {
        const currentInspectVal = deletePath[pathIndex];
        const isTargetNode = currentInspectVal === val;

        setTreeRoot(prev => {
          const rootCopy = cloneTree(prev);
          const updateStatus = (n) => {
            if (!n) return;
            if (n.value === currentInspectVal) {
              n.status = isTargetNode ? 'target' : 'active';
            } else if (deletePath.slice(0, pathIndex).includes(n.value)) {
              n.status = 'visited';
            } else {
              n.status = 'normal';
            }
            updateStatus(n.left);
            updateStatus(n.right);
          };
          updateStatus(rootCopy);
          return rootCopy;
        });

        playTone(currentInspectVal, 100);
        setStepLog(prev => [
          ...prev, 
          isTargetNode 
            ? `Found target Node ${val} for deletion!` 
            : `Inspecting Node ${currentInspectVal}... comparing with ${val}... Go ${val < currentInspectVal ? 'Left ↙' : 'Right ↘'}`
        ]);
        animateDeletion(pathIndex + 1);
      }, speedRef.current);
      timeoutsRef.current.push(tId);
    };

    if (deletePath.length > 0) {
      animateDeletion(0);
    }
  };

  const handleSearch = () => {
    const val = parseInt(inputValue);
    if (isNaN(val)) {
      setInfoDesc("⚠️ Please enter a number to search.");
      return;
    }

    handleResetVisuals();
    setIsPlaying(true);
    setInfoDesc(`Searching for node ${val} in the BST...`);
    
    const searchPath = [];
    const traverse = (node) => {
      if (!node) return;
      searchPath.push(node.value);
      if (val === node.value) return;
      if (val < node.value) traverse(node.left);
      else traverse(node.right);
    };

    traverse(treeRoot);
    
    // Animate search path
    const animateSearch = (pathIndex = 0) => {
      if (pathIndex === searchPath.length) {
        setIsPlaying(false);
        const lastVal = searchPath[searchPath.length - 1];
        if (lastVal === val) {
          setInfoDesc(`🎉 Success! Node ${val} found in the tree.`);
        } else {
          setInfoDesc(`❌ Node ${val} was not found in the tree.`);
        }
        return;
      }

      const tId = setTimeout(() => {
        const currentSearchVal = searchPath[pathIndex];
        const isLastNode = pathIndex === searchPath.length - 1 && currentSearchVal === val;

        setTreeRoot(prev => {
          const rootCopy = cloneTree(prev);
          const updateStatus = (n) => {
            if (!n) return;
            if (n.value === currentSearchVal) {
              n.status = isLastNode ? 'target' : 'active';
            } else if (searchPath.slice(0, pathIndex).includes(n.value)) {
              n.status = 'visited';
            } else {
              n.status = 'normal';
            }
            updateStatus(n.left);
            updateStatus(n.right);
          };
          updateStatus(rootCopy);
          return rootCopy;
        });

        playTone(currentSearchVal, 100);
        setStepLog(prev => [
          ...prev, 
          isLastNode 
            ? `Target Node ${val} found!` 
            : `Comparing ${val} with Node ${currentSearchVal}... Go ${val < currentSearchVal ? 'Left ↙' : 'Right ↘'}`
        ]);
        animateSearch(pathIndex + 1);
      }, speedRef.current);
      timeoutsRef.current.push(tId);
    };

    if (searchPath.length > 0) {
      animateSearch(0);
    } else {
      setIsPlaying(false);
      setInfoDesc("⚠️ Tree is empty!");
    }
  };

  // Traversal animations helper
  const handleStartTraversal = () => {
    if (!treeRoot) {
      setInfoDesc("⚠️ Please insert nodes into the tree first.");
      return;
    }

    handleResetVisuals();
    setIsPlaying(true);
    setInfoDesc(`Running ${traversalType.toUpperCase()} traversal...`);

    const steps = []; // Array of { nodeValue, action, codeLine, desc }
    
    const getPreorderSteps = (node) => {
      if (!node) return;
      steps.push({ nodeValue: node.value, action: 'visit', codeLine: 3, desc: `Visit node ${node.value} (Root)` });
      if (node.left) {
        steps.push({ nodeValue: node.value, action: 'traverse-left', codeLine: 4, desc: `Go to left child of ${node.value}` });
        getPreorderSteps(node.left);
      }
      if (node.right) {
        steps.push({ nodeValue: node.value, action: 'traverse-right', codeLine: 5, desc: `Go to right child of ${node.value}` });
        getPreorderSteps(node.right);
      }
      steps.push({ nodeValue: node.value, action: 'backtrack', codeLine: 6, desc: `Backtrack from node ${node.value}` });
    };

    const getInorderSteps = (node) => {
      if (!node) return;
      if (node.left) {
        steps.push({ nodeValue: node.value, action: 'traverse-left', codeLine: 3, desc: `Traverse left subtree of ${node.value}` });
        getInorderSteps(node.left);
      }
      steps.push({ nodeValue: node.value, action: 'visit', codeLine: 4, desc: `Visit node ${node.value} (Root/Current)` });
      if (node.right) {
        steps.push({ nodeValue: node.value, action: 'traverse-right', codeLine: 5, desc: `Traverse right subtree of ${node.value}` });
        getInorderSteps(node.right);
      }
      steps.push({ nodeValue: node.value, action: 'backtrack', codeLine: 6, desc: `Backtrack from node ${node.value}` });
    };

    const getPostorderSteps = (node) => {
      if (!node) return;
      if (node.left) {
        steps.push({ nodeValue: node.value, action: 'traverse-left', codeLine: 3, desc: `Traverse left subtree of ${node.value}` });
        getPostorderSteps(node.left);
      }
      if (node.right) {
        steps.push({ nodeValue: node.value, action: 'traverse-right', codeLine: 4, desc: `Traverse right subtree of ${node.value}` });
        getPostorderSteps(node.right);
      }
      steps.push({ nodeValue: node.value, action: 'visit', codeLine: 5, desc: `Visit node ${node.value}` });
      steps.push({ nodeValue: node.value, action: 'backtrack', codeLine: 6, desc: `Backtrack from node ${node.value}` });
    };

    if (traversalType === 'preorder') getPreorderSteps(treeRoot);
    else if (traversalType === 'inorder') getInorderSteps(treeRoot);
    else getPostorderSteps(treeRoot);

    const animateTraversal = (stepIdx = 0, visitedArr = []) => {
      if (stepIdx === steps.length) {
        setIsPlaying(false);
        setCodeLine(0);
        setInfoDesc(`Successfully completed ${traversalType.toUpperCase()} traversal!`);
        return;
      }

      const tId = setTimeout(() => {
        const currentStep = steps[stepIdx];
        const { nodeValue, action, codeLine: line, desc } = currentStep;
        
        let nextVisited = [...visitedArr];
        if (action === 'visit' && !nextVisited.includes(nodeValue)) {
          nextVisited.push(nodeValue);
          setTraversalOutput(nextVisited);
          playTone(nodeValue, 100);
        }

        // Set visual status in tree nodes
        setTreeRoot(prev => {
          const rootCopy = cloneTree(prev);
          const updateStatus = (n) => {
            if (!n) return;
            if (n.value === nodeValue) {
              n.status = action === 'visit' ? 'active' : 'visited';
            } else if (nextVisited.includes(n.value)) {
              n.status = 'visited';
            } else {
              n.status = 'normal';
            }
            updateStatus(n.left);
            updateStatus(n.right);
          };
          updateStatus(rootCopy);
          return rootCopy;
        });

        setCodeLine(line);
        setInfoDesc(desc);
        setStepLog(prev => [...prev, desc]);

        animateTraversal(stepIdx + 1, nextVisited);
      }, speedRef.current);
      timeoutsRef.current.push(tId);
    };

    animateTraversal(0, []);
  };

  const codeSnippets = {
    preorder: [
      "function Preorder(node) {",
      "  if (node === null) return;",
      "  visit(node.value);",
      "  Preorder(node.left);",
      "  Preorder(node.right);",
      "}"
    ],
    inorder: [
      "function Inorder(node) {",
      "  if (node === null) return;",
      "  Inorder(node.left);",
      "  visit(node.value);",
      "  Inorder(node.right);",
      "}"
    ],
    postorder: [
      "function Postorder(node) {",
      "  if (node === null) return;",
      "  Postorder(node.left);",
      "  Postorder(node.right);",
      "  visit(node.value);",
      "}"
    ]
  };

  const complexities = {
    preorder: { time: "O(N)", space: "O(H)" },
    inorder: { time: "O(N)", space: "O(H)" },
    postorder: { time: "O(N)", space: "O(H)" }
  };

  const flattenedNodes = flattenTree(treeRoot);

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative z-10">
      {/* LEFT: BST Operations & Configuration Toolbar */}
      <div className="w-full lg:w-[420px] p-6 border-b lg:border-b-0 lg:border-r border-white/5 bg-black/10 flex flex-col gap-6 overflow-y-auto max-h-full no-scrollbar">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white leading-none">BST Operations Desk</h2>
            <span className="text-[10px] font-mono text-text-muted">Dynamic Node insertion and deletion</span>
          </div>
        </div>

        {/* Interactive Controls */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono font-bold text-text-muted uppercase">Node Manipulation</span>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="number"
                min="1"
                max="99"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isPlaying}
                placeholder="1-99"
                className="flex-1 bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-brand-primary/50 text-center font-mono font-bold"
              />
              <button
                onClick={handleInsert}
                disabled={isPlaying}
                className="px-3 py-2 rounded-xl bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary text-xs font-bold border border-brand-primary/25 cursor-pointer disabled:opacity-50"
              >
                Insert
              </button>
              <button
                onClick={handleDelete}
                disabled={isPlaying}
                className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold border border-rose-500/25 cursor-pointer disabled:opacity-50"
              >
                Delete
              </button>
              <button
                onClick={handleSearch}
                disabled={isPlaying}
                className="px-3 py-2 rounded-xl bg-brand-secondary/10 hover:bg-brand-secondary/20 text-brand-secondary text-xs font-bold border border-brand-secondary/25 cursor-pointer disabled:opacity-50"
              >
                Search
              </button>
            </div>
          </div>

          <div className="h-px bg-white/5 my-2" />

          {/* Select Traversal strategy */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-mono font-bold text-text-muted uppercase">Choose Traversal Type</span>
            <div className="grid grid-cols-3 gap-2">
              {['preorder', 'inorder', 'postorder'].map((type) => (
                <button
                  key={type}
                  onClick={() => { setTraversalType(type); handleResetVisuals(); }}
                  disabled={isPlaying}
                  className={`py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer border ${
                    traversalType === type
                      ? 'bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 border-brand-primary text-brand-primary shadow-inner'
                      : 'border-white/5 bg-white/5 text-text-muted hover:text-white disabled:opacity-50'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Execution Button */}
          <div className="flex items-center gap-3 pt-2">
            {!isPlaying ? (
              <button
                onClick={handleStartTraversal}
                disabled={!treeRoot}
                className="flex-1 glow-btn py-3 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-black text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-brand-glow"
              >
                <Play className="w-3.5 h-3.5 fill-black" />
                Run Traversal
              </button>
            ) : (
              <button
                onClick={handleResetVisuals}
                className="flex-1 py-3 rounded-xl border border-white/10 hover:border-brand-primary/40 text-white text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-all cursor-pointer bg-white/5"
              >
                <RotateCcw className="w-3.5 h-3.5 text-brand-primary" />
                Halt Solve
              </button>
            )}

            <button
              onClick={generatePreset}
              disabled={isPlaying}
              className="p-3 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-white cursor-pointer disabled:opacity-50"
              title="Load Balanced BST Preset"
            >
              <RotateCcw className="w-4 h-4 text-brand-primary" />
            </button>
          </div>

          {/* Speed selector */}
          <div className="flex items-center justify-between gap-2 border border-white/5 bg-black/30 rounded-xl px-3 py-2">
            <span className="text-[10px] font-mono font-semibold text-text-muted">Speed Delay: {speed}ms</span>
            <input
              type="range"
              min="200"
              max="1800"
              step="100"
              value={2000 - speed}
              onChange={(e) => setSpeed(2000 - parseInt(e.target.value))}
              className="w-24 accent-brand-primary h-1 rounded-lg bg-slate-700 appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Complexity Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-panel p-4 rounded-xl border border-white/5 text-center bg-black/15">
            <div className="flex items-center justify-center gap-1.5 text-text-muted text-[10px] font-mono font-bold uppercase mb-1">
              <Cpu className="w-3.5 h-3.5 text-brand-primary" />
              Time Complexity
            </div>
            <span className="text-lg font-bold tracking-tight text-white font-mono">
              {complexities[traversalType].time}
            </span>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-white/5 text-center bg-black/15">
            <div className="flex items-center justify-center gap-1.5 text-text-muted text-[10px] font-mono font-bold uppercase mb-1">
              <Database className="w-3.5 h-3.5 text-brand-secondary" />
              Space Complexity
            </div>
            <span className="text-lg font-bold tracking-tight text-white font-mono">
              {complexities[traversalType].space}
            </span>
          </div>
        </div>

        {/* Tree Traversal Pseudocode Display */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-black/15">
          <span className="text-[10px] font-mono font-bold text-text-muted uppercase mb-3 block">Structured Implementation Code</span>
          <div className="bg-black/40 border border-white/5 rounded-xl p-4 font-mono text-[10px] leading-relaxed overflow-hidden">
            {codeSnippets[traversalType].map((line, idx) => (
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

      {/* RIGHT: SVG Canvas & Logs/Output */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden relative bg-black/10">
        {/* Instruction Header */}
        <div className="absolute top-10 left-10 flex items-center gap-2 bg-black/60 px-3 py-2 rounded-xl border border-white/5 text-[10px] text-text-muted font-mono z-10 pointer-events-none">
          <HelpCircle className="w-3.5 h-3.5 text-brand-primary animate-pulse" />
          <span>Nodes values in BST: Left Subtree &lt; Root &lt; Right Subtree. Max depth is 5 levels.</span>
        </div>

        {/* SVG Tree Canvas */}
        <div className="flex-1 rounded-3xl bg-black/30 border border-white/5 overflow-hidden relative shadow-inner flex items-center justify-center">
          {treeRoot ? (
            <svg className="w-full h-full min-h-[380px]" viewBox="0 0 700 360">
              {/* Render connector lines */}
              {flattenedNodes.map((node) => {
                if (node.parentId === null) return null;
                
                let lineColor = '#334155';
                let lineWidth = 2;
                
                if (node.status === 'visited' || node.status === 'active') {
                  lineColor = '#00f2fe';
                  lineWidth = 2.5;
                } else if (node.status === 'target') {
                  lineColor = '#f43f5e';
                  lineWidth = 3;
                }

                return (
                  <line
                    key={`line-${node.value}`}
                    x1={node.parentX}
                    y1={node.parentY}
                    x2={node.x}
                    y2={node.y}
                    stroke={lineColor}
                    strokeWidth={lineWidth}
                    className="transition-all duration-300"
                  />
                );
              })}

              {/* Render tree node circles */}
              {flattenedNodes.map((node) => {
                let circleColor = 'fill-[#0f172a] stroke-slate-600';
                let textFontColor = 'fill-white';
                let haloGlow = false;
                let glowColor = '';

                if (node.status === 'active') {
                  circleColor = 'fill-[#f59e0b]/20 stroke-[#f59e0b]';
                  haloGlow = true;
                  glowColor = '#f59e0b';
                } else if (node.status === 'visited') {
                  circleColor = 'fill-[#00f2fe]/20 stroke-[#00f2fe]';
                  haloGlow = true;
                  glowColor = '#00f2fe';
                } else if (node.status === 'target') {
                  circleColor = 'fill-[#f43f5e]/20 stroke-[#f43f5e]';
                  haloGlow = true;
                  glowColor = '#f43f5e';
                }

                return (
                  <g key={`node-${node.value}`} className="cursor-pointer transition-all duration-300">
                    {/* Ripple Halo */}
                    {haloGlow && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={22}
                        fill="none"
                        stroke={glowColor}
                        strokeWidth={1.5}
                        className="animate-ping opacity-25"
                      />
                    )}

                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={16}
                      className={`${circleColor} stroke-[2.5] transition-all duration-300`}
                    />
                    <text
                      x={node.x}
                      y={node.y + 4}
                      textAnchor="middle"
                      className={`${textFontColor} font-mono text-[10px] font-bold select-none pointer-events-none`}
                    >
                      {node.value}
                    </text>
                  </g>
                );
              })}
            </svg>
          ) : (
            <div className="flex flex-col items-center text-text-muted gap-2 select-none">
              <Database className="w-10 h-10 text-white/20" />
              <span className="text-xs font-mono">Tree is completely empty. Insert values to begin.</span>
            </div>
          )}
        </div>

        {/* Real-time Traversal Logger & Traversal Output List */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          {/* Logger */}
          <div className="md:col-span-5 glass-panel p-5 rounded-2xl border border-white/5 flex flex-col min-h-[140px] max-h-[140px]">
            <span className="text-[9px] font-mono font-bold text-text-muted uppercase mb-2 block">Live Solver Logger</span>
            <div className="flex-1 bg-black/40 border border-white/5 rounded-xl p-3 overflow-y-auto font-mono text-[10px] leading-relaxed space-y-1.5 no-scrollbar">
              {stepLog.slice(-5).map((log, idx) => (
                <div key={idx} className="flex items-start gap-1.5 text-text-muted">
                  <ChevronRight className="w-3.5 h-3.5 text-brand-primary flex-shrink-0 mt-0.5" />
                  <span className={idx === stepLog.slice(-5).length - 1 ? "text-white font-bold animate-pulse" : ""}>
                    {log}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Traversal Output Blocks */}
          <div className="md:col-span-7 glass-panel p-5 rounded-2xl border border-white/5 flex flex-col justify-between">
            <div>
              <span className="text-[9px] font-mono font-bold text-brand-primary uppercase tracking-wider block mb-1">
                {traversalType.toUpperCase()} Traversal Sequence
              </span>
              <p className="text-[11px] text-text-muted font-sans leading-relaxed">
                "{infoDesc}"
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2 items-center bg-black/35 border border-white/5 p-3 rounded-xl min-h-[50px] mt-2 overflow-x-auto">
              {traversalOutput.length > 0 ? (
                traversalOutput.map((val, idx) => (
                  <div 
                    key={idx}
                    className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-brand-primary/25 to-brand-secondary/25 border border-brand-primary/45 font-mono text-[11px] font-extrabold text-white animate-scale-in"
                  >
                    {val}
                  </div>
                ))
              ) : (
                <span className="text-[10px] font-mono text-white/20 select-none">No sequence generated yet.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
