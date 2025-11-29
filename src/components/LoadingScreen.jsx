import { useState, useEffect } from 'react';
import styles from './LoadingScreen.module.css';

export default function LoadingScreen({ onComplete }) {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(onComplete, 500); // Small delay before finishing
                    return 100;
                }
                return prev + 2; // Adjust speed here
            });
        }, 30);

        return () => clearInterval(interval);
    }, [onComplete]);

    return (
        <div className={styles.loadingScreen}>
            <div className={styles.loadingContainer}>
                <div className={styles.loadingCircle}>
                    <svg viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" className={styles.circleBg} />
                        <circle
                            cx="50"
                            cy="50"
                            r="45"
                            className={styles.circleProgress}
                            style={{
                                strokeDasharray: 283,
                                strokeDashoffset: 283 - (283 * progress) / 100,
                            }}
                        />
                    </svg>
                    <div className="loading-text">{progress}%</div>
                </div>
                <div className="loading-message">INITIALIZING SYSTEM...</div>
            </div>
        </div>
    );
}
