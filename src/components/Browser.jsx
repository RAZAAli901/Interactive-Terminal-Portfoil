import { useState, useEffect } from 'react';
import styles from './Browser.module.css';

export default function Browser() {
    const [url, setUrl] = useState('google.com');
    const [currentTab, setCurrentTab] = useState('google'); // 'google', 'results', 'github', 'linkedin', 'portfolio', 'dino'
    const [searchQuery, setSearchQuery] = useState('');
    const [history, setHistory] = useState(['google']);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [showHistoryPanel, setShowHistoryPanel] = useState(false);

    const navigateTo = (tabName, destinationUrl) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(tabName);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        setCurrentTab(tabName);
        setUrl(destinationUrl);
    };

    const handleBack = () => {
        if (historyIndex > 0) {
            const prevIndex = historyIndex - 1;
            setHistoryIndex(prevIndex);
            const prevTab = history[prevIndex];
            setCurrentTab(prevTab);
            if (prevTab === 'google') setUrl('google.com');
            else if (prevTab === 'results') setUrl('google.com/search?q=' + encodeURIComponent(searchQuery));
            else if (prevTab === 'github') setUrl('github.com/developer');
            else if (prevTab === 'linkedin') setUrl('linkedin.com/in/developer');
            else if (prevTab === 'portfolio') setUrl('developerportfolio.dev');
            else if (prevTab === 'dino') setUrl('chrome://dino');
        }
    };

    const handleForward = () => {
        if (historyIndex < history.length - 1) {
            const nextIndex = historyIndex + 1;
            setHistoryIndex(nextIndex);
            const nextTab = history[nextIndex];
            setCurrentTab(nextTab);
            if (nextTab === 'google') setUrl('google.com');
            else if (nextTab === 'results') setUrl('google.com/search?q=' + encodeURIComponent(searchQuery));
            else if (nextTab === 'github') setUrl('github.com/developer');
            else if (nextTab === 'linkedin') setUrl('linkedin.com/in/developer');
            else if (nextTab === 'portfolio') setUrl('developerportfolio.dev');
            else if (nextTab === 'dino') setUrl('chrome://dino');
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const query = searchQuery.trim().toLowerCase();
        if (query === '') return;
        
        if (query.includes('dino') || query.includes('dinosaur') || query.includes('game')) {
            navigateTo('dino', 'chrome://dino');
        } else {
            navigateTo('results', 'google.com/search?q=' + encodeURIComponent(searchQuery));
        }
    };

    const handleAddressSubmit = (e) => {
        e.preventDefault();
        const value = url.toLowerCase();
        if (value.includes('dino') || value.includes('chrome://dino')) {
            navigateTo('dino', 'chrome://dino');
        } else if (value.includes('github')) {
            navigateTo('github', 'github.com/developer');
        } else if (value.includes('linkedin')) {
            navigateTo('linkedin', 'linkedin.com/in/developer');
        } else if (value.includes('portfolio') || value.includes('dev')) {
            navigateTo('portfolio', 'developerportfolio.dev');
        } else {
            setSearchQuery(url);
            navigateTo('results', 'google.com/search?q=' + encodeURIComponent(url));
        }
    };

    return (
        <div className={styles.browser}>
            {/* Nav Bar */}
            <div className={styles.navBar}>
                <button className={styles.navBtn} onClick={handleBack} disabled={historyIndex === 0}>⬅</button>
                <button className={styles.navBtn} onClick={handleForward} disabled={historyIndex === history.length - 1}>➡</button>
                <button className={styles.navBtn} onClick={() => navigateTo('google', 'google.com')}>🏠</button>
                <button className={styles.navBtn} style={{ fontSize: '11px', padding: '0 8px' }} onClick={() => setShowHistoryPanel(!showHistoryPanel)}>📜 History</button>
                <form onSubmit={handleAddressSubmit} style={{ display: 'flex', flex: 1 }}>
                    <input 
                        type="text" 
                        className={styles.addressInput} 
                        value={url} 
                        onChange={(e) => setUrl(e.target.value)} 
                    />
                </form>
            </div>

            {/* Bookmarks */}
            <div className={styles.bookmarks}>
                <div className={styles.bookmark} onClick={() => navigateTo('google', 'google.com')}>🌐 Google</div>
                <div className={styles.bookmark} onClick={() => navigateTo('github', 'github.com/developer')}>🐙 GitHub</div>
                <div className={styles.bookmark} onClick={() => navigateTo('linkedin', 'linkedin.com/in/developer')}>💼 LinkedIn</div>
                <div className={styles.bookmark} onClick={() => navigateTo('portfolio', 'developerportfolio.dev')}>📁 Portfolio Site</div>
                <div className={styles.bookmark} onClick={() => navigateTo('dino', 'chrome://dino')}>🦖 Dino Game</div>
                <div className={styles.bookmark} onClick={() => { setUrl('stackoverflow.com'); alert("Visiting simulated StackOverflow..."); }}>💬 StackOverflow</div>
                <div className={styles.bookmark} onClick={() => { setUrl('dev.to'); alert("Visiting simulated Dev.to..."); }}>✍️ Dev.to</div>
            </div>

            {/* Content Window */}
            {showHistoryPanel && (
                <div style={{ background: '#252525', color: '#fff', borderBottom: '1px solid #333', padding: '10px 15px', maxHeight: '100px', overflowY: 'auto' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '5px' }}>Session History Log:</div>
                    {history.map((hItem, idx) => (
                        <div key={idx} style={{ fontSize: '12px', padding: '2px 0', color: idx === historyIndex ? '#0078d4' : '#ccc', textDecoration: idx === historyIndex ? 'underline' : 'none' }}>
                            {idx + 1}. {hItem}
                        </div>
                    ))}
                </div>
            )}
            <div className={styles.content}>
                {currentTab === 'google' && (
                    <div className={styles.googleContainer}>
                        <div className={styles.googleLogo}>
                            <span style={{ color: '#4285F4' }}>G</span>
                            <span style={{ color: '#EA4335' }}>o</span>
                            <span style={{ color: '#FBBC05' }}>o</span>
                            <span style={{ color: '#4285F4' }}>g</span>
                            <span style={{ color: '#34A853' }}>l</span>
                            <span style={{ color: '#EA4335' }}>e</span>
                        </div>
                        <form onSubmit={handleSearch} className={styles.googleSearchBox}>
                            <span className={styles.searchIcon}>🔍</span>
                            <input 
                                type="text" 
                                className={styles.googleSearchInput} 
                                placeholder="Search Google or type a URL (try 'dino')"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </form>
                        <div className={styles.googleButtons}>
                            <button className={styles.gBtn} onClick={handleSearch}>Google Search</button>
                            <button className={styles.gBtn} onClick={() => navigateTo('portfolio', 'developerportfolio.dev')}>I'm Feeling Lucky</button>
                        </div>
                    </div>
                )}

                {currentTab === 'results' && (
                    <div className={styles.resultsContainer}>
                        <div style={{ fontSize: '14px', color: '#70757a', marginBottom: '15px' }}>
                            About 12,300,000 results (0.34 seconds) for "{searchQuery}"
                        </div>
                        
                        {/* Custom Results */}
                        <div className={styles.resultItem}>
                            <div className={styles.resultUrl}>https://developerportfolio.dev</div>
                            <div className={styles.resultTitle} onClick={() => navigateTo('portfolio', 'developerportfolio.dev')}>
                                Full Stack Developer Portfolio - Home
                            </div>
                            <div className={styles.resultSnippet}>
                                Welcome to my portfolio website. Explore my developer skills (React, JavaScript, Node.js, CSS), my code repositories, projects, and contact info. Type commands or launch interactive apps!
                            </div>
                        </div>

                        <div className={styles.resultItem}>
                            <div className={styles.resultUrl}>https://github.com/developer</div>
                            <div className={styles.resultTitle} onClick={() => navigateTo('github', 'github.com/developer')}>
                                Developer (Software Engineer) · GitHub Profile
                            </div>
                            <div className={styles.resultSnippet}>
                                Check out open-source repositories, developer contributions, and software projects. Active packages built with React, Node, and Python.
                            </div>
                        </div>

                        <div className={styles.resultItem}>
                            <div className={styles.resultUrl}>https://linkedin.com/in/developer</div>
                            <div className={styles.resultTitle} onClick={() => navigateTo('linkedin', 'linkedin.com/in/developer')}>
                                Developer Profile - Senior Software Engineer | LinkedIn
                            </div>
                            <div className={styles.resultSnippet}>
                                View professional experience, education, certifications, and endorsements. Connecting with recruiters, developers, and tech managers worldwide.
                            </div>
                        </div>

                        <div className={styles.resultItem}>
                            <div className={styles.resultUrl}>https://www.w3schools.com › js</div>
                            <div className={styles.resultTitle} onClick={() => alert("Simulated Webpage link")}>
                                JavaScript Tutorial - W3Schools
                            </div>
                            <div className={styles.resultSnippet}>
                                JavaScript is the world's most popular programming language. JavaScript is the programming language of the Web. Easy to learn!
                            </div>
                        </div>
                    </div>
                )}

                {currentTab === 'github' && (
                    <div className={styles.profilePage} style={{ backgroundColor: '#0d1117', color: '#c9d1d9', height: '100%' }}>
                        <div className={styles.profileHeader}>
                            <div className={styles.profileAvatar} style={{ backgroundColor: '#2f363d' }}>🐙</div>
                            <div className={styles.profileDetails}>
                                <h2 style={{ color: '#f0f6fc' }}>RAZAAli901</h2>
                                <p style={{ color: '#8b949e' }}>Full-Stack Engineer | Open-Source Enthusiast</p>
                            </div>
                        </div>
                        <h3 style={{ borderBottom: '1px solid #21262d', paddingBottom: '8px', color: '#f0f6fc' }}>Popular Repositories</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
                            <div style={{ border: '1px solid #30363d', borderRadius: '6px', padding: '15px' }}>
                                <div style={{ color: '#58a6ff', fontWeight: 'bold' }}>Interactive-Terminal-Portfoil</div>
                                <p style={{ fontSize: '12px', color: '#8b949e', margin: '8px 0' }}>An interactive Windows 11 style OS portfolio running inside the web browser.</p>
                                <div style={{ fontSize: '11px', color: '#8b949e' }}>🟡 JavaScript ★ 203</div>
                            </div>
                            <div style={{ border: '1px solid #30363d', borderRadius: '6px', padding: '15px' }}>
                                <div style={{ color: '#58a6ff', fontWeight: 'bold' }}>React-Web-OS</div>
                                <p style={{ fontSize: '12px', color: '#8b949e', margin: '8px 0' }}>A customizable dashboard mimicking a desktop operating system environment.</p>
                                <div style={{ fontSize: '11px', color: '#8b949e' }}>🔵 React ★ 142</div>
                            </div>
                        </div>
                    </div>
                )}

                {currentTab === 'linkedin' && (
                    <div className={styles.profilePage} style={{ backgroundColor: '#f3f6f8', color: '#000', height: '100%' }}>
                        <div className={styles.profileHeader} style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0', padding: '20px' }}>
                            <div className={styles.profileAvatar} style={{ backgroundColor: '#0077b5' }}>👤</div>
                            <div className={styles.profileDetails}>
                                <h2 style={{ color: '#000' }}>Raza Ali</h2>
                                <p style={{ color: '#666', fontSize: '14px' }}>Senior Frontend Developer specializing in React and Web Applications</p>
                                <p style={{ color: '#888', fontSize: '12px', marginTop: '4px' }}>Karachi, Pakistan · Over 500+ connections</p>
                            </div>
                        </div>
                        <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0', padding: '20px', marginTop: '15px' }}>
                            <h3 style={{ margin: '0 0 10px 0' }}>About</h3>
                            <p style={{ fontSize: '13px', lineHeight: '1.5', color: '#333' }}>
                                Passionate software engineer with deep expertise in web technologies, React, and building engaging user interfaces. Dedicated to performance optimization and high-quality clean code.
                            </p>
                        </div>
                    </div>
                )}

                {currentTab === 'portfolio' && (
                    <div className={styles.profilePage} style={{ textAlign: 'center', paddingTop: '40px' }}>
                        <h1>Welcome to My PortfoliOS!</h1>
                        <p style={{ color: '#666', fontSize: '16px', maxWidth: '500px', margin: '10px auto' }}>
                            You are already using the most advanced interactive portfolio. Click desktop icons, open settings to personalize, run commands in terminal, or browse file systems!
                        </p>
                        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                            <button className={styles.gBtn} onClick={() => alert("You found an Easter egg! Type 'fastfetch' in the terminal.")}>Discover Easter Egg</button>
                        </div>
                    </div>
                )}

                {currentTab === 'dino' && <DinoGame />}
            </div>
        </div>
    );
}

