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


}
