import { useState } from 'react';
import styles from './Photos.module.css';

export default function Photos() {
    const [lightboxIndex, setLightboxIndex] = useState(null);
    const [zoom, setZoom] = useState(1);

    const images = [
        { id: 1, title: 'Code Workspace', url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=600&auto=format&fit=crop' },
        { id: 2, title: 'Cyberpunk Streets', url: 'https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?q=80&w=600&auto=format&fit=crop' },
        { id: 3, title: 'Mountain Peaks', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600&auto=format&fit=crop' },
        { id: 4, title: 'Retro Terminal Screen', url: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=600&auto=format&fit=crop' },
        { id: 5, title: 'Deep Space Galaxy', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop' },
        { id: 6, title: 'Nature Forest Path', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=600&auto=format&fit=crop' }
    ];

    const openLightbox = (index) => {
        setLightboxIndex(index);
        setZoom(1);
    };

    const handleNext = () => {
        setLightboxIndex((prev) => (prev + 1) % images.length);
        setZoom(1);
    };

    const handlePrev = () => {
        setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
        setZoom(1);
    };

    const handleZoomIn = () => {
        setZoom(prev => Math.min(prev + 0.25, 2));
    };

    const handleZoomOut = () => {
        setZoom(prev => Math.max(prev - 0.25, 0.5));
    };

    return (
        <div className={styles.photosContainer}>
            <div className={styles.galleryGrid}>
                {images.map((img, index) => (
                    <div 
                        key={img.id}
                        className={styles.photoCard}
                        style={{ backgroundImage: `url(${img.url})` }}
                        onClick={() => openLightbox(index)}
                        title={img.title}
                    />
                ))}
            </div>

            {lightboxIndex !== null && (
                <div className={styles.lightbox}>
                    <div className={styles.lightboxHeader}>
                        <span>{images[lightboxIndex].title}</span>
                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                            <button className={styles.navBtn} style={{ padding: '4px 8px', fontSize: '14px' }} onClick={handleZoomOut}>Zoom Out</button>
                            <button className={styles.navBtn} style={{ padding: '4px 8px', fontSize: '14px' }} onClick={handleZoomIn}>Zoom In</button>
                            <span className={styles.closeBtn} onClick={() => setLightboxIndex(null)}>✕</span>
                        </div>
                    </div>
                    <div className={styles.lightboxContent}>
                        <button className={styles.navBtn} onClick={handlePrev}>◀</button>
                        <img 
                            className={styles.mainImage} 
                            src={images[lightboxIndex].url} 
                            alt={images[lightboxIndex].title}
                            style={{ transform: `scale(${zoom})` }}
                        />
                        <button className={styles.navBtn} onClick={handleNext}>▶</button>
                    </div>
                    <div className={styles.lightboxFooter}>
                        Image {lightboxIndex + 1} of {images.length}
                    </div>
                </div>
            )}
        </div>
    );
}