function DinoGame() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isJumping, setIsJumping] = useState(false);
    const [dinoY, setDinoY] = useState(0);
    const [cactusX, setCactusX] = useState(480);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);

    useEffect(() => {
        if (!isPlaying || gameOver) return;

        const interval = setInterval(() => {
            // Move cactus
            setCactusX((prev) => {
                if (prev <= -20) {
                    setScore((s) => s + 10);
                    return 480;
                }
                return prev - 6;
            });

            // Handle gravity/jumping
            setDinoY((y) => {
                if (y > 0) {
                    return Math.max(0, y - 5);
                } else {
                    setIsJumping(false);
                    return 0;
                }
            });
        }, 15);

        return () => clearInterval(interval);
    }, [isPlaying, gameOver]);

    // Check collision
    useEffect(() => {
        if (!isPlaying || gameOver) return;

        // Dino is at left = 40px, width = 30px -> occupies 40px to 70px
        // Cactus is at left = cactusX, width = 18px -> occupies cactusX to cactusX + 18px
        // Collision if overlapping horizontally and dinoY is low
        if (cactusX > 22 && cactusX < 65 && dinoY < 25) {
            setGameOver(true);
            setIsPlaying(false);
            setHighScore((prev) => Math.max(prev, score));
        }
    }, [cactusX, dinoY, isPlaying, gameOver, score]);

    const jump = () => {
        if (gameOver) {
            setScore(0);
            setGameOver(false);
            setCactusX(480);
            setDinoY(0);
            setIsPlaying(true);
            return;
        }
        if (!isPlaying) {
            setIsPlaying(true);
            return;
        }
        if (!isJumping) {
            setIsJumping(true);
            setDinoY(65);
        }
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                jump();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPlaying, isJumping, dinoY, gameOver]);

    return (
        <div className={styles.dinoGame} onClick={jump}>
            <div className={styles.offlineMessage}>
                <div className={styles.offlineTitle}>🦖 Chrome Dino Game</div>
                <div className={styles.offlineDetails}>
                    No internet connection is simulated. Press Spacebar or Arrow Up to jump over obstacles.
                </div>
            </div>

            <div className={styles.gameArea}>
                <div className={styles.scoreBoard}>
                    HI {highScore.toString().padStart(5, '0')} {score.toString().padStart(5, '0')}
                </div>
                
                {/* Dino character (emoji) */}
                <div 
                    className={styles.dino} 
                    style={{ bottom: `${dinoY}px` }}
                >
                    🦖
                </div>

                {/* Cactus obstacle (emoji) */}
                <div 
                    className={styles.cactus} 
                    style={{ left: `${cactusX}px` }}
                >
                    🌵
                </div>

                {(!isPlaying || gameOver) && (
                    <div className={styles.gamePrompt}>
                        {gameOver ? '💥 GAME OVER 💥' : 'Press SPACE or Click to Play'}
                        <div style={{ fontSize: '11px', marginTop: '6px', color: '#666' }}>Click here to restart</div>
                    </div>
                )}
            </div>
        </div>
    );
}
