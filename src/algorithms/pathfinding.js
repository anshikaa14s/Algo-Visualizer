/**
 * Pathfinding Algorithms & Maze Generators for NexusAlgo Algorithm Visualizer
 * Nodes are represented by objects:
 * {
 *   row: number,
 *   col: number,
 *   isStart: boolean,
 *   isEnd: boolean,
 *   isWall: boolean,
 *   isVisited: boolean,
 *   distance: number,
 *   previousNode: Node | null
 * }
 */

// 1. DIJKSTRA'S ALGORITHM
export function dijkstra(grid, startNode, endNode) {
  const visitedNodesInOrder = [];
  startNode.distance = 0;
  
  // Clone all nodes into an unvisited set
  const unvisitedNodes = getAllNodes(grid);
  
  while (unvisitedNodes.length > 0) {
    sortNodesByDistance(unvisitedNodes);
    const closestNode = unvisitedNodes.shift();
    
    // If we encounter a wall, we skip it
    if (closestNode.isWall) continue;
    
    // If the closest node has a distance of infinity, we are trapped
    if (closestNode.distance === Infinity) {
      return { visitedNodesInOrder, shortestPath: [] };
    }
    
    closestNode.isVisited = true;
    visitedNodesInOrder.push(closestNode);
    
    // If we reached the end node, we reconstruct the shortest path
    if (closestNode.row === endNode.row && closestNode.col === endNode.col) {
      return {
        visitedNodesInOrder,
        shortestPath: getNodesInShortestPathOrder(endNode)
      };
    }
    
    updateUnvisitedNeighbors(closestNode, grid);
  }
  
  return { visitedNodesInOrder, shortestPath: [] };
}

// 2. BREADTH-FIRST SEARCH (BFS)
export function bfs(grid, startNode, endNode) {
  const visitedNodesInOrder = [];
  const queue = [startNode];
  startNode.isVisited = true;
  
  while (queue.length > 0) {
    const currentNode = queue.shift();
    
    // Skip walls
    if (currentNode.isWall) continue;
    
    visitedNodesInOrder.push(currentNode);
    
    // If we reached the end
    if (currentNode.row === endNode.row && currentNode.col === endNode.col) {
      return {
        visitedNodesInOrder,
        shortestPath: getNodesInShortestPathOrder(endNode)
      };
    }
    
    const neighbors = getUnvisitedNeighbors(currentNode, grid);
    for (const neighbor of neighbors) {
      neighbor.isVisited = true;
      neighbor.previousNode = currentNode;
      queue.push(neighbor);
    }
  }
  
  return { visitedNodesInOrder, shortestPath: [] };
}

// 3. DEPTH-FIRST SEARCH (DFS)
export function dfs(grid, startNode, endNode) {
  const visitedNodesInOrder = [];
  const stack = [startNode];
  
  while (stack.length > 0) {
    const currentNode = stack.pop();
    
    if (currentNode.isWall) continue;
    if (currentNode.isVisited) continue;
    
    currentNode.isVisited = true;
    visitedNodesInOrder.push(currentNode);
    
    if (currentNode.row === endNode.row && currentNode.col === endNode.col) {
      return {
        visitedNodesInOrder,
        shortestPath: getNodesInShortestPathOrder(endNode)
      };
    }
    
    const neighbors = getUnvisitedNeighbors(currentNode, grid);
    // Push neighbors in reverse order (or normal order) to stack
    for (const neighbor of neighbors) {
      if (!neighbor.isVisited) {
        neighbor.previousNode = currentNode;
        stack.push(neighbor);
      }
    }
  }
  
  return { visitedNodesInOrder, shortestPath: [] };
}

// HELPERS FOR PATHFINDING
function getAllNodes(grid) {
  const nodes = [];
  for (const row of grid) {
    for (const node of row) {
      nodes.push(node);
    }
  }
  return nodes;
}

function sortNodesByDistance(unvisitedNodes) {
  unvisitedNodes.sort((nodeA, nodeB) => nodeA.distance - nodeB.distance);
}

