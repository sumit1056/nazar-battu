/**
 * Nazar Battu — Floating Glassmorphic Context Menu
 *
 * Appears when right-clicking on the dangling talisman or pressing Space/Menu.
 * Allows seamless, on-screen configuration:
 * - Talisman Selector: Nimbu-Mirchi, Evil Eye, Mahakal Mask, Ghanta Temple Bell
 * - Screen Lane: Left, Center, Right (Right is default)
 * - Audio Effects toggle (On/Off)
 */

import { useEffect, type JSX } from 'react';
import { useStore, type PositionLane } from '../store/useStore';
import { listCharms } from '../charms';

export function CharmMenu(): JSX.Element | null {
  const isMenuOpen = useStore((s) => s.isMenuOpen);
  const setMenuOpen = useStore((s) => s.setMenuOpen);
  const activeCharmId = useStore((s) => s.activeCharmId);
  const setActiveCharm = useStore((s) => s.setActiveCharm);
  const positionLane = useStore((s) => s.positionLane);
  const setPositionLane = useStore((s) => s.setPositionLane);
  const audioEnabled = useStore((s) => s.audioEnabled);
  const toggleAudio = useStore((s) => s.toggleAudio);

  const charms = listCharms();

  // Ensure window stays interactive while menu is open
  useEffect(() => {
    if (isMenuOpen && window.electronAPI) {
      window.electronAPI.setInteractive(false);
    }
  }, [isMenuOpen]);

  // Close menu on Escape
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen, setMenuOpen]);

  if (!isMenuOpen) return null;

  const handleClose = (): void => {
    setMenuOpen(false);
    if (window.electronAPI) {
      window.electronAPI.setInteractive(true, { forward: true });
    }
  };

  const getCharmEmoji = (id: string): string => {
    switch (id) {
      case 'nimbu-mirchi':
        return '🍋';
      case 'evil-eye':
        return '🧿';
      case 'mahakal-mask':
        return '👹';
      case 'ghanta':
        return '🔔';
      default:
        return '📿';
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: positionLane === 'left' ? 'flex-start' : positionLane === 'right' ? 'flex-end' : 'center',
        padding: '30px 40px',
        pointerEvents: 'auto',
      }}
      onClick={handleClose}
    >
      {/* Menu Card */}
      <div
        style={{
          width: 320,
          background: 'rgba(18, 18, 26, 0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          borderRadius: 20,
          padding: 20,
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.05)',
          color: '#ffffff',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          animation: 'menuFadeIn 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 20 }}>📿</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, letterSpacing: '0.02em' }}>Nazar Battu</div>
              <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.5)' }}>Desktop Talisman</div>
            </div>
          </div>
          <button
            onClick={handleClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              borderRadius: '50%',
              width: 26,
              height: 26,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255, 255, 255, 0.7)',
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            ✕
          </button>
        </div>

        {/* Section: Screen Position Lane */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255, 255, 255, 0.5)', marginBottom: 8 }}>
            Screen Position
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 6,
              background: 'rgba(0, 0, 0, 0.35)',
              padding: 4,
              borderRadius: 12,
            }}
          >
            {(['left', 'center', 'right'] as PositionLane[]).map((lane) => {
              const active = positionLane === lane;
              return (
                <button
                  key={lane}
                  onClick={() => setPositionLane(lane)}
                  style={{
                    padding: '8px 4px',
                    borderRadius: 8,
                    border: active ? '1px solid rgba(255, 215, 0, 0.5)' : '1px solid transparent',
                    background: active ? 'rgba(255, 215, 0, 0.18)' : 'transparent',
                    color: active ? '#ffd54f' : 'rgba(255, 255, 255, 0.7)',
                    fontWeight: active ? 600 : 500,
                    fontSize: 12,
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {lane === 'left' ? '⬅️ Left' : lane === 'center' ? '⏺️ Center' : '➡️ Right'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section: Select Talisman */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255, 255, 255, 0.5)', marginBottom: 8 }}>
            Select Talisman
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {charms.map((c) => {
              const selected = activeCharmId === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    setActiveCharm(c.id);
                    if (window.electronAPI) {
                      window.electronAPI.saveSettings?.({ activeCharmId: c.id });
                    }
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '12px 8px',
                    borderRadius: 14,
                    background: selected ? 'rgba(255, 215, 0, 0.16)' : 'rgba(255, 255, 255, 0.05)',
                    border: selected ? '1.5px solid #ffd54f' : '1px solid rgba(255, 255, 255, 0.08)',
                    color: selected ? '#ffd54f' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ fontSize: 24 }}>{getCharmEmoji(c.id)}</span>
                  <span style={{ fontSize: 11, fontWeight: selected ? 600 : 400, textAlign: 'center', lineHeight: 1.2 }}>
                    {c.name.split('(')[0].trim()}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section: Audio Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <span style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.8)', display: 'flex', alignItems: 'center', gap: 6 }}>
            {audioEnabled ? '🔊 Sound Effects' : '🔇 Muted'}
          </span>
          <button
            onClick={() => {
              toggleAudio();
              if (window.electronAPI) {
                window.electronAPI.saveSettings?.({ audioEnabled: !audioEnabled });
              }
            }}
            style={{
              padding: '6px 12px',
              borderRadius: 20,
              border: audioEnabled ? '1px solid rgba(76, 175, 80, 0.5)' : '1px solid rgba(255, 255, 255, 0.15)',
              background: audioEnabled ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 255, 255, 0.06)',
              color: audioEnabled ? '#81c784' : 'rgba(255, 255, 255, 0.5)',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {audioEnabled ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>
    </div>
  );
}
