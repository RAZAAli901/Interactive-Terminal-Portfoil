import { useState, useEffect } from 'react';
import styles from './LoadingScreen.module.css';

export default function LoadingScreen({ onComplete }) {
    const [progress, setProgress] = useState(0);
    const [isFadingOut, setIsFadingOut] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setIsFadingOut(true);
                    setTimeout(onComplete, 800); // Wait for fade out
                    return 100;
                }
                return prev + Math.floor(Math.random() * 5) + 2; // Random chunks for realism
            });
        }, 50);

        return () => clearInterval(interval);
    }, [onComplete]);

    return (
        <div className={`${styles.loadingScreen} ${isFadingOut ? styles.fadeOut : ''}`}>
            <div className={styles.loadingContainer}>
                <div className={styles.windowsLogo}>
                    <div className={styles.winIcon}></div>
                </div>
                <div className={styles.bootText}>Starting portfolio...</div>
                <div className={styles.progressBarContainer}>
                    <div 
                        className={styles.progressBar}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