function updateUnvisitedNeighbors(node, grid) {
  const unvisitedNeighbors = getUnvisitedNeighbors(node, grid);
  for (const neighbor of unvisitedNeighbors) {
    neighbor.distance = node.distance + 1;
    neighbor.previousNode = node;
  }
}

function getUnvisitedNeighbors(node, grid) {
  const neighbors = [];
  const { row, col } = node;
  
  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
  
  return neighbors.filter(neighbor => !neighbor.isVisited);
}

function getNodesInShortestPathOrder(endNode) {
  const nodesInShortestPathOrder = [];
  let currentNode = endNode;
  while (currentNode !== null) {
    nodesInShortestPathOrder.unshift(currentNode);
    currentNode = currentNode.previousNode;
  }
  return nodesInShortestPathOrder;
}

// 3. RECURSIVE DIVISION MAZE GENERATOR
export function generateRecursiveDivisionMaze(rows, cols, startNode, endNode) {
  const walls = [];

  function divide(rStart, rEnd, cStart, cEnd, orientation) {
    if (rEnd < rStart || cEnd < cStart) return;

    if (orientation === "horizontal") {
      // Find rows with odd indices to build walls (leaving even indices as open corridors)
      const possibleRows = [];
      for (let r = rStart + 1; r < rEnd; r += 2) {
        possibleRows.push(r);
      }
      if (possibleRows.length === 0) return;
      const wallRow = possibleRows[Math.floor(Math.random() * possibleRows.length)];

      // Find even columns to leave gaps
      const possibleGaps = [];
      for (let c = cStart; c <= cEnd; c += 2) {
        possibleGaps.push(c);
      }
      if (possibleGaps.length === 0) return;
      const gapCol = possibleGaps[Math.floor(Math.random() * possibleGaps.length)];

      for (let c = cStart; c <= cEnd; c++) {
        if (c === gapCol) continue;
        // Don't place a wall over start or end node
        if (
          (wallRow === startNode.row && c === startNode.col) ||
          (wallRow === endNode.row && c === endNode.col)
        ) {
          continue;
        }
        walls.push({ row: wallRow, col: c });
      }

      // Recurse above the wall Row
      divide(
        rStart,
        wallRow - 1,
        cStart,
        cEnd,
        getOrientation(wallRow - 1 - rStart, cEnd - cStart)
      );
      // Recurse below the wall Row
      divide(
        wallRow + 1,
        rEnd,
        cStart,
        cEnd,
        getOrientation(rEnd - (wallRow + 1), cEnd - cStart)
      );
    } else {
      // Vertical orientation: build vertical walls at odd columns, leave gaps at even rows
      const possibleCols = [];
      for (let c = cStart + 1; c < cEnd; c += 2) {
        possibleCols.push(c);
      }
      if (possibleCols.length === 0) return;
      const wallCol = possibleCols[Math.floor(Math.random() * possibleCols.length)];

      const possibleGaps = [];
      for (let r = rStart; r <= rEnd; r += 2) {
        possibleGaps.push(r);
      }
      if (possibleGaps.length === 0) return;
      const gapRow = possibleGaps[Math.floor(Math.random() * possibleGaps.length)];

      for (let r = rStart; r <= rEnd; r++) {
        if (r === gapRow) continue;
        // Don't place wall over start or end node
        if (
          (r === startNode.row && wallCol === startNode.col) ||
          (r === endNode.row && wallCol === endNode.col)
        ) {
          continue;
        }
        walls.push({ row: r, col: wallCol });
      }

      // Recurse to the left of the wall column
      divide(
        rStart,
        rEnd,
        cStart,
        wallCol - 1,
        getOrientation(rEnd - rStart, wallCol - 1 - cStart)
      );
      // Recurse to the right of the wall column
      divide(
        rStart,
        rEnd,
        wallCol + 1,
        cEnd,
        getOrientation(rEnd - rStart, cEnd - (wallCol + 1))
      );
    }
  }

  function getOrientation(height, width) {
    if (width < height) return "horizontal";
    if (height < width) return "vertical";
    return Math.random() < 0.5 ? "horizontal" : "vertical";
  }

  divide(0, rows - 1, 0, cols - 1, "vertical");
  return walls;
}
