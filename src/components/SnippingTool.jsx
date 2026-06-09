import { useState, useRef, useEffect } from 'react';
import styles from './SnippingTool.module.css';

export default function SnippingTool() {
    const [isCapturing, setIsCapturing] = useState(false);
    const [snipTaken, setSnipTaken] = useState(false);
    const [penColor, setPenColor] = useState('#ff0000');
    const [dragStart, setDragStart] = useState(null);
    const [selection, setSelection] = useState(null);

    const canvasRef = useRef(null);
    const isDrawingRef = useRef(false);

    // Trigger overlay capture
    const handleNewSnip = () => {
        setIsCapturing(true);
        setSnipTaken(false);
        setSelection(null);
    };

    const handleMouseDown = (e) => {
        setDragStart({ x: e.clientX, y: e.clientY });
        setSelection({ x: e.clientX, y: e.clientY, w: 0, h: 0 });
    };

    const handleMouseMove = (e) => {
        if (!dragStart) return;
        const x = Math.min(dragStart.x, e.clientX);
        const y = Math.min(dragStart.y, e.clientY);
        const w = Math.abs(dragStart.x - e.clientX);
        const h = Math.abs(dragStart.y - e.clientY);
        setSelection({ x, y, w, h });
    };

    const handleMouseUp = () => {
        if (!dragStart || !selection || selection.w < 10 || selection.h < 10) {
            setDragStart(null);
            setSelection(null);
            setIsCapturing(false);
            return;
        }

        setIsCapturing(false);
        setSnipTaken(true);
        setDragStart(null);
    };

    // Draw the mock snip on canvas
    useEffect(() => {
        if (snipTaken && canvasRef.current && selection) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            
            // Set canvas size matching selection
            canvas.width = Math.min(selection.w, 600);
            canvas.height = Math.min(selection.h, 400);

            // Draw a simulated captured wallpaper background on the canvas
            ctx.fillStyle = '#1e3050';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw beautiful abstract geometry representing the desktop wallpaper
            ctx.beginPath();
            ctx.arc(canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) / 3, 0, 2 * Math.PI);
            ctx.fillStyle = 'rgba(0, 164, 239, 0.4)';
            ctx.fill();

            ctx.beginPath();
            ctx.arc(canvas.width / 3, canvas.height * 0.7, Math.min(canvas.width, canvas.height) / 4, 0, 2 * Math.PI);
            ctx.fillStyle = 'rgba(230, 20, 100, 0.3)';
            ctx.fill();

            // Mock grid grid/folder items
            ctx.fillStyle = '#ffffff';
            ctx.font = '14px Segoe UI';
            ctx.fillText('📁 Screen Capture Snip', 20, 30);
            ctx.fillText('💻 Code Terminal', 20, 60);

            // Watermark
            ctx.fillStyle = 'rgba(255,255,255,0.2)';
            ctx.font = '10px monospace';
            ctx.fillText('PortfoliOS Snipping Tool', canvas.width - 150, canvas.height - 15);
        }
    }, [snipTaken, selection]);

    // Canvas drawing logic
    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const ctx = canvas.getContext('2d');
        
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
        isDrawingRef.current = true;
        ctx.strokeStyle = penColor;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
    };

    const draw = (e) => {
        if (!isDrawingRef.current) return;
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const ctx = canvas.getContext('2d');

        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
    };

    const stopDrawing = () => {
        isDrawingRef.current = false;
    };

    const handleClearCanvas = () => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Redraw base mock snip
        ctx.fillStyle = '#1e3050';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(0, 164, 239, 0.4)';
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) / 3, 0, 2 * Math.PI);
        ctx.fill();
    };

    const handleSave = () => {
        if (!canvasRef.current) return;
        const url = canvasRef.current.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Capture_Snip.png';
        a.click();
    };

    return (
        <div className={styles.snippingContainer}>
            <div className={styles.toolbar}>
                <button className={styles.btn} onClick={handleNewSnip}>✂️ New Snip</button>
                {snipTaken && (
                    <>
                        <button className={styles.btn} onClick={handleClearCanvas}>🗑️ Reset</button>
                        <button className={styles.btn} onClick={handleSave}>💾 Save Snip</button>
                        <div className={styles.penControls}>
                            <button 
                                className={`${styles.penColorBtn} ${penColor === '#ff0000' ? styles.penColorBtnActive : ''}`} 
                                style={{ backgroundColor: '#ff0000' }} 
                                onClick={() => setPenColor('#ff0000')}
                            />
                            <button 
                                className={`${styles.penColorBtn} ${penColor === '#00ff00' ? styles.penColorBtnActive : ''}`} 
                                style={{ backgroundColor: '#00ff00' }} 
                                onClick={() => setPenColor('#00ff00')}
                            />
                            <button 
                                className={`${styles.penColorBtn} ${penColor === '#ffff00' ? styles.penColorBtnActive : ''}`} 
                                style={{ backgroundColor: '#ffff00' }} 
                                onClick={() => setPenColor('#ffff00')}
                            />
                        </div>
                    </>
                )}
            </div>

            <div className={styles.canvasContainer}>
                {snipTaken ? (
                    <canvas 
                        ref={canvasRef}
                        className={styles.snipCanvas}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                    />
                ) : (
                    <div style={{ textAlign: 'center', color: '#888' }}>
                        <span style={{ fontSize: '32px' }}>✂️</span>
                        <p style={{ marginTop: '10px', fontSize: '13px' }}>Click "New Snip" and drag on the screen to capture a screenshot.</p>
                    </div>
                )}
            </div>

            {isCapturing && (
                <div 
                    className={styles.captureOverlay}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                >
                    <div className={styles.hintText}>Drag mouse to select area for snip</div>
                    {selection && (
                        <div 
                            style={{
                                position: 'absolute',
                                border: '2px dashed #00a4ef',
                                backgroundColor: 'rgba(0, 164, 239, 0.1)',
                                left: selection.x,
                                top: selection.y,
                                width: selection.w,
                                height: selection.h,
                                pointerEvents: 'none'
                            }}
                        />
                    )}
                </div>
            )}
        </div>
    );
}
