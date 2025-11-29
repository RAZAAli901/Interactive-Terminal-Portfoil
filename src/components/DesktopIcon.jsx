import styles from './DesktopIcon.module.css';

export default function DesktopIcon({ label, icon, onDoubleClick }) {
    return (
        <div className={styles.desktopIcon} onDoubleClick={onDoubleClick}>
            <div className={styles.iconImg}>{icon}</div>
            <div className={styles.iconLabel}>{label}</div>
        </div>
    );
}
