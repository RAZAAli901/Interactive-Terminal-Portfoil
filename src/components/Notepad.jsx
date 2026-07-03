import { useState, useRef } from 'react';
import styles from './Notepad.module.css';

const CHEATSHEET = `=========================================================
      PORTFOLIOS DESKTOP - SYSTEM MANUAL & CHEATSHEET
=========================================================

1. SECURITY & ELEVATED ACCESS
---------------------------------------------------------
SUDO PASSWORD: admin

To execute administrative commands in the terminal, run:
  sudo
  (and enter "admin" when prompted)

To run a single command as admin:
  sudo [command] (e.g. "sudo wallpaper 5")

To log out of the administrator session, run:
  exit


2. TERMINAL COMMAND REFERENCE
---------------------------------------------------------
help         - List all available commands
about        - Learn more about me & my background
projects     - View my software engineering projects
contact      - Get in touch / contact details
fastfetch    - Show system hardware & OS information
clear        - Clear the terminal screen history
whoami       - Display a summary of my background
wallpaper N  - Change wallpaper ID (1-12) [Requires Sudo]
exit         - Exit administrative session [Requires Sudo]

Pro-Tip: Use the UP (↑) and DOWN (↓) arrow keys in the
terminal to cycle through your command history.


3. INTERACTIVE DESKTOP FEATURES
---------------------------------------------------------
• Settings App: Change desktop wallpapers, check system
  specifications, and view developer details.
• File Explorer: Double-click local files (e.g. text
  documents, pictures) to open them in their native apps.
• Microsoft Store: Search and dynamically install new apps
  like Visual Studio Code or MineSweeper!
• Playable Apps: Play MineSweeper or the Card Memory game,
  use the Clock/Stopwatch/Timer, or calculate math in the
  Calculator app.
=========================================================
`;

export default function Notepad() {
    const [content, setContent] = useState(CHEATSHEET);
    const [fontSize, setFontSize] = useState('14px');
    const [fontFamily, setFontFamily] = useState('monospace');
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
                    Format
                    <div className={styles.dropdown}>
                        <div onClick={() => setFontSize('12px')}>Small Text</div>
                        <div onClick={() => setFontSize('14px')}>Medium Text</div>
                        <div onClick={() => setFontSize('18px')}>Large Text</div>
                        <div onClick={() => setFontFamily('monospace')}>Monospace</div>
                        <div onClick={() => setFontFamily('sans-serif')}>Sans-Serif</div>
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
                className={styles.textArea} style={{ fontSize: fontSize, fontFamily: fontFamily }}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                spellCheck="false"
            />
        </div>
    );
}
