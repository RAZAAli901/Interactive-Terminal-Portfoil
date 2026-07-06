import { useState } from 'react';

export function useWindowManager(initialWindows) {
  const [maxZIndex, setMaxZIndex] = useState(10);
  const [windows, setWindows] = useState(initialWindows);

  const openWindow = (id) => {
    const nextZ = maxZIndex + 1;
    setMaxZIndex(nextZ);
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], isOpen: true, isMinimized: false, zIndex: nextZ }
    }));
  };

  const closeWindow = (id) => {
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], isOpen: false, isMinimized: false }
    }));
  };

  const minimizeWindow = (id) => {
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], isMinimized: true }
    }));
  };

  const toggleWindow = (id) => {
    setWindows((prev) => {
      const win = prev[id];
      if (!win) return prev;
      if (!win.isOpen) {
        const nextZ = maxZIndex + 1;
        setMaxZIndex(nextZ);
        return {
          ...prev,
          [id]: { ...win, isOpen: true, isMinimized: false, zIndex: nextZ }
        };
      } else if (win.isMinimized) {
        const nextZ = maxZIndex + 1;
        setMaxZIndex(nextZ);
        return {
          ...prev,
          [id]: { ...win, isMinimized: false, zIndex: nextZ }
        };
      } else {
        return {
          ...prev,
          [id]: { ...win, isMinimized: true }
        };
      }
    });
  };

  const focusWindow = (id) => {
    const nextZ = maxZIndex + 1;
    setMaxZIndex(nextZ);
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], zIndex: nextZ }
    }));
  };

  return {
    windows,
    openWindow,
    closeWindow,
    minimizeWindow,
    toggleWindow,
    focusWindow
  };
}
