import { useState, useEffect } from 'react';
import styles from './Solitaire.module.css';

const TECH_CARDS = [
    { name: 'HTML', icon: '🌐' },
    { name: 'CSS', icon: '🎨' },
    { name: 'JS', icon: '💛' },
    { name: 'React', icon: '⚛️' },
    { name: 'Node', icon: '🟢' },
    { name: 'Git', icon: '🐙' },
    { name: 'Docker', icon: '🐳' },
    { name: 'Python', icon: '🐍' }
];

export default function Solitaire() {
    const [cards, setCards] = useState([]);
    const [flippedCards, setFlippedCards] = useState([]);
    const [matchedCards, setMatchedCards] = useState([]);
    const [moves, setMoves] = useState(0);
    const [seconds, setSeconds] = useState(0);
    const [isWon, setIsWon] = useState(false);
    const [timerActive, setTimerActive] = useState(false);

    // Initial shuffle
    const initGame = () => {
        const doubleTechs = [...TECH_CARDS, ...TECH_CARDS].map((tech, idx) => ({
            ...tech,
            id: idx,
            isFlipped: false,
            isMatched: false
        }));

        // Shuffle cards
        for (let i = doubleTechs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [doubleTechs[i], doubleTechs[j]] = [doubleTechs[j], doubleTechs[i]];
        }

        setCards(doubleTechs);
        setFlippedCards([]);
        setMatchedCards([]);
        setMoves(0);
        setSeconds(0);
        setIsWon(false);
        setTimerActive(false);
    };

    useEffect(() => {
        initGame();
    }, []);

    // Game Timer
    useEffect(() => {
        let interval = null;
        if (timerActive && !isWon) {
            interval = setInterval(() => {
                setSeconds(prev => prev + 1);
            }, 1000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [timerActive, isWon]);

    const handleCardClick = (cardId) => {
        if (flippedCards.length === 2 || matchedCards.includes(cardId)) return;
        
        // Start timer on first move
        if (!timerActive) {
            setTimerActive(true);
        }

        const clickedCard = cards.find(c => c.id === cardId);
        if (flippedCards.includes(clickedCard)) return;

        const newFlipped = [...flippedCards, clickedCard];
        setFlippedCards(newFlipped);

        if (newFlipped.length === 2) {
            setMoves(prev => prev + 1);
            const [first, second] = newFlipped;

            if (first.name === second.name) {
                // Matched
                setMatchedCards(prev => {
                    const nextMatched = [...prev, first.id, second.id];
                    if (nextMatched.length === cards.length) {
                        setIsWon(true);
                        setTimerActive(false);
                    }
                    return nextMatched;
                });
                setFlippedCards([]);
            } else {
                // Not Matched, flip back after a delay
                setTimeout(() => {
                    setFlippedCards([]);
                }, 1000);
            }
        }
    };

    const formatTime = (totalSecs) => {
        const min = Math.floor(totalSecs / 60);
        const sec = totalSecs % 60;
        return `${min}:${sec.toString().padStart(2, '0')}`;
    };

    if (isWon) {
        return (
            <div className={styles.solitaireContainer}>
                <div className={styles.winOverlay}>
                    <div className={styles.winTitle}>🎉 VICTORY! 🎉</div>
                    <p style={{ fontSize: '18px', marginBottom: '10px' }}>You matched all technologies!</p>
                    <p style={{ color: '#aaa', marginBottom: '20px' }}>
                        Moves: <strong>{moves}</strong> | Time: <strong>{formatTime(seconds)}</strong>
                    </p>
                    <button className={styles.restartBtn} style={{ padding: '10px 24px', fontSize: '16px' }} onClick={initGame}>Play Again</button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.solitaireContainer}>
            <div className={styles.dashboard}>
                <div>Time: <strong>{formatTime(seconds)}</strong></div>
                <div>Moves: <strong>{moves}</strong></div>
                <button className={styles.restartBtn} onClick={initGame}>Restart</button>
            </div>
            
            <div className={styles.grid}>
                {cards.map(card => {
                    const isFlipped = flippedCards.includes(card) || matchedCards.includes(card.id);
                    const isMatched = matchedCards.includes(card.id);

                    return (
                        <div 
                            key={card.id}
                            className={`${styles.card} ${isFlipped ? styles.flipped : ''} ${isMatched ? styles.matched : ''}`}
                            onClick={() => handleCardClick(card.id)}
                        >
                            <div className={styles.cardInner}>
                                <div className={styles.cardBack}>♠️</div>
                                <div className={styles.cardFront}>{card.icon}</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
