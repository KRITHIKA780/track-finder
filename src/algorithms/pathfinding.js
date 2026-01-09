
export const BFS = (grid, startNode, endNode) => {
  const visitedNodesInOrder = [];
  const queue = [[startNode, [startNode]]];
  const visited = new Set();
  visited.add(`${startNode.row}-${startNode.col}`);

  while (queue.length > 0) {
    const [currentNode, path] = queue.shift();
    visitedNodesInOrder.push(currentNode);

    if (currentNode.row === endNode.row && currentNode.col === endNode.col) {
      return { visitedNodesInOrder, path };
    }

    const neighbors = getNeighbors(currentNode, grid);
    for (const neighbor of neighbors) {
      const key = `${neighbor.row}-${neighbor.col}`;
      if (!visited.has(key) && !neighbor.isWall) {
        visited.add(key);
        queue.push([neighbor, [...path, neighbor]]);
      }
    }
  }
  return { visitedNodesInOrder, path: null };
};

export const DFS = (grid, startNode, endNode) => {
  const visitedNodesInOrder = [];
  const stack = [[startNode, [startNode]]];
  const visited = new Set();

  while (stack.length > 0) {
    const [currentNode, path] = stack.pop();
    const key = `${currentNode.row}-${currentNode.col}`;

    if (visited.has(key)) continue;
    
    visited.add(key);
    visitedNodesInOrder.push(currentNode);

    if (currentNode.row === endNode.row && currentNode.col === endNode.col) {
      return { visitedNodesInOrder, path };
    }

    const neighbors = getNeighbors(currentNode, grid);
    for (const neighbor of neighbors) {
      if (!neighbor.isWall) {
        stack.push([neighbor, [...path, neighbor]]);
      }
    }
  }
  return { visitedNodesInOrder, path: null };
};

export const AStar = (grid, startNode, endNode) => {
  const visitedNodesInOrder = [];
  startNode.distance = 0;
  startNode.heuristic = manhattanDistance(startNode, endNode);
  startNode.totalCost = startNode.distance + startNode.heuristic;
  
  const openSet = [startNode];
  const closedSet = new Set();
  const cameFrom = new Map();
  const gScore = new Map();
  
  gScore.set(`${startNode.row}-${startNode.col}`, 0);

  while (openSet.length > 0) {
    openSet.sort((a, b) => (a.totalCost) - (b.totalCost));
    const currentNode = openSet.shift();
    const currentKey = `${currentNode.row}-${currentNode.col}`;

    if (closedSet.has(currentKey)) continue;
    closedSet.add(currentKey);
    visitedNodesInOrder.push(currentNode);

    if (currentNode.row === endNode.row && currentNode.col === endNode.col) {
      return { visitedNodesInOrder, path: reconstructPath(cameFrom, endNode) };
    }

    const neighbors = getNeighbors(currentNode, grid);
    for (const neighbor of neighbors) {
      if (neighbor.isWall || closedSet.has(`${neighbor.row}-${neighbor.col}`)) continue;

      const tentativeGScore = gScore.get(currentKey) + 1;
      const neighborKey = `${neighbor.row}-${neighbor.col}`;

      if (!gScore.has(neighborKey) || tentativeGScore < gScore.get(neighborKey)) {
        cameFrom.set(neighborKey, currentNode);
        gScore.set(neighborKey, tentativeGScore);
        neighbor.distance = tentativeGScore;
        neighbor.heuristic = manhattanDistance(neighbor, endNode);
        neighbor.totalCost = neighbor.distance + neighbor.heuristic;
        
        if (!openSet.find(n => n.row === neighbor.row && n.col === neighbor.col)) {
          openSet.push(neighbor);
        }
      }
    }
  }
  return { visitedNodesInOrder, path: null };
};

const getNeighbors = (node, grid) => {
  const neighbors = [];
  const { row, col } = node;
  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
  return neighbors;
};

const manhattanDistance = (nodeA, nodeB) => {
  return Math.abs(nodeA.row - nodeB.row) + Math.abs(nodeA.col - nodeB.col);
};

const reconstructPath = (cameFrom, endNode) => {
  const path = [];
  let current = endNode;
  while (current) {
    path.unshift(current);
    current = cameFrom.get(`${current.row}-${current.col}`);
  }
  return path;
};
