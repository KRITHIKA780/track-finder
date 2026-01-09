
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, RotateCcw, Layout, Trash2, Zap, Info, Box } from 'lucide-react';
import { BFS, DFS, AStar } from './algorithms/pathfinding';

const ROWS = 25;
const COLS = 50;

const INITIAL_START = { row: 12, col: 10 };
const INITIAL_END = { row: 12, col: 40 };

const App = () => {
  const [grid, setGrid] = useState([]);
  const [mouseIsPressed, setMouseIsPressed] = useState(false);
  const [algorithm, setAlgorithm] = useState('BFS');
  const [visualizing, setVisualizing] = useState(false);
  const [stats, setStats] = useState({ visited: 0, pathLength: 0 });
  const animatingRef = useRef(false);

  const createNode = (row, col) => ({
    row,
    col,
    isStart: row === INITIAL_START.row && col === INITIAL_START.col,
    isEnd: row === INITIAL_END.row && col === INITIAL_END.col,
    isWall: false,
    distance: Infinity,
    isVisited: false,
    previousNode: null,
  });

  const setupGrid = useCallback(() => {
    const nodes = [];
    for (let row = 0; row < ROWS; row++) {
      const currentRow = [];
      for (let col = 0; col < COLS; col++) {
        currentRow.push(createNode(row, col));
      }
      nodes.push(currentRow);
    }
    setGrid(nodes);
    setStats({ visited: 0, pathLength: 0 });
  }, []);

  useEffect(() => {
    setupGrid();
  }, [setupGrid]);

  const handleMouseDown = (row, col) => {
    if (visualizing) return;
    const newGrid = getNewGridWithWallToggled(grid, row, col);
    setGrid(newGrid);
    setMouseIsPressed(true);
  };

  const handleMouseEnter = (row, col) => {
    if (!mouseIsPressed || visualizing) return;
    const newGrid = getNewGridWithWallToggled(grid, row, col);
    setGrid(newGrid);
  };

  const handleMouseUp = () => {
    setMouseIsPressed(false);
  };

  const getNewGridWithWallToggled = (grid, row, col) => {
    const newGrid = [...grid];
    const node = newGrid[row][col];
    if (node.isStart || node.isEnd) return newGrid;
    const newNode = {
      ...node,
      isWall: !node.isWall,
    };
    newGrid[row] = [...newGrid[row]];
    newGrid[row][col] = newNode;
    return newGrid;
  };

  const generateMaze = () => {
    if (visualizing) return;
    const newGrid = grid.map(row => 
      row.map(node => ({
        ...node,
        isWall: !node.isStart && !node.isEnd && Math.random() < 0.3
      }))
    );
    setGrid(newGrid);
    resetVisualizationOnly();
  };

  const visualizeAlgorithm = async () => {
    if (visualizing) return;
    setVisualizing(true);
    animatingRef.current = true;
    resetVisualizationOnly();
    setStats({ visited: 0, pathLength: 0 });

    const startNode = grid[INITIAL_START.row][INITIAL_START.col];
    const endNode = grid[INITIAL_END.row][INITIAL_END.col];

    let result;
    if (algorithm === 'BFS') result = BFS(grid, startNode, endNode);
    else if (algorithm === 'DFS') result = DFS(grid, startNode, endNode);
    else result = AStar(grid, startNode, endNode);

    const { visitedNodesInOrder, path } = result;
    await animateAlgorithm(visitedNodesInOrder, path);
    setVisualizing(false);
    animatingRef.current = false;
  };

  const animateAlgorithm = (visitedNodesInOrder, path) => {
    return new Promise((resolve) => {
      for (let i = 0; i <= visitedNodesInOrder.length; i++) {
        if (i === visitedNodesInOrder.length) {
          setTimeout(() => {
            if (path) {
              animatePath(path).then(resolve);
            } else {
              setStats(s => ({ ...s, visited: visitedNodesInOrder.length }));
              resolve();
            }
          }, 10 * i);
          return;
        }
        setTimeout(() => {
          const node = visitedNodesInOrder[i];
          if (!node.isStart && !node.isEnd) {
            const el = document.getElementById(`node-${node.row}-${node.col}`);
            if (el) el.className = 'node node-visited';
          }
          if (i % 5 === 0) setStats(s => ({ ...s, visited: i }));
        }, 10 * i);
      }
    });
  };

  const animatePath = (path) => {
    return new Promise((resolve) => {
      for (let i = 0; i < path.length; i++) {
        setTimeout(() => {
          const node = path[i];
          if (!node.isStart && !node.isEnd) {
            const el = document.getElementById(`node-${node.row}-${node.col}`);
            if (el) el.className = 'node node-path';
          }
          setStats(s => ({ ...s, pathLength: i + 1 }));
          if (i === path.length - 1) resolve();
        }, 30 * i);
      }
    });
  };

  const resetVisualizationOnly = () => {
    const nodes = document.querySelectorAll('.node');
    nodes.forEach(n => {
      if (!n.classList.contains('node-wall') && !n.classList.contains('node-start') && !n.classList.contains('node-target')) {
        n.className = 'node';
      }
    });
    setStats({ visited: 0, pathLength: 0 });
  };

  const clearGrid = () => {
    if (visualizing) return;
    setupGrid();
    resetVisualizationOnly();
  };

  const clearWalls = () => {
    if (visualizing) return;
    const newGrid = grid.map(row =>
      row.map(node => ({ ...node, isWall: false }))
    );
    setGrid(newGrid);
    resetVisualizationOnly();
  };

  return (
    <div className="app-container">
      <div className="header">
        <h1>Pathfinder Pro</h1>
        <p>A high-performance algorithm visualizer designed for clarity and precision. Watch how different search patterns navigate complex obstacles.</p>
      </div>

      <div className="controls-panel">
        <select value={algorithm} onChange={(e) => setAlgorithm(e.target.value)} disabled={visualizing}>
          <option value="BFS">Breadth First Search (BFS)</option>
          <option value="DFS">Depth First Search (DFS)</option>
          <option value="A*">A* Search (Heuristic)</option>
        </select>

        <button className="btn-primary" onClick={visualizeAlgorithm} disabled={visualizing}>
          <Play size={18} fill="currentColor" /> Visualize
        </button>

        <button onClick={generateMaze} disabled={visualizing}>
          <Layout size={18} /> Generate Maze
        </button>

        <button onClick={clearWalls} disabled={visualizing}>
          <Trash2 size={18} /> Clear Walls
        </button>

        <button onClick={clearGrid} disabled={visualizing}>
          <RotateCcw size={18} /> Reset
        </button>
      </div>

      <div className="grid-container">
        <div
          className="grid"
          style={{ gridTemplateColumns: `repeat(${COLS}, 25px)` }}
          onMouseLeave={handleMouseUp}
        >
          {grid.map((row, rowIdx) => (
            row.map((node, colIdx) => {
              const { isStart, isEnd, isWall } = node;
              const extraClassName = isStart
                ? 'node-start'
                : isEnd
                  ? 'node-target'
                  : isWall
                    ? 'node-wall'
                    : '';

              return (
                <div
                  key={`${rowIdx}-${colIdx}`}
                  id={`node-${rowIdx}-${colIdx}`}
                  className={`node ${extraClassName}`}
                  onMouseDown={() => handleMouseDown(rowIdx, colIdx)}
                  onMouseEnter={() => handleMouseEnter(rowIdx, colIdx)}
                  onMouseUp={handleMouseUp}
                />
              );
            })
          ))}
        </div>
      </div>

      <div className="stats-container">
        <div className="stat-card">
          <span className="stat-value">{stats.visited}</span>
          <span className="stat-label">Nodes Visited</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.pathLength || '--'}</span>
          <span className="stat-label">Path Length</span>
        </div>
      </div>

      <div className="legend">
        <div className="legend-item">
          <div className="legend-box" style={{ background: 'var(--node-start)' }}></div>
          Start
        </div>
        <div className="legend-item">
          <div className="legend-box" style={{ background: 'var(--node-end)' }}></div>
          Target
        </div>
        <div className="legend-item">
          <div className="legend-box" style={{ background: 'var(--node-wall)' }}></div>
          Wall
        </div>
        <div className="legend-item">
          <div className="legend-box" style={{ background: 'var(--node-visited)' }}></div>
          Explored
        </div>
        <div className="legend-item">
          <div className="legend-box" style={{ background: 'var(--node-path)' }}></div>
          Shortest Path
        </div>
      </div>

      <div style={{ marginTop: '2.5rem', textAlign: 'center', opacity: 0.5, fontSize: '0.85rem' }}>
        <p><Info size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
          Tip: BFS looks for the shortest path circularly, whereas A* uses intuition to aim for the target.</p>
      </div>
    </div>
  );
};

export default App;
