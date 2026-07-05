import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './DinoGame.module.css';

// ─── Constants ───────────────────────────────────────────────────────────────
const GAME_WIDTH = 600;
const GAME_HEIGHT = 160;
const GROUND_Y = 0;            // px from bottom (dino rests here)
const DINO_LEFT = 60;
const DINO_W = 38;
const DINO_H = 42;

// Jump arc: initial velocity and gravity per tick (20 ms)
const JUMP_VELOCITY = 14;      // px per tick upward
const GRAVITY = 0.9;           // px² per tick (applied each tick)
const MAX_JUMP_HOLD = 12;      // extra ticks of reduced gravity when holding

// Obstacle definitions
const OBSTACLE_TYPES = [
  { id: 'cactus',       emoji: '🌵', w: 22, h: 38, groundOffset: 0,  points: 10 },
  { id: 'cactus2',      emoji: '🌵🌵', w: 40, h: 38, groundOffset: 0,  points: 15 },
  { id: 'rock',         emoji: '🪨', w: 28, h: 22, groundOffset: 0,  points: 10 },
  { id: 'bird',         emoji: '🐦', w: 28, h: 22, groundOffset: 50, points: 20 }, // flies high
  { id: 'bird_low',     emoji: '🦅', w: 28, h: 22, groundOffset: 20, points: 15 }, // low bird
  { id: 'mushroom',     emoji: '🍄', w: 22, h: 26, groundOffset: 0,  points: 10 },
  { id: 'skull',        emoji: '💀', w: 24, h: 28, groundOffset: 0,  points: 20 }, // rare
];

const DAY_DURATION = 800;    // frames until night starts
const NIGHT_DURATION = 500;  // frames of night

// ─── Utility ─────────────────────────────────────────────────────────────────
function pickObstacle(score) {
  // As score grows, unlock harder/more varied obstacles
  let pool = [OBSTACLE_TYPES[0]]; // always have cactus
  if (score >= 50)  pool.push(OBSTACLE_TYPES[1]); // double cactus
  if (score >= 100) pool.push(OBSTACLE_TYPES[2]); // rock
  if (score >= 150) pool.push(OBSTACLE_TYPES[3]); // high bird
  if (score >= 200) pool.push(OBSTACLE_TYPES[4]); // low bird
  if (score >= 300) pool.push(OBSTACLE_TYPES[5]); // mushroom
  if (score >= 500) pool.push(OBSTACLE_TYPES[6]); // skull
  return pool[Math.floor(Math.random() * pool.length)];
}

function getSpeed(score) {
  // Base speed 5, +0.5 per 100 score, capped at 14
  return Math.min(5 + Math.floor(score / 100) * 0.5, 14);
}

