import { useState, useEffect, useRef } from 'react';
import styles from './Clock.module.css';

export default function Clock() {
    const [activeTab, setActiveTab] = useState('clock');
    
    // World Clock state
    const [time, setTime] = useState(new Date());

    const formatTimeZone = (offset) => {
        const utc = time.getTime() + (time.getTimezoneOffset() * 60000);
        const nd = new Date(utc + (3600000 * offset));
        return nd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Analogue clock hand angles
    const secs = time.getSeconds();
    const mins = time.getMinutes();
    const hrs = time.getHours();
    
    const secAngle = secs * 6;
    const minAngle = mins * 6 + secs * 0.1;
    const hrAngle = (hrs % 12) * 30 + mins * 0.5;

    // Stopwatch State
    const [swRunning, setSwRunning] = useState(false);
    const [swTime, setSwTime] = useState(0); // in ms
    const [laps, setLaps] = useState([]);
    const swIntervalRef = useRef(null);
    const swStartRef = useRef(0);

    const startStopwatch = () => {
        if (!swRunning) {
            swStartRef.current = Date.now() - swTime;
            swIntervalRef.current = setInterval(() => {
                setSwTime(Date.now() - swStartRef.current);
            }, 10);
            setSwRunning(true);
        } else {
            clearInterval(swIntervalRef.current);
            setSwRunning(false);
        }
    };

    const resetStopwatch = () => {
        clearInterval(swIntervalRef.current);
        setSwRunning(false);
        setSwTime(0);
        setLaps([]);
    };

    const recordLap = () => {
        if (swRunning) {
            setLaps(prev => [swTime, ...prev]);
        }
    };

    const formatStopwatch = (ms) => {
        const min = Math.floor(ms / 60000);
        const sec = Math.floor((ms % 60000) / 1000);
        const centi = Math.floor((ms % 1000) / 10);
        return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}.${centi.toString().padStart(2, '0')}`;
    };

    // Timer State
    const [timerHrs, setTimerHrs] = useState(0);
    const [timerMins, setTimerMins] = useState(5);
    const [timerSecs, setTimerSecs] = useState(0);
    const [timerTotal, setTimerTotal] = useState(300); // total seconds
    const [timerRemaining, setTimerRemaining] = useState(300); // remaining seconds
    const [timerRunning, setTimerRunning] = useState(false);
    const timerIntervalRef = useRef(null);

    const startTimer = () => {
        if (timerRunning) {
            clearInterval(timerIntervalRef.current);
            setTimerRunning(false);
        } else {
            if (timerRemaining === 0) {
                const total = timerHrs * 3600 + timerMins * 60 + timerSecs;
                if (total <= 0) return;
                setTimerTotal(total);
                setTimerRemaining(total);
            }
            setTimerRunning(true);
        }
    };

    useEffect(() => {
        if (timerRunning) {
            timerIntervalRef.current = setInterval(() => {
                setTimerRemaining(prev => {
                    if (prev <= 1) {
                        clearInterval(timerIntervalRef.current);
                        setTimerRunning(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            clearInterval(timerIntervalRef.current);
        }
        return () => clearInterval(timerIntervalRef.current);
    }, [timerRunning]);

    const resetTimer = () => {
        clearInterval(timerIntervalRef.current);
        setTimerRunning(false);
        const total = timerHrs * 3600 + timerMins * 60 + timerSecs;
        setTimerTotal(total);
        setTimerRemaining(total);
    };

    const handleTimerInputChange = (type, val) => {
        const v = Math.max(0, parseInt(val) || 0);
        if (type === 'h') setTimerHrs(v);
        if (type === 'm') setTimerMins(Math.min(59, v));
        if (type === 's') setTimerSecs(Math.min(59, v));
    };

    useEffect(() => {
        if (!timerRunning) {
            const total = timerHrs * 3600 + timerMins * 60 + timerSecs;
            setTimerTotal(total);
            setTimerRemaining(total);
        }
        // Only the entered duration should reseed the timer — reacting to
        // `timerRunning` here would reset it the moment it starts.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timerHrs, timerMins, timerSecs]);

    const formatTimer = (totalSeconds) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // SVG Circular progress details
    const strokeDashoffset = timerTotal > 0 ? (2 * Math.PI * 50) * (1 - timerRemaining / timerTotal) : 0;

    return (
        <div className={styles.clockContainer}>
            <div className={styles.tabs}>
                <div className={`${styles.tab} ${activeTab === 'clock' ? styles.activeTab : ''}`} onClick={() => setActiveTab('clock')}>Clock</div>
                <div className={`${styles.tab} ${activeTab === 'stopwatch' ? styles.activeTab : ''}`} onClick={() => setActiveTab('stopwatch')}>Stopwatch</div>
                <div className={`${styles.tab} ${activeTab === 'timer' ? styles.activeTab : ''}`} onClick={() => setActiveTab('timer')}>Timer</div>
                <div className={`${styles.tab} ${activeTab === 'world' ? styles.activeTab : ''}`} onClick={() => setActiveTab('world')}>World Clock</div>
            </div>

            <div className={styles.tabContent}>
                {activeTab === 'clock' && (
                    <>
                        <div className={styles.digitalClock}>
                            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                        <div className={styles.dateDisplay}>
                            {time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>
                        <svg className={styles.analogClock} viewBox="0 0 100 100">
                            {/* Dial */}
                            <circle cx="50" cy="50" r="45" fill="none" stroke="#fff" strokeWidth="2" />
                            {/* Tick marks */}
                            {[...Array(12)].map((_, i) => {
                                const angle = (i * 30 * Math.PI) / 180;
                                const x1 = 50 + 40 * Math.sin(angle);
                                const y1 = 50 - 40 * Math.cos(angle);
                                const x2 = 50 + 43 * Math.sin(angle);
                                const y2 = 50 - 43 * Math.cos(angle);
                                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fff" strokeWidth="2" />;
                            })}
                            {/* Hour hand */}
                            <line x1="50" y1="50" x2={50 + 25 * Math.sin((hrAngle * Math.PI) / 180)} y2={50 - 25 * Math.cos((hrAngle * Math.PI) / 180)} stroke="#0078d4" strokeWidth="4" strokeLinecap="round" />
                            {/* Minute hand */}
                            <line x1="50" y1="50" x2={50 + 35 * Math.sin((minAngle * Math.PI) / 180)} y2={50 - 35 * Math.cos((minAngle * Math.PI) / 180)} stroke="#fff" strokeWidth="3" strokeLinecap="round" />
                            {/* Second hand */}
                            <line x1="50" y1="50" x2={50 + 38 * Math.sin((secAngle * Math.PI) / 180)} y2={50 - 38 * Math.cos((secAngle * Math.PI) / 180)} stroke="#a80000" strokeWidth="1" strokeLinecap="round" />
                            {/* Center pin */}
                            <circle cx="50" cy="50" r="2.5" fill="#fff" />
                        </svg>
                    </>
                )}

                {activeTab === 'stopwatch' && (
                    <>
                        <div className={styles.timerDisplay}>{formatStopwatch(swTime)}</div>
                        <div className={styles.controls}>
                            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={startStopwatch}>
                                {swRunning ? 'Pause' : 'Start'}
                            </button>
                            <button className={styles.btn} onClick={recordLap} disabled={!swRunning}>Lap</button>
                            <button className={styles.btn} onClick={resetStopwatch}>Reset</button>
                        </div>
                        {laps.length > 0 && (
                            <div className={styles.lapsList}>
                                <div style={{ padding: '4px 10px', color: '#0078d4', fontSize: '12px' }}>
                                    Average Lap: {formatStopwatch(laps.reduce((a, b) => a + b, 0) / laps.length)}
                                </div>
                                {laps.map((lap, i) => (
                                    <div key={i} className={styles.lapItem}>
                                        <span>Lap {laps.length - i}</span>
                                        <span>{formatStopwatch(lap)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'world' && (
                    <div className={styles.worldClocks}>
                        <div className={styles.worldClockItem}>
                            <div className={styles.worldClockInfo}>
                                <span style={{ fontWeight: 'bold' }}>Lahore, Pakistan</span>
                                <span style={{ fontSize: '12px', color: '#a0a0a0' }}>GMT +5</span>
                            </div>
                            <span className={styles.worldClockTime}>{formatTimeZone(5)}</span>
                        </div>
                        <div className={styles.worldClockItem}>
                            <div className={styles.worldClockInfo}>
                                <span style={{ fontWeight: 'bold' }}>Silicon Valley, USA</span>
                                <span style={{ fontSize: '12px', color: '#a0a0a0' }}>GMT -7 (PDT)</span>
                            </div>
                            <span className={styles.worldClockTime}>{formatTimeZone(-7)}</span>
                        </div>
                        <div className={styles.worldClockItem}>
                            <div className={styles.worldClockInfo}>
                                <span style={{ fontWeight: 'bold' }}>London, UK</span>
                                <span style={{ fontSize: '12px', color: '#a0a0a0' }}>GMT +1 (BST)</span>
                            </div>
                            <span className={styles.worldClockTime}>{formatTimeZone(1)}</span>
                        </div>
                        <div className={styles.worldClockItem}>
                            <div className={styles.worldClockInfo}>
                                <span style={{ fontWeight: 'bold' }}>Tokyo, Japan</span>
                                <span style={{ fontSize: '12px', color: '#a0a0a0' }}>GMT +9</span>
                            </div>
                            <span className={styles.worldClockTime}>{formatTimeZone(9)}</span>
                        </div>
                    </div>
                )}
                {activeTab === 'timer' && (
                    <>
                        {!timerRunning && timerRemaining === timerTotal && (
                            <div className={styles.timerInputs}>
                                <div className={styles.inputGroup}>
                                    <label>Hours</label>
                                    <input type="number" min="0" value={timerHrs} onChange={(e) => handleTimerInputChange('h', e.target.value)} />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Minutes</label>
                                    <input type="number" min="0" max="59" value={timerMins} onChange={(e) => handleTimerInputChange('m', e.target.value)} />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Seconds</label>
                                    <input type="number" min="0" max="59" value={timerSecs} onChange={(e) => handleTimerInputChange('s', e.target.value)} />
                                </div>
                            </div>
                        )}

                        {(timerRunning || timerRemaining !== timerTotal) && (
                            <div className={styles.progressCircle}>
                                <svg width="120" height="120" viewBox="0 0 120 120">
                                    <circle cx="60" cy="60" r="50" fill="none" stroke="#333" strokeWidth="8" />
                                    <circle cx="60" cy="60" r="50" fill="none" stroke="#0078d4" strokeWidth="8"
                                        strokeDasharray={2 * Math.PI * 50}
                                        strokeDashoffset={strokeDashoffset}
                                        transform="rotate(-90 60 60)"
                                        strokeLinecap="round"
                                        style={{ transition: 'stroke-dashoffset 0.1s linear' }}
                                    />
                                </svg>
                                <div className={styles.progressText}>{formatTimer(timerRemaining)}</div>
                            </div>
                        )}

                        <div className={styles.controls}>
                            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={startTimer}>
                                {timerRunning ? 'Pause' : 'Start'}
                            </button>
                            <button className={styles.btn} onClick={resetTimer}>Reset</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
