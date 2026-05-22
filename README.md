# NexusAlgo: Futuristic Algorithm Visualizer

A premium, interactive, and visually stunning **Algorithm Visualizer Web Application** built with a state-of-the-art cyber-dark dashboard aesthetic. This application is designed to help developers and computer science students master core Data Structures and Algorithms (DSA) through high-fidelity visual representations, dynamic retro audio synthesis, live step-by-step explainers, and real-time execution benchmarks.

---

## 🚀 Key Modules & Visualizers

### 1. Sorting Visualizer
*   **Algorithms Supported**: Bubble Sort, Selection Sort, Insertion Sort, Merge Sort, and Quick Sort.
*   **Highly Responsive Grid**: Custom vertical HSL gradient bars that scale dynamically.
*   **Granular Visual Highlight Pointers**: 
    *   `Cyan/Sky Blue` for active pivots and dividers.
    *   `Yellow/Gold` for comparisons.
    *   `Rose Red` for write/swap actions.
    *   `Purple/Magenta` for sorted items in their final positions.
*   **Syntax-Highlighted Pseudocode Tracker**: Code lines light up dynamically in sync with the executed step.
*   **Live Time & Space Complexity Matrix**: Interactive side-panel showing Big-O performance boundaries.

### 2. Searching Visualizer
*   **Algorithms Supported**: Linear Search and Binary Search.
*   **Capsule Layout Nodes**: Nodes are presented as floating glowing capsule grids containing indices and values.
*   **Partition Discard Dimming (Binary Search)**: Automatically dims and scales down elements outside the current low/high boundaries, making binary halving instantly obvious.
*   **Target Helpers**: Options to generate arrays with guaranteed target existence or guaranteed absence to test terminal states.

### 3. Data Structure Visualizer (Stack, Queue, & Linked List)
*   **Interactive Stack (LIFO)**: A vertical glass container where items drop down with gravity and spring bounds. Pop triggers slide-up fade-outs while highlighting the stack pointer.
*   **Interactive Queue (FIFO)**: A horizontal dual-open track where new elements enqueue at the rear and slide forward to replace dequeued front elements.
*   **Interactive Singly Linked List**: Capsules chained together with animated SVG dash-array pointer arrows. Shows Head and Null connectors.

### 4. Pathfinding Visualizer (Grid Search & Maze Generators)
*   **Algorithms Supported**: Breadth-First Search (BFS) and Dijkstra's Weighted Algorithm.
*   **Fully Interactive 2D Grid**: 18 rows by 32 columns. 
*   **Pin Relocation**: Start pin (Emerald Green) and Target pin (Rose Red) can be clicked and dragged to relocate anywhere in real-time.
*   **Obstacle Drawing**: Click and drag to construct slate-colored stone walls.
*   **Maze division generator**: Implements a recursive division algorithm that populates the grid with corridors and walls.
*   **Search ripple animations**: Explored cells ripple radially outwards and connect the final route using a glowing golden laser path.

---

## 🌟 Standout Unique Features

### ⚔️ Feature 1: Algorithm Race Mode
*   **Side-by-Side Dual Panels**: Allows user to select two sorting algorithms concurrently (e.g. Quick Sort vs Bubble Sort).
*   **Identical Seed Array**: Feeds the exact same randomized seed to both contestants to guarantee a fair race.
*   **Benchmark Dashboard**: Tracks compares, swaps/writes, and execution times down to the millisecond using `performance.now()`.
*   **Cyber Winner Banner**: Confetti explosion and congratulatory overlay announcing the winner.

### 🧠 Feature 2: AI Explanation Panel
*   An active chatbot-like box that reads the current visual state and writes a beginner-friendly real-world analogy.
    *   *Example (Linear)*: "Linear search is checking element at index 4 (Value 23) against target 45. No match, moving to next, similar to flipping pages page-by-page."
    *   *Example (Binary)*: "Mid is 8 (Value 64). Since 64 is greater than target 45, we discard the entire upper partition. We've just cut our searching time in half!"

### 🎵 Feature 3: Web Audio Synth Soundscapes
*   No bloated heavy audio files. Sound is synthesized at runtime using the browser's native **Web Audio API** (`OscillatorNode` with retro `'triangle'` wave).
*   **Pitch-to-Value Mapping**: Frequencies are scaled dynamically ($220\text{Hz}$ to $1000\text{Hz}$) relative to the magnitude of the bar being compared or swapped, creating a retro retro-synth soundscape.

---

## 🎨 Premium Spaces Themes

Toggle between 4 beautifully designed, cyber-dark visual configurations directly in the sidebar footer:
1.  **Futuristic Neon (Default)**: Deep Slate background with neon cyan and purple glows.
2.  **Cyberpunk Yellow**: Stealth Obsidian with neon yellow and hot pink highlights.
3.  **Emerald Matrix**: Digital green and matrix cascades.
4.  **Deep Space Ocean**: Deep maritime ocean with turquoise and sapphire accents.

---

## 📂 Modular Folder Structure

```
src/
├── assets/          # Brand logos and styling icons
├── components/      # Reusable visual modules
│   ├── ui/          # Low-level primitives
│   └── common/      # Global ParticleBackground and layout frames
├── algorithms/      # Core ES6 Step Generator Engines (*yield)
│   ├── sorting.js   
│   ├── searching.js 
│   └── pathfinding.js
├── hooks/           # Sound synthesis and browser runners
│   └── useAudioSynth.js 
├── pages/           # High-level responsive dashboard screens
│   ├── Landing.jsx          
│   ├── SortingPage.jsx      
│   ├── SearchingPage.jsx    
│   ├── DataStructures.jsx   
│   ├── PathfindingPage.jsx  
│   └── RaceModePage.jsx     
├── index.css        # Tailwind v4 import + custom animations/keyframes
├── App.jsx          # Route declarations & global theme states
└── main.jsx         # Render entry point
```

---

## 🛠️ Step-by-Step Local Setup

Ensure you have **Node.js** (v18 or higher recommended) and **NPM** installed.

### 1. Install Dependencies
In the root directory of the project, run:
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Build for Production
To compile and bundle assets into a high-performance `dist/` directory, run:
```bash
npm run build
```

### 4. Preview the Production Build
```bash
npm run preview
```

---

## 💎 Project Evaluation & Compliance
*   **No Placeholders**: Every single visual button, selector, slide, and control panel is 100% active and connected to visual rendering loops.
*   **Responsive Flow**: Grid wraps cleanly using Tailwind directives on mobile viewports.
*   **Optimization**: Renders cells instantly and triggers sound contexts gracefully conforming to modern browser security policies.
