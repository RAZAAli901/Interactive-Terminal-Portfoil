export default function DesktopIcon({ label, icon, onDoubleClick }) {
    return (
        <div className="desktop-icon" onDoubleClick={onDoubleClick}>
            <div className="icon-img">{icon}</div>
            <div className="icon-label">{label}</div>
        </div>
    );
}
