import { useState, useEffect } from 'react';
import styles from './Calculator.module.css';

export default function Calculator() {
    const [display, setDisplay] = useState('0');
    const [equation, setEquation] = useState('');
    const [shouldReset, setShouldReset] = useState(false);
    const [isScientific, setIsScientific] = useState(false);

    const handleNumber = (num) => {
        if (display === '0' || shouldReset) {
            setDisplay(num);
            setShouldReset(false);
        } else {
            setDisplay(display + num);
        }
    };

    const handleOperator = (op) => {
        setEquation(display + ' ' + op + ' ');
        setShouldReset(true);
    };

    const handleEqual = () => {
        if (!equation) return;
        const fullEquation = equation + display;
        try {
            // Safe evaluation of simple math equations
            // Replace divide and multiply characters if any
            const sanitized = fullEquation.replace(/×/g, '*').replace(/÷/g, '/');
            // Basic validation
            if (!/^[0-9.+\-*/\s]+$/.test(sanitized)) {
                throw new Error("Invalid Input");
            }
            // Evaluate
            const result = Function(`"use strict"; return (${sanitized})`)();
            setDisplay(Number(result.toFixed(8)).toString());
            setEquation('');
            setShouldReset(true);
        } catch (e) {
            setDisplay('Error');
            setEquation('');
            setShouldReset(true);
        }
    };

    const handleClear = () => {
        setDisplay('0');
        setEquation('');
        setShouldReset(false);
    };

    const handleBackspace = () => {
        if (display.length > 1) {
            setDisplay(display.slice(0, -1));
        } else {
            setDisplay('0');
        }
    };

    const handleDecimal = () => {
        if (shouldReset) {
            setDisplay('0.');
            setShouldReset(false);
            return;
        }
        if (!display.includes('.')) {
            setDisplay(display + '.');
        }
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            const key = e.key;
            if (/[0-9]/.test(key)) {
                handleNumber(key);
            } else if (key === '+' || key === '-' || key === '*' || key === '/') {
                handleOperator(key);
            } else if (key === 'Enter' || key === '=') {
                handleEqual();
            } else if (key === 'Backspace') {
                handleBackspace();
            } else if (key === 'Escape') {
                handleClear();
            } else if (key === '.') {
                handleDecimal();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [display, equation, shouldReset]);

    const handleScientific = (op) => {
        try {
            const val = parseFloat(display);
            if (isNaN(val)) return;
            let result;
            if (op === 'sin') result = Math.sin((val * Math.PI) / 180);
            else if (op === 'cos') result = Math.cos((val * Math.PI) / 180);
            else if (op === 'tan') result = Math.tan((val * Math.PI) / 180);
            else if (op === 'log') result = Math.log10(val);
            else if (op === 'sqrt') result = Math.sqrt(val);
            
            setDisplay(Number(result.toFixed(6)).toString());
            setShouldReset(true);
        } catch (e) {
            setDisplay('Error');
            setShouldReset(true);
        }
    };

    return (
        <div className={styles.calculator}>
            <div className={styles.display}>
                <div className={styles.history}>{equation}</div>
                <div className={styles.current}>{display}</div>
            </div>
            <div className={styles.buttons}>
                <button className={styles.btn} style={{ gridColumn: 'span 2', background: '#555', color: '#fff' }} onClick={() => setIsScientific(!isScientific)}>
                    {isScientific ? 'Standard' : 'Scientific'}
                </button>
                {isScientific && (
                    <>
                        <button className={styles.btn} style={{ background: '#252525', color: '#0078d4' }} onClick={() => handleScientific('sin')}>sin</button>
                        <button className={styles.btn} style={{ background: '#252525', color: '#0078d4' }} onClick={() => handleScientific('cos')}>cos</button>
                        <button className={styles.btn} style={{ background: '#252525', color: '#0078d4' }} onClick={() => handleScientific('tan')}>tan</button>
                        <button className={styles.btn} style={{ background: '#252525', color: '#0078d4' }} onClick={() => handleScientific('sqrt')}>√</button>
                    </>
                )}
                <button className={`${styles.btn} ${styles.clear}`} onClick={handleClear}>C</button>
                <button className={`${styles.btn} ${styles.operator}`} onClick={handleBackspace}>⌫</button>
                <button className={`${styles.btn} ${styles.operator}`} onClick={() => handleOperator('/')}>÷</button>
                <button className={`${styles.btn} ${styles.operator}`} onClick={() => handleOperator('*')}>×</button>

                <button className={styles.btn} onClick={() => handleNumber('7')}>7</button>
                <button className={styles.btn} onClick={() => handleNumber('8')}>8</button>
                <button className={styles.btn} onClick={() => handleNumber('9')}>9</button>
                <button className={`${styles.btn} ${styles.operator}`} onClick={() => handleOperator('-')}>-</button>

                <button className={styles.btn} onClick={() => handleNumber('4')}>4</button>
                <button className={styles.btn} onClick={() => handleNumber('5')}>5</button>
                <button className={styles.btn} onClick={() => handleNumber('6')}>6</button>
                <button className={`${styles.btn} ${styles.operator}`} onClick={() => handleOperator('+')}>+</button>

                <button className={styles.btn} onClick={() => handleNumber('1')}>1</button>
                <button className={styles.btn} onClick={() => handleNumber('2')}>2</button>
                <button className={styles.btn} onClick={() => handleNumber('3')}>3</button>
                <button className={`${styles.btn} ${styles.equals}`} style={{ gridRow: 'span 2', height: '100%' }} onClick={handleEqual}>=</button>

                <button className={styles.btn} style={{ gridColumn: 'span 2' }} onClick={() => handleNumber('0')}>0</button>
                <button className={styles.btn} onClick={handleDecimal}>.</button>
            </div>
        </div>
    );
}
