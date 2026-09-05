/**
 * Nazar Battu — Root App Component
 *
 * Mounts the CharmCanvas and sets up IPC listeners for tray commands.
 * This is the single entry point for the renderer process UI.
 */

import { useEffect, type JSX } from 'react';
import { CharmCanvas } from './components/CharmCanvas';
import { CharmMenu } from './components/CharmMenu';
import { useStore, type PositionLane } from './store/useStore';

export default function App(): JSX.Element {
  const toggleVisibility = useStore((s) => s.toggleVisibility);
  const setActiveCharm = useStore((s) => s.setActiveCharm);
  const setAudioEnabled = useStore((s) => s.setAudioEnabled);
  const setPositionLane = useStore((s) => s.setPositionLane);

  // Sync settings and listen for tray commands from the main process
  useEffect(() => {
    if (!window.electronAPI) return;

    // Load persisted settings
    window.electronAPI.getSettings?.().then((settings) => {
      if (settings) {
        if (settings.activeCharmId) setActiveCharm(settings.activeCharmId);
        if (settings.audioEnabled !== undefined) setAudioEnabled(settings.audioEnabled);
        if (settings.positionLane) setPositionLane(settings.positionLane as PositionLane);
      }
    }).catch(() => {});

    window.electronAPI.onToggleVisibility(() => {
      toggleVisibility();
    });

    window.electronAPI.onChangeCharm((charmId: string) => {
      setActiveCharm(charmId);
    });

    window.electronAPI.onChangeLane?.((lane: string) => {
      setPositionLane(lane as PositionLane);
    });

    window.electronAPI.onToggleAudio?.((enabled: boolean) => {
      setAudioEnabled(enabled);
    });

    return () => {
      window.electronAPI.removeAllListeners('tray:toggle-visibility');
      window.electronAPI.removeAllListeners('tray:change-charm');
      window.electronAPI.removeAllListeners('tray:change-lane');
      window.electronAPI.removeAllListeners('tray:toggle-audio');
    };
  }, [toggleVisibility, setActiveCharm, setAudioEnabled, setPositionLane]);

  return (
    <>
      <CharmCanvas />
      <CharmMenu />
    </>
  );
}
