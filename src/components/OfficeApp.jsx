import { useState } from 'react';
import styles from './OfficeApp.module.css';

export default function OfficeApp({ appType }) {
    // Word State
    const [wordText, setWordText] = useState('Word Document\n\nType your content here. Use the toolbar below to align or format text.\n\nAuthor: Raza Ali');
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);
    const [textColor, setTextColor] = useState('#000000');

    // Excel State
    const [excelGrid, setExcelGrid] = useState({
        'A1': 'ID', 'B1': 'Project', 'C1': 'Role', 'D1': 'Status', 'E1': 'Rating',
        'A2': '101', 'B2': 'Windows PortfoliOS', 'C2': 'Lead Dev', 'D2': 'Completed', 'E2': '★★★★★',
        'A3': '102', 'B3': 'Chat AI widget', 'C3': 'Architect', 'D3': 'In Progress', 'E3': '★★★★☆',
        'A4': '103', 'B4': 'MineSweeper App', 'C4': 'UI Dev', 'D4': 'Completed', 'E4': '★★★★★',
        'A5': '104', 'B5': 'Word/Excel suite', 'C5': 'Backend', 'D5': 'Testing', 'E5': '★★★★☆',
    });
    const [selectedCell, setSelectedCell] = useState('A1');

    const handleExcelCellChange = (cellId, value) => {
        setExcelGrid(prev => ({ ...prev, [cellId]: value }));
    };

    // PowerPoint State
    const [pptSlide, setPptSlide] = useState(0);
    const [pptSlides, setPptSlides] = useState([
        { title: 'Portfolio Project Presentation', subtitle: 'Built by Raza Ali - Full-Stack Developer' },
        { title: 'Core Skills', subtitle: 'React, Redux, Node.js, Express, Javascript, CSS/HTML, Python' },
        { title: 'Highlights', subtitle: 'Drag & drop window systems, custom terminal, memory card match, playable minesweeper' }
    ]);
    const [isPresetFullScreen, setIsPresetFullScreen] = useState(false);

    // OneNote State
    const [oneNoteActivePage, setOneNoteActivePage] = useState('intro');
    const [oneNotePages, setOneNotePages] = useState({
        intro: { title: 'Welcome Notes', content: 'Use OneNote to write quick logs. Click pages on the left.' },
        todo: { title: 'Todo Checklist', content: '1. Refactor window components [Done]\n2. Add settings custom wallpaper [Done]\n3. Play card match memory game [Done]\n4. Drink coffee [Done]' },
        ideas: { title: 'Future App Ideas', content: '- Add Paint drawing application\n- Add mock music player widget\n- Add File Explorer file upload simulator' }
    });

    // Outlook State
    const [outlookEmails] = useState([
        {
            id: 1,
            sender: 'Hiring Team <hiring@techcorp.com>',
            subject: 'Job Opportunity: Senior Full-Stack Engineer',
            preview: 'Hi Raza, we saw your portfolio OS and would love to...',
            date: '10:42 AM',
            body: `Hi Raza,

We came across your interactive Windows-style portfolio and were absolutely blown away by the execution and details! 

We are currently looking for a Senior Full-Stack React Engineer to lead our new client dashboard team. Your skill set in React, Node, and Tailwind aligns perfectly with what we need.

Are you open to a 20-minute introductory call tomorrow? Let us know what time works best for you!

Best regards,
Sarah Jenkins
Recruiting Lead, TechCorp`
        },
        {
            id: 2,
            sender: 'GitHub Notifications <noreply@github.com>',
            subject: 'PR Approved: refactor-window-focus-stacking',
            preview: 'Your Pull Request has been merged into main successfully.',
            date: 'Yesterday',
            body: `Raza Ali,

Your Pull Request #14 "Refactor window system to use dynamic object state and coordinated z-index stacking" has been reviewed, approved, and merged into main.

Commits:
- a78fc2b: Implement dynamic z-index coordination
- b89fa3d: Link Start Menu icons to click handlers
- c89e24f: Add desktop shortcuts for Chat and Web Browser

Total Changes: +284 lines, -42 lines.
All automated checks successfully passed.`
        },
        {
            id: 3,
            sender: 'Tech Community <news@devweekly.io>',
            subject: 'Dev Weekly: Top 10 React 19 Features You Need to Know',
            preview: 'React 19 is officially here! Let\'s look at actions, use(), and...',
            date: 'June 8',
            body: `Hello Developer,

Welcome to Dev Weekly!

React 19 introduces major features including:
1. Server Components out of the box.
2. The new 'use()' hook for consuming promises and context.
3. Form Actions to simplify state handling.
4. Auto-cleaning of references and ref improvements.

Read the full deep dive on our site to stay ahead of the curve!

Cheers,
The Dev Weekly Editors`
        }
    ]);
    const [activeEmailId, setActiveEmailId] = useState(1);
    const activeEmail = outlookEmails.find(e => e.id === activeEmailId);

    // Render app templates
    if (appType === 'word' || appType === 'onenote') {
        const isOneNote = appType === 'onenote';
        return (
            <div className={styles.officeContainer}>
                <div className={styles.wordToolbar} style={{ backgroundColor: isOneNote ? '#802f80' : '#0078d4', color: '#fff' }}>
                    {isOneNote ? (
                        <div style={{ fontWeight: 'bold', fontSize: '14px' }}>OneNote Notebook</div>
                    ) : (
                        <>
                            <button className={`${styles.wordBtn} ${isBold ? styles.wordActive : ''}`} style={{ color: '#fff' }} onClick={() => setIsBold(!isBold)}><strong>B</strong></button>
                            <button className={`${styles.wordBtn} ${isItalic ? styles.wordActive : ''}`} style={{ color: '#fff' }} onClick={() => setIsItalic(!isItalic)}><em>I</em></button>
                            <button className={`${styles.wordBtn} ${isUnderline ? styles.wordActive : ''}`} style={{ color: '#fff' }} onClick={() => setIsUnderline(!isUnderline)}><u>U</u></button>
                            <input 
                                type="color" 
                                value={textColor} 
                                onChange={(e) => setTextColor(e.target.value)} 
                                style={{ border: 'none', background: 'transparent', width: '24px', height: '24px', cursor: 'default' }} 
                            />
                        </>
                    )}
                </div>
                {isOneNote ? (
                    <div style={{ display: 'flex', flex: 1, backgroundColor: '#fff' }}>
                        <div style={{ width: '180px', backgroundColor: '#f3f2f1', borderRight: '1px solid #d2d0ce', padding: '10px' }}>
                            {Object.entries(oneNotePages).map(([key, page]) => (
                                <div 
                                    key={key} 
                                    style={{ 
                                        padding: '8px 12px', 
                                        borderRadius: '4px', 
                                        fontSize: '13px', 
                                        cursor: 'default',
                                        backgroundColor: oneNoteActivePage === key ? '#eaeaea' : 'transparent',
                                        fontWeight: oneNoteActivePage === key ? 'bold' : 'normal'
                                    }}
                                    onClick={() => setOneNoteActivePage(key)}
                                >
                                    📓 {page.title}
                                </div>
                            ))}
                        </div>
                        <div style={{ flex: 1, padding: '20px' }}>
                            <h2 style={{ margin: '0 0 10px 0', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>{oneNotePages[oneNoteActivePage].title}</h2>
                            <textarea 
                                style={{ width: '100%', height: 'calc(100% - 40px)', border: 'none', resize: 'none', outline: 'none', fontSize: '14px', lineHeight: '1.6' }}
                                value={oneNotePages[oneNoteActivePage].content}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setOneNotePages(prev => ({
                                        ...prev,
                                        [oneNoteActivePage]: { ...prev[oneNoteActivePage], content: val }
                                    }));
                                }}
                            />
                        </div>
                    </div>
                ) : (
                    <div className={styles.wordPageContainer}>
                        <textarea 
                            className={styles.wordPage}
                            value={wordText}
                            onChange={(e) => setWordText(e.target.value)}
                            style={{ 
                                fontWeight: isBold ? 'bold' : 'normal',
                                fontStyle: isItalic ? 'italic' : 'normal',
                                textDecoration: isUnderline ? 'underline' : 'none',
                                color: textColor,
                                border: 'none',
                                resize: 'none'
                            }}
                        />
                    </div>
                )}
            </div>
        );
    }

    if (appType === 'excel') {
        const columns = [' ', 'A', 'B', 'C', 'D', 'E'];
        const rows = [1, 2, 3, 4, 5, 6];

        return (
            <div className={styles.officeContainer}>
                <div className={styles.excelToolbar} style={{ backgroundColor: '#107c41', color: '#fff', fontWeight: 'bold' }}>
                    Excel Spreadsheet
                </div>
                <div className={styles.excelFormulaBar}>
                    <span className={styles.formulaLabel}>{selectedCell}:</span>
                    <input 
                        type="text" 
                        className={styles.formulaInput} 
                        value={excelGrid[selectedCell] || ''} 
                        onChange={(e) => handleExcelCellChange(selectedCell, e.target.value)}
                        placeholder="Enter value or formula..."
                    />
                </div>
                <div className={styles.excelGridContainer}>
                    <table className={styles.excelTable}>
                        <thead>
                            <tr>
                                {columns.map(col => <th key={col} style={{ width: col === ' ' ? '40px' : '120px' }}>{col}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map(row => (
                                <tr key={row}>
                                    <th>{row}</th>
                                    {columns.slice(1).map(col => {
                                        const cellId = `${col}${row}`;
                                        return (
                                            <td 
                                                key={col}
                                                className={styles.excelCell}
                                                contentEditable
                                                suppressContentEditableWarning
                                                onFocus={() => setSelectedCell(cellId)}
                                                onBlur={(e) => handleExcelCellChange(cellId, e.target.innerText)}
                                                style={{
                                                    outline: selectedCell === cellId ? '2px solid #107c41' : 'none'
                                                }}
                                            >
                                                {excelGrid[cellId] || ''}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    if (appType === 'powerpoint') {
        const activeSlideData = pptSlides[pptSlide];

        return (
            <div className={styles.officeContainer}>
                <div className={styles.excelToolbar} style={{ backgroundColor: '#c43e1c', color: '#fff', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>PowerPoint Slideshow</span>
                    <button 
                        style={{ border: 'none', backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff', borderRadius: '4px', padding: '3px 8px', fontSize: '11px', cursor: 'default' }}
                        onClick={() => setIsPresetFullScreen(true)}
                    >
                        🖥️ Present
                    </button>
                </div>
                <div className={styles.pptContainer}>
                    <div className={styles.pptSidebar}>
                        {pptSlides.map((slide, index) => (
                            <div 
                                key={index}
                                className={`${styles.pptSlideThumb} ${pptSlide === index ? styles.pptSlideThumbActive : ''}`}
                                onClick={() => setPptSlide(index)}
                            >
                                <span style={{ color: '#888' }}>{index + 1}</span>
                                <div style={{ fontSize: '9px', fontWeight: 'bold', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{slide.title}</div>
                            </div>
                        ))}
                    </div>
                    <div className={styles.pptMain}>
                        <div className={styles.pptSlideEditor}>
                            <input 
                                type="text"
                                style={{ fontSize: '22px', fontWeight: 'bold', border: 'none', outline: 'none', width: '100%', textAlign: 'center', margin: '10px 0' }}
                                value={activeSlideData.title}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setPptSlides(prev => prev.map((s, idx) => idx === pptSlide ? { ...s, title: val } : s));
                                }}
                            />
                            <textarea 
                                style={{ fontSize: '13px', color: '#666', border: 'none', outline: 'none', width: '100%', textAlign: 'center', resize: 'none', height: '80px' }}
                                value={activeSlideData.subtitle}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setPptSlides(prev => prev.map((s, idx) => idx === pptSlide ? { ...s, subtitle: val } : s));
                                }}
                            />
                        </div>
                    </div>
                </div>

                {isPresetFullScreen && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000', color: '#fff', zIndex: 99999, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px' }} onClick={() => setIsPresetFullScreen(false)}>
                        <h1 style={{ fontSize: '42px', margin: '0 0 20px 0', textAlign: 'center' }}>{activeSlideData.title}</h1>
                        <p style={{ fontSize: '20px', color: '#ccc', textAlign: 'center' }}>{activeSlideData.subtitle}</p>
                        <div style={{ position: 'absolute', bottom: '20px', left: '20px', fontSize: '12px', color: '#555' }}>
                            Click anywhere to exit Presentation mode | Slide {pptSlide + 1} of {pptSlides.length}
                        </div>
                        <div style={{ position: 'absolute', bottom: '20px', right: '20px', display: 'flex', gap: '10px' }} onClick={(e) => e.stopPropagation()}>
                            <button style={{ background: '#333', border: 'none', color: '#fff', width: '32px', height: '32px', cursor: 'default' }} onClick={() => setPptSlide(prev => (prev - 1 + pptSlides.length) % pptSlides.length)}>◀</button>
                            <button style={{ background: '#333', border: 'none', color: '#fff', width: '32px', height: '32px', cursor: 'default' }} onClick={() => setPptSlide(prev => (prev + 1) % pptSlides.length)}>▶</button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    if (appType === 'outlook') {
        return (
            <div className={styles.officeContainer}>
                <div className={styles.excelToolbar} style={{ backgroundColor: '#0078d4', color: '#fff', fontWeight: 'bold' }}>
                    Outlook Email
                </div>
                <div className={styles.outlookContainer}>
                    <div className={styles.outlookInbox}>
                        <div className={styles.outlookHeader}>Inbox</div>
                        <div className={styles.emailList}>
                            {outlookEmails.map(email => (
                                <div 
                                    key={email.id} 
                                    className={`${styles.emailItem} ${activeEmailId === email.id ? styles.emailActive : ''}`}
                                    onClick={() => setActiveEmailId(email.id)}
                                >
                                    <div className={styles.emailSender}>{email.sender.split(' <')[0]}</div>
                                    <div className={styles.emailSubject}>{email.subject}</div>
                                    <div className={styles.emailPreview}>{email.preview}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className={styles.outlookPane}>
                        {activeEmail ? (
                            <>
                                <div className={styles.emailDetailHeader}>
                                    <div className={styles.emailDetailSubj}>{activeEmail.subject}</div>
                                    <div className={styles.emailDetailSender}>From: <strong>{activeEmail.sender}</strong></div>
                                    <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>Received: {activeEmail.date}</div>
                                </div>
                                <pre className={styles.emailBody}>{activeEmail.body}</pre>
                            </>
                        ) : (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#888' }}>Select an email to read</div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return <div style={{ padding: '20px' }}>App mockup not loaded.</div>;
}
