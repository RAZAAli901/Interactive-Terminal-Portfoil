import { useState, useRef } from 'react';
import styles from './Notepad.module.css';

const CHEATSHEET = `========================================
 TERMINAL PORTFOLIO - COMMAND REFERENCE
========================================

about        - Learn more about me
projects     - View my projects
contact      - Get in touch
clear        - Clear the terminal
help         - Show this help message
fastfetch    - Show system info
sudo         - Run as administrator
wallpaper N  - Change wallpaper (1-12)
whoami       - Display professional summary

TIP: Use ↑/↓ arrow keys to navigate
     command history in the terminal.
========================================
`;

export default function Notepad() {
    const [content, setContent] = useState(CHEATSHEET);
    const textareaRef = useRef(null);

    const handleMenuClick = (action) => {
        if (action === 'new') {
            setContent('');
            textareaRef.current?.focus();
        } else if (action === 'save') {
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'notes.txt';
            a.click();
            URL.revokeObjectURL(url);
        } else if (action === 'selectAll') {
            textareaRef.current?.select();
        } else if (action === 'clear') {
            setContent('');
        } else if (action === 'commands') {
            setContent(CHEATSHEET);
        }
    };

    return (
        <div className={styles.notepadContainer}>
            <div className={styles.menuBar}>
                <div className={styles.menuItem}>
                    File
                    <div className={styles.dropdown}>
                        <div onClick={() => handleMenuClick('new')}>New</div>
                        <div onClick={() => handleMenuClick('save')}>Save as .txt...</div>
                    </div>
                </div>
                <div className={styles.menuItem}>
                    Edit
                    <div className={styles.dropdown}>
                        <div onClick={() => handleMenuClick('selectAll')}>Select All</div>
                        <div onClick={() => handleMenuClick('clear')}>Clear</div>
                    </div>
                </div>
                <div className={styles.menuItem}>
                    Help
                    <div className={styles.dropdown}>
                        <div onClick={() => handleMenuClick('commands')}>Show Commands</div>
                    </div>
                </div>
            </div>
            <textarea
                ref={textareaRef}
                className={styles.textArea}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                spellCheck="false"
            />
        </div>
    );
}
