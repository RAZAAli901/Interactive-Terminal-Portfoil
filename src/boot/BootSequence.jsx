import { useState } from 'react';
import BiosScreen from './BiosScreen';
import SystemdBoot from './SystemdBoot';
import SddmLogin from '../login/SddmLogin';

/**
 * Full boot experience: BIOS/POST → systemd boot log → SDDM login. Each stage is
 * skippable (key/click). Calling `onComplete` hands control to the Hyprland
 * desktop. `startStage` lets callers jump in (e.g. a reboot straight to login).
 */
export default function BootSequence({ wallpaper, onComplete, startStage = 'bios' }) {
  const [stage, setStage] = useState(startStage);

  if (stage === 'bios') return <BiosScreen onDone={() => setStage('systemd')} />;
  if (stage === 'systemd') return <SystemdBoot onDone={() => setStage('login')} />;
  if (stage === 'login') return <SddmLogin wallpaper={wallpaper} onLogin={onComplete} />;
  return null;
}