// ─── Cloud component ─────────────────────────────────────────────────────────
function Cloud({ x, y }) {
  return (
    <div className={styles.cloud} style={{ left: x, bottom: y }}>☁️</div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DinoGame({ onScoreReach999 }) {
  // Game state
  const [phase, setPhase] = useState('idle'); // 'idle' | 'playing' | 'dead'
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try { return parseInt(localStorage.getItem('dinoHighScore') || '0', 10); } catch { return 0; }
  });
  const [newRecord, setNewRecord] = useState(false);
  const [secretUnlocked, setSecretUnlocked] = useState(false);
  const [milestoneFlash, setMilestoneFlash] = useState(null);
  const lastMilestoneRef = useRef(0);
  const [speedUpFlash, setSpeedUpFlash] = useState(false);
  const lastSpeedLevelRef = useRef(0);

  // Dino physics
  const [dinoY, setDinoY] = useState(GROUND_Y);
  const [dinoFrame, setDinoFrame] = useState(0); // 0 or 1 for running frames
  const [isDucking, setIsDucking] = useState(false);
  const velRef = useRef(0);
  const isJumpingRef = useRef(false);
  const holdRef = useRef(0);     // frames key held
  const isDuckingRef = useRef(false);

  // Obstacle
  const [obstacle, setObstacle] = useState(null);
  const obstacleRef = useRef(null);
  const [obstacleX, setObstacleX] = useState(GAME_WIDTH + 50);

  // Clouds
  const [clouds, setClouds] = useState([
    { id: 1, x: 200, y: 90 },
    { id: 2, x: 420, y: 110 },
    { id: 3, x: 550, y: 80 },
  ]);

  // Day/Night
  const [dayNightFrame, setDayNightFrame] = useState(0);
  const [isNight, setIsNight] = useState(false);

  // Death particles
  const [particles, setParticles] = useState([]);

  // Ground scroll
  const [groundOffset, setGroundOffset] = useState(0);

  // Key state
  const keysRef = useRef({ space: false, up: false, down: false });

  // Refs for closure-free access
  const phaseRef = useRef('idle');
  const scoreRef = useRef(0);
  const dinoYRef = useRef(GROUND_Y);
  const obstacleXRef = useRef(GAME_WIDTH + 50);
  const dayNightRef = useRef(0);
  const cloudIdRef = useRef(10);

  // Sync refs
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { dinoYRef.current = dinoY; }, [dinoY]);
  useEffect(() => { obstacleXRef.current = obstacleX; }, [obstacleX]);
  useEffect(() => { obstacleRef.current = obstacle; }, [obstacle]);

  // ── jump / duck ─────────────────────────────────────────────────────────
  const doJump = useCallback(() => {
    if (phaseRef.current === 'dead') return;
    if (phaseRef.current === 'idle') {
      setPhase('playing');
      phaseRef.current = 'playing';
      return;
    }
    if (!isJumpingRef.current) {
      velRef.current = JUMP_VELOCITY;
      isJumpingRef.current = true;
      holdRef.current = 0;
    }
  }, []);

  // ── Key handlers ──────────────────────────────────────────────────────────
  useEffect(() => {
    const onDown = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (!keysRef.current.space) {
          keysRef.current.space = true;
          doJump();
        }
      }
      if (e.code === 'ArrowDown') {
        keysRef.current.down = true;
        isDuckingRef.current = true;
        setIsDucking(true);
      }
    };
    const onUp = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        keysRef.current.space = false;
      }
      if (e.code === 'ArrowDown') {
        keysRef.current.down = false;
        isDuckingRef.current = false;
        setIsDucking(false);
      }
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, [doJump]);

  // ── Game loop ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'playing') return;

    // Pick first obstacle
    if (!obstacleRef.current) {
      const obs = pickObstacle(0);
      setObstacle(obs);
      setObstacleX(GAME_WIDTH + 50);
      obstacleXRef.current = GAME_WIDTH + 50;
    }

    const interval = setInterval(() => {
      const currentScore = scoreRef.current;
      const speed = getSpeed(currentScore);

      // ── Physics ───────────────────────────────────────────────────────
      let newY = dinoYRef.current + velRef.current;
      // reduce gravity slightly if holding jump key
      const holdBonus = keysRef.current.space && holdRef.current < MAX_JUMP_HOLD ? 0.3 : 0;
      if (keysRef.current.space && isJumpingRef.current) {
        holdRef.current = (holdRef.current || 0) + 1;
      }
      velRef.current = velRef.current - (GRAVITY - holdBonus);

      if (newY <= GROUND_Y) {
        newY = GROUND_Y;
        velRef.current = 0;
        isJumpingRef.current = false;
      }

      setDinoY(newY);
      dinoYRef.current = newY;

      // ── Move obstacle ─────────────────────────────────────────────────
      let newX = obstacleXRef.current - speed;
      if (newX < -80) {
        // Passed! Add points
        const pts = obstacleRef.current?.points || 10;
        const nextScore = scoreRef.current + pts;
        setScore(nextScore);
        scoreRef.current = nextScore;

        // Milestone flash every 100 points
        const milestone = Math.floor(nextScore / 100);
        if (milestone > lastMilestoneRef.current) {
          lastMilestoneRef.current = milestone;
          setMilestoneFlash(`🎯 ${nextScore} POINTS!`);
          setTimeout(() => setMilestoneFlash(null), 1500);
        }

        // Speed up flash
        const newSpeedLevel = Math.floor(nextScore / 100);
        if (newSpeedLevel > lastSpeedLevelRef.current) {
          lastSpeedLevelRef.current = newSpeedLevel;
          setSpeedUpFlash(true);
          setTimeout(() => setSpeedUpFlash(false), 400);
        }

        // Check 999+
        if (nextScore >= 999 && !secretUnlocked) {
          setSecretUnlocked(true);
          if (onScoreReach999) onScoreReach999();
        }

        // Spawn next obstacle
        const nextObs = pickObstacle(nextScore);
        setObstacle(nextObs);
        newX = GAME_WIDTH + Math.random() * 200 + 80;
      }
      setObstacleX(newX);
      obstacleXRef.current = newX;

      // ── Ground scroll ─────────────────────────────────────────────────
      setGroundOffset(prev => (prev + speed) % 60);

      // ── Cloud scroll ──────────────────────────────────────────────────
      setClouds(prev => {
        let next = prev.map(c => ({ ...c, x: c.x - speed * 0.3 }));
        next = next.filter(c => c.x > -80);
        if (next.length < 3 || (Math.random() < 0.005)) {
          cloudIdRef.current++;
          next.push({ id: cloudIdRef.current, x: GAME_WIDTH + 60, y: 70 + Math.random() * 60 });
        }
        return next;
      });

      // ── Day/Night ─────────────────────────────────────────────────────
      dayNightRef.current += 1;
      const totalCycle = DAY_DURATION + NIGHT_DURATION;
      const cyclePos = dayNightRef.current % totalCycle;
      setDayNightFrame(cyclePos);
      setIsNight(cyclePos >= DAY_DURATION);

      // ── Dino animation ────────────────────────────────────────────────
      setDinoFrame(prev => (prev + 1) % 8);

      // ── Collision ─────────────────────────────────────────────────────
      if (obstacleRef.current) {
        const obs = obstacleRef.current;
        const obsY = obs.groundOffset || 0;
        const obsRight = newX + obs.w;
        const obsLeft = newX;
        const obsTop = obsY + obs.h;

        const dinoRight = DINO_LEFT + DINO_W - 8; // slight inset for fairness
        const dinoLeft = DINO_LEFT + 8;
        const dinoHeight = isDuckingRef.current ? DINO_H / 2 : DINO_H;
        const dinoTop = dinoYRef.current + dinoHeight;

        // Birds need to be jumped over (if low bird) or ducked under (if high bird)
        const isBird = obs.id.includes('bird');
        const horizMargin = isBird ? 4 : 8;  // birds have tighter box
        const birdDinoLeft = DINO_LEFT + horizMargin;
        const birdDinoRight = DINO_LEFT + DINO_W - horizMargin;
        const adjDinoLeft = isBird ? birdDinoLeft : dinoLeft;
        const adjDinoRight = isBird ? birdDinoRight : dinoRight;

        const horizOverlap = adjDinoRight > obsLeft && adjDinoLeft < obsRight;
        const vertOverlap = dinoYRef.current < obsTop && dinoTop > obsY;

        if (horizOverlap && vertOverlap) {
          // Spawn death particles
          const newParticles = Array.from({ length: 12 }, (_, i) => ({
            id: i,
            x: DINO_LEFT + 15,
            y: dinoYRef.current + 20,
            vx: (Math.random() - 0.5) * 6,
            vy: Math.random() * 5 + 2,
            life: 1.0,
          }));
          setParticles(newParticles);

          // Check high score
          const finalScore = scoreRef.current;
          setHighScore(prev => {
            const newHigh = Math.max(prev, finalScore);
            if (finalScore > prev) {
              setNewRecord(true);
              try { localStorage.setItem('dinoHighScore', String(newHigh)); } catch {}
            }
            return newHigh;
          });

          setPhase('dead');
          phaseRef.current = 'dead';
        }
      }
    }, 20);

    return () => clearInterval(interval);
  }, [phase, isDucking, secretUnlocked, onScoreReach999]);

  // ── Particle decay ────────────────────────────────────────────────────────
  useEffect(() => {
    if (particles.length === 0) return;
    const interval = setInterval(() => {
      setParticles(prev => prev
        .map(p => ({ ...p, x: p.x + p.vx, y: p.y - p.vy, life: p.life - 0.05 }))
        .filter(p => p.life > 0)
      );
    }, 30);
    return () => clearInterval(interval);
  }, [particles]);

  // ── Restart ───────────────────────────────────────────────────────────────
  const restart = useCallback(() => {
    setPhase('idle');
    setScore(0);
    scoreRef.current = 0;
    setDinoY(GROUND_Y);
    dinoYRef.current = GROUND_Y;
    setObstacle(null);
    setObstacleX(GAME_WIDTH + 50);
    obstacleXRef.current = GAME_WIDTH + 50;
    velRef.current = 0;
    isJumpingRef.current = false;
    holdRef.current = 0;
    setNewRecord(false);
    setParticles([]);
    dayNightRef.current = 0;
    setIsNight(false);
    setGroundOffset(0);
    lastMilestoneRef.current = 0;
    lastSpeedLevelRef.current = 0;
    setSpeedUpFlash(false);
  }, []);

  // ── Compute sky colour based on day/night cycle ───────────────────────────
  const totalCycle = DAY_DURATION + NIGHT_DURATION;
  const cyclePos = dayNightFrame;
  let skyBg, groundColor, textColor;
  if (cyclePos < DAY_DURATION) {
    // Day: white/light blue
    const t = cyclePos / DAY_DURATION;
    const dusk = t > 0.85 ? (t - 0.85) / 0.15 : 0;
    skyBg = dusk > 0
      ? `linear-gradient(to bottom, hsl(${220 - dusk * 30},${60 - dusk * 40}%,${80 - dusk * 20}%), hsl(${30 + dusk * 10},${70 * dusk}%,${95 - dusk * 20}%))`
      : '#f7f7f7';
    groundColor = dusk > 0 ? `hsl(30, ${20 * dusk}%, ${70 - dusk * 15}%)` : '#535353';
    textColor = '#535353';
  } else {
    // Night: dark blue
    const t = (cyclePos - DAY_DURATION) / NIGHT_DURATION;
    const dawn = t > 0.8 ? (t - 0.8) / 0.2 : 0;
    skyBg = dawn > 0
      ? `linear-gradient(to bottom, hsl(${200 + dawn * 20},${50 + dawn * 10}%,${10 + dawn * 70}%), hsl(30,${50 * dawn}%,${40 + dawn * 55}%))`
      : 'linear-gradient(to bottom, #0a0a1a, #1a1a2e)';
    groundColor = dawn > 0 ? `hsl(30, ${20 * dawn}%, ${40 + dawn * 30}%)` : '#8888aa';
    textColor = '#aaaacc';
  }

  // ── Dino emoji selection ──────────────────────────────────────────────────
  const dinoEmoji = isDucking ? '🦎' : (dinoFrame < 4 ? '🦖' : '🦕');

  // ── Stars (night only) ────────────────────────────────────────────────────
  const stars = isNight ? [
    { x: 80, y: 30 }, { x: 150, y: 15 }, { x: 260, y: 40 },
    { x: 340, y: 20 }, { x: 450, y: 35 }, { x: 520, y: 12 }, { x: 580, y: 28 }
  ] : [];

  return (
    <div
      className={styles.dinoGame}
      onClick={phase === 'dead' ? restart : doJump}
      onTouchStart={(e) => { e.preventDefault(); phase === 'dead' ? restart() : doJump(); }}
    >
      {/* Header */}
      <div className={styles.header} style={{ color: textColor }}>
        <div className={styles.headerTitle}>
          🦖 Chrome Dino — {isNight ? '🌙 Night Mode' : '☀️ Day Mode'}
        </div>
        <div className={styles.headerSub}>
          Space / ↑ to jump • ↓ to duck • Click/Tap to play
        </div>
        {secretUnlocked && (
          <div className={styles.secretBanner}>
            🏆 SECRET UNLOCKED! Type <code>dino-master</code> in the terminal!
          </div>
        )}
      </div>

      {/* Game Area */}
      <div
        className={styles.gameArea}
        style={{ background: skyBg, boxShadow: speedUpFlash ? '0 0 0 3px #ff4444 inset, 0 4px 20px rgba(0,0,0,0.15)' : '0 4px 20px rgba(0,0,0,0.15)' }}
      >
        {/* Score */}
        <div className={styles.scoreBoard} style={{ color: textColor }}>
          HI {highScore.toString().padStart(5, '0')} &nbsp; {score.toString().padStart(5, '0')}
          {phase === 'playing' && score > 0 && (
            <span className={styles.speedBadge}>
              LVL {Math.floor(score / 100) + 1}
            </span>
          )}
        </div>

        {/* Stars (night) */}
        {stars.map((s, i) => (
          <div key={i} className={styles.star} style={{ left: s.x, top: s.y }} />
        ))}

        {/* Sun or Moon */}
        {!isNight && (
          <div className={styles.sun} style={{ opacity: dayNightFrame > DAY_DURATION * 0.85 ? 0.3 : 1 }}>
            ☀️
          </div>
        )}
        {isNight && (
          <div className={styles.moon}>
            🌙
          </div>
        )}

        {/* Clouds */}
        {clouds.map(c => <Cloud key={c.id} x={c.x} y={c.y} />)}

        {/* Dino */}
        <div
          className={`${styles.dino} ${isDucking ? styles.dinoDucking : ''} ${isJumpingRef.current ? styles.dinoJumping : ''}`}
          style={{ bottom: dinoY + GROUND_Y, left: DINO_LEFT }}
        >
          {dinoEmoji}
        </div>

        {/* Obstacle */}
        {obstacle && phase !== 'idle' && (
          <div
            className={styles.obstacle}
            style={{
              left: obstacleX,
              bottom: obstacle.groundOffset,
              fontSize: obstacle.id.includes('bird') ? '22px' : '24px',
              width: obstacle.w,
            }}
          >
            {obstacle.emoji}
          </div>
        )}

        {/* Death particles */}
        {particles.map(p => (
          <div
            key={p.id}
            className={styles.particle}
            style={{
              left: p.x,
              bottom: p.y,
              opacity: p.life,
            }}
          >
            ✦
          </div>
        ))}

        {/* Ground line */}
        <div
          className={styles.ground}
          style={{
            borderColor: groundColor,
            backgroundPositionX: `-${groundOffset}px`,
          }}
        />

        {/* Milestone Flash */}
        {milestoneFlash && (
          <div className={styles.milestoneFlash}>{milestoneFlash}</div>
        )}

        {/* Overlay messages */}
        {phase === 'idle' && (
          <div className={styles.overlay}>
            <div className={styles.overlayTitle}>🦖</div>
            <div className={styles.overlayMsg}>Press SPACE or Tap to Start</div>
            <div className={styles.overlayHint}>↓ Duck under birds · ↑ Jump over obstacles</div>
          </div>
        )}
        {phase === 'dead' && (
          <div className={styles.overlay}>
            <div className={styles.overlayTitle}>💥 GAME OVER</div>
            {newRecord && <div className={styles.newRecord}>🏆 NEW RECORD! {score}</div>}
            <div className={styles.overlayMsg}>Score: {score}</div>
            <div className={styles.overlayHint}>Click / Space to Restart</div>
          </div>
        )}
      </div>

      {/* Milestone hints */}
      <div className={styles.milestones} style={{ color: textColor }}>
        {score < 50  && '🌵 More obstacles unlock at 50+ score'}
        {score >= 50  && score < 100 && '🪨 Rocks unlock at 100 · Birds at 150+'}
        {score >= 100 && score < 200 && '🐦 Watch out for birds!'}
        {score >= 200 && score < 500 && '🍄 Mushrooms incoming at 300!'}
        {score >= 500 && score < 999 && '💀 Elite mode! Reach 999 for a secret!'}
        {score >= 999 && '🎖️ LEGENDARY! Type dino-master in the terminal!'}
      </div>
    </div>
  );
}
