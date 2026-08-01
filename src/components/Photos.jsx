import { useState } from 'react';
import { WALLPAPERS, wallpaperUrl } from '../data/wallpapers';
import styles from './Photos.module.css';

export default function Photos() {
    const [lightboxIndex, setLightboxIndex] = useState(null);
    const [zoom, setZoom] = useState(1);

    // The image viewer browses the bundled rice wallpapers — no external
    // requests, and it doubles as a full-size preview for the wallpaper picker.
    const images = WALLPAPERS.map((w, i) => ({
        id: i + 1,
        title: `${w.name} — ${w.palette}`,
        url: wallpaperUrl(w.id),
    }));

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
                        role="img"
                        aria-label={img.title}
                        tabIndex={0}
                        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && openLightbox(index)}
                    />
                ))}
            </div>

            {lightboxIndex !== null && (
                <div className={styles.lightbox} role="dialog" aria-label={`Lightbox: ${images[lightboxIndex].title}`} aria-modal="true">
                    <div className={styles.lightboxHeader}>
                        <span>{images[lightboxIndex].title}</span>
                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                            <button className={styles.navBtn} style={{ padding: '4px 8px', fontSize: '14px' }} onClick={handleZoomOut} aria-label="Zoom out">Zoom Out</button>
                            <button className={styles.navBtn} style={{ padding: '4px 8px', fontSize: '14px' }} onClick={handleZoomIn} aria-label="Zoom in">Zoom In</button>
                            <span className={styles.closeBtn} onClick={() => setLightboxIndex(null)} role="button" tabIndex={0} aria-label="Close lightbox" onKeyDown={(e) => e.key === 'Enter' && setLightboxIndex(null)}>✕</span>
                        </div>
                    </div>
                    <div className={styles.lightboxContent}>
                        <button className={styles.navBtn} onClick={handlePrev} aria-label="Previous image">◀</button>
                        <img 
                            className={styles.mainImage} 
                            src={images[lightboxIndex].url} 
                            alt={images[lightboxIndex].title}
                            style={{ transform: `scale(${zoom})` }}
                        />
                        <button className={styles.navBtn} onClick={handleNext} aria-label="Next image">▶</button>
                    </div>
                    <div className={styles.lightboxFooter}>
                        Image {lightboxIndex + 1} of {images.length}
                    </div>
                </div>
            )}
        </div>
    );
}
