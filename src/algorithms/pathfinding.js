
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
