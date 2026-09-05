/**
 * Nazar Battu — Compact Floating Context Menu
 *
 * Compact, high-contrast context menu (like a native desktop popup menu).
 * - Locks mouse interactivity so clicks never bleed through to background apps.
 * - Flat, direct selection: 🍋 Nimbu-Mirchi, 🧿 Evil Eye, 👹 Mahakal, 🔔 Ghanta.
 * - Position selector: Left | Center | Right (Right is default).
 * - Sound toggle (ON/OFF).
 */

import { useEffect, useState, type JSX } from 'react';
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
  const [autoLaunch, setAutoLaunchState] = useState<boolean>(false);

  const charms = listCharms();

  // Load auto-launch status when menu opens
  useEffect(() => {
    if (isMenuOpen && window.electronAPI?.getAutoLaunch) {
      window.electronAPI.getAutoLaunch().then((enabled) => {
        setAutoLaunchState(enabled);
      });
    }
  }, [isMenuOpen]);

  // Crucial: Tell Electron main process to LOCK interactive mode while menu is open
  useEffect(() => {
    if (window.electronAPI?.setMenuOpen) {
      window.electronAPI.setMenuOpen(isMenuOpen);
    } else if (window.electronAPI?.setInteractive) {
      window.electronAPI.setInteractive(!isMenuOpen, { forward: true });
    }
  }, [isMenuOpen]);

  // Close on Escape key
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
        zIndex: 99999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent:
          positionLane === 'left'
            ? 'flex-start'
            : positionLane === 'right'
            ? 'flex-end'
            : 'center',
        padding: '24px 36px',
        // Capture all clicks so they never pass to background apps
        pointerEvents: 'auto',
      }}
      onClick={handleClose}
      onContextMenu={(e) => {
        e.preventDefault();
        handleClose();
      }}
    >
      {/* Compact Native-Style Menu Card */}
      <div
        style={{
          width: 220,
          background: '#18181f', // Solid dark background for crisp readability
          border: '1px solid rgba(255, 255, 255, 0.18)',
          borderRadius: 12,
          padding: '10px 8px',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.08)',
          color: '#ffffff',
          fontFamily: 'Segoe UI, -apple-system, BlinkMacSystemFont, Roboto, sans-serif',
          fontSize: 13,
          userSelect: 'none',
          cursor: 'default',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Menu Header */}
        <div
          style={{
            padding: '4px 8px 8px 8px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontWeight: 600, fontSize: 12, color: 'rgba(255, 255, 255, 0.8)' }}>
            Nazar Battu
          </span>
          <button
            onClick={handleClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.5)',
              cursor: 'pointer',
              fontSize: 12,
              padding: '0 4px',
            }}
          >
            ✕
          </button>
        </div>

        {/* Talismans List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {charms.map((c) => {
            const isSelected = activeCharmId === c.id;
            return (
              <div
                key={c.id}
                onClick={() => {
                  setActiveCharm(c.id);
                  if (window.electronAPI) {
                    window.electronAPI.saveSettings({ activeCharmId: c.id });
                  }
                  handleClose();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 10px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  background: isSelected ? 'rgba(255, 215, 0, 0.15)' : 'transparent',
                  color: isSelected ? '#ffd54f' : '#ffffff',
                  fontWeight: isSelected ? 600 : 400,
                  transition: 'background 0.1s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>{getCharmEmoji(c.id)}</span>
                  <span>{c.name.split('(')[0].trim()}</span>
                </div>
                {isSelected && <span style={{ fontSize: 12, color: '#ffd54f' }}>✓</span>}
              </div>
            );
          })}
        </div>

        {/* Separator */}
        <div style={{ height: 1, background: 'rgba(255, 255, 255, 0.1)', margin: '8px 0' }} />

        {/* Screen Position Selector */}
        <div style={{ padding: '2px 4px 6px 4px' }}>
          <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.5)', marginBottom: 6, paddingLeft: 4 }}>
            Position on Screen:
          </div>
          <div
            style={{
              display: 'flex',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: 6,
              padding: 2,
              gap: 2,
            }}
          >
            {(['left', 'center', 'right'] as PositionLane[]).map((lane) => {
              const active = positionLane === lane;
              return (
                <button
                  key={lane}
                  onClick={() => {
                    setPositionLane(lane);
                    if (window.electronAPI) {
                      window.electronAPI.saveSettings({ positionLane: lane });
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: '5px 0',
                    border: 'none',
                    borderRadius: 4,
                    background: active ? '#2c2c36' : 'transparent',
                    color: active ? '#ffd54f' : 'rgba(255, 255, 255, 0.6)',
                    fontWeight: active ? 600 : 400,
                    fontSize: 11,
                    cursor: 'pointer',
                    transition: 'all 0.1s ease',
                  }}
                >
                  {lane === 'left' ? 'Left' : lane === 'center' ? 'Mid' : 'Right'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Separator */}
        <div style={{ height: 1, background: 'rgba(255, 255, 255, 0.1)', margin: '6px 0' }} />

        {/* Sound Toggle */}
        <div
          onClick={() => {
            toggleAudio();
            if (window.electronAPI) {
              window.electronAPI.saveSettings({ audioEnabled: !audioEnabled });
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 10px',
            borderRadius: 6,
            cursor: 'pointer',
            color: 'rgba(255, 255, 255, 0.85)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <span>{audioEnabled ? '🔊 Sound Effects' : '🔇 Muted'}</span>
          <span style={{ fontSize: 11, color: audioEnabled ? '#81c784' : 'rgba(255, 255, 255, 0.4)' }}>
            {audioEnabled ? 'ON' : 'OFF'}
          </span>
        </div>

        {/* Auto-Launch with Windows */}
        <div
          onClick={async () => {
            if (window.electronAPI?.setAutoLaunch) {
              const nextState = !autoLaunch;
              const updated = await window.electronAPI.setAutoLaunch(nextState);
              setAutoLaunchState(updated);
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 10px',
            borderRadius: 6,
            cursor: 'pointer',
            color: 'rgba(255, 255, 255, 0.85)',
            marginTop: 2,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <span>🚀 Run on Startup</span>
          <span style={{ fontSize: 11, color: autoLaunch ? '#81c784' : 'rgba(255, 255, 255, 0.4)' }}>
            {autoLaunch ? 'ON' : 'OFF'}
          </span>
        </div>
      </div>
    </div>
  );
}
