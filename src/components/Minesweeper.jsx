import { useState, useEffect, useRef } from 'react';
import styles from './Minesweeper.module.css';

const GRID_SIZE = 10;
const MINE_COUNT = 10;

export default function Minesweeper() {
    const [grid, setGrid] = useState([]);
    const [gameOver, setGameOver] = useState(false);
    const [gameWon, setGameWon] = useState(false);
    const [flagsCount, setFlagsCount] = useState(MINE_COUNT);
    const [seconds, setSeconds] = useState(0);
    const [timerActive, setTimerActive] = useState(false);

    const timerRef = useRef(null);

    // Initial grid creation
    const initGrid = () => {
        // Create empty grid
        let tempGrid = Array(GRID_SIZE).fill(null).map((_, r) => (
            Array(GRID_SIZE).fill(null).map((_, c) => ({
                row: r,
                col: c,
                isMine: false,
                isRevealed: false,
                isFlagged: false,
                neighborMines: 0
            }))
        ));

        // Place mines randomly
        let minesPlaced = 0;
        while (minesPlaced < MINE_COUNT) {
            const r = Math.floor(Math.random() * GRID_SIZE);
            const c = Math.floor(Math.random() * GRID_SIZE);
            if (!tempGrid[r][c].isMine) {
                tempGrid[r][c].isMine = true;
                minesPlaced++;
            }
        }

        // Calculate neighbor mines count
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (tempGrid[r][c].isMine) continue;
                let mines = 0;
                // Check all 8 directions
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        const nr = r + dr;
                        const nc = c + dc;
                        if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
                            if (tempGrid[nr][nc].isMine) mines++;
                        }
                    }
                }
                tempGrid[r][c].neighborMines = mines;
            }
        }

        setGrid(tempGrid);
        setGameOver(false);
        setGameWon(false);
        setFlagsCount(MINE_COUNT);
        setSeconds(0);
        setTimerActive(false);
        if (timerRef.current) clearInterval(timerRef.current);
    };

    useEffect(() => {
        initGrid();
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    // Game Timer
    useEffect(() => {
        if (timerActive && !gameOver && !gameWon) {
            timerRef.current = setInterval(() => {
                setSeconds(prev => Math.min(prev + 1, 999));
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [timerActive, gameOver, gameWon]);

    // Recursive clearance for 0 cells
    const revealCell = (tempGrid, r, c) => {
        if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) return;
        const cell = tempGrid[r][c];
        if (cell.isRevealed || cell.isFlagged) return;

        cell.isRevealed = true;

        if (cell.neighborMines === 0 && !cell.isMine) {
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    revealCell(tempGrid, r + dr, c + dc);
                }
            }
        }
    };

    const handleLeftClick = (r, c) => {
        if (gameOver || gameWon) return;
        const cell = grid[r][c];
        if (cell.isRevealed || cell.isFlagged) return;

        // Start timer
        if (!timerActive) {
            setTimerActive(true);
        }

        const newGrid = [...grid.map(row => [...row])];
        
        if (cell.isMine) {
            // Explode mine! Game over!
            setGameOver(true);
            setTimerActive(false);
            // Reveal all mines
            newGrid.forEach(row => {
                row.forEach(cl => {
                    if (cl.isMine) cl.isRevealed = true;
                });
            });
            setGrid(newGrid);
            return;
        }

        revealCell(newGrid, r, c);

        // Check Win Condition
        let revealedCount = 0;
        newGrid.forEach(row => {
            row.forEach(cl => {
                if (cl.isRevealed && !cl.isMine) revealedCount++;
            });
        });

        if (revealedCount === GRID_SIZE * GRID_SIZE - MINE_COUNT) {
            setGameWon(true);
            setTimerActive(false);
            // Flag remaining mines
            newGrid.forEach(row => {
                row.forEach(cl => {
                    if (cl.isMine) cl.isFlagged = true;
                });
            });
            setFlagsCount(0);
        }

        setGrid(newGrid);
    };

    const handleRightClick = (e, r, c) => {
        e.preventDefault();
        if (gameOver || gameWon) return;
        const cell = grid[r][c];
        if (cell.isRevealed) return;

        // Start timer on first interaction
        if (!timerActive) {
            setTimerActive(true);
        }

        const newGrid = [...grid.map(row => [...row])];
        const nextFlagged = !cell.isFlagged;
        
        if (nextFlagged && flagsCount === 0) return; // limit flags

        cell.isFlagged = nextFlagged;
        setFlagsCount(prev => prev + (nextFlagged ? -1 : 1));
        setGrid(newGrid);
    };

    // Smiley face indicator
    const getSmiley = () => {
        if (gameWon) return '😎';
        if (gameOver) return '😵';
        return '🙂';
    };

    return (
        <div className={styles.minesweeper}>
            <div className={styles.headerBar}>
                <div className={styles.counter}>{flagsCount.toString().padStart(3, '0')}</div>
                <button className={styles.smiley} onClick={initGrid}>
                    {getSmiley()}
                </button>
                <div className={styles.counter}>{seconds.toString().padStart(3, '0')}</div>
            </div>

            <div className={styles.grid}>
                {grid.map((row, r) => (
                    <div key={r} style={{ display: 'flex' }}>
                        {row.map((cell, c) => {
                            let cellContent = '';
                            let cellClass = styles.cell;

                            if (cell.isRevealed) {
                                cellClass += ` ${styles.cellRevealed}`;
                                if (cell.isMine) {
                                    cellClass += ` ${styles.cellMine}`;
                                    cellContent = '💣';
                                } else if (cell.neighborMines > 0) {
                                    cellContent = cell.neighborMines.toString();
                                    cellClass += ` ${styles[`c${cell.neighborMines}`]}`;
                                }
                            } else if (cell.isFlagged) {
                                cellContent = '🚩';
                            }

                            return (
                                <div 
                                    key={c}
                                    className={cellClass}
                                    onClick={() => handleLeftClick(r, c)}
                                    onContextMenu={(e) => handleRightClick(e, r, c)}
                                >
                                    {cellContent}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
            {(gameOver || gameWon) && (
                <div style={{ marginTop: '15px', fontWeight: 'bold', fontSize: '15px', color: gameWon ? '#107c41' : '#a80000' }}>
                    {gameWon ? '🏆 YOU WIN!' : '💥 GAME OVER'}
                </div>
            )}
        </div>
    );
}
