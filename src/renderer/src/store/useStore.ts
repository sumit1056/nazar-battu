/**
 * Nazar Battu — Zustand Store
 *
 * Lightweight state management for active charm, screen position lane (Left/Center/Right),
 * visibility, interaction state, floating context menu, and audio toggles.
 * See docs/TRD.md §6 for the full store interface.
 */

import { create } from 'zustand';
import { getDefaultCharmId } from '../charms';

/** Interaction state machine — matches the IPC 3-state loop in TRD §3.1 */
export type InteractionState = 'passthrough' | 'interactive' | 'dragging';

/** Screen anchor lane position */
export type PositionLane = 'left' | 'center' | 'right';

/** Helper to compute anchor X coordinate from current lane */
export function getAnchorXForLane(
  lane: PositionLane,
  windowWidth: number = typeof window !== 'undefined' ? window.innerWidth : 1920,
): number {
  switch (lane) {
    case 'left':
      return Math.min(160, Math.round(windowWidth * 0.12));
    case 'right':
      return Math.max(windowWidth - 160, Math.round(windowWidth * 0.88));
    case 'center':
    default:
      return Math.round(windowWidth / 2);
  }
}

export interface NazarBattuStore {
  // --- Charm state ---
  activeCharmId: string;
  setActiveCharm: (id: string) => void;

  // --- Screen Position Lane ---
  positionLane: PositionLane;
  setPositionLane: (lane: PositionLane) => void;

  // --- Floating Context Menu ---
  isMenuOpen: boolean;
  setMenuOpen: (open: boolean) => void;

  // --- Visibility ---
  isVisible: boolean;
  toggleVisibility: () => void;
  setVisible: (visible: boolean) => void;

  // --- Physics coordinates ---
  charmPosition: { x: number; y: number };
  charmAngle: number;
  updateCharmTransform: (pos: { x: number; y: number }, angle: number) => void;

  // --- Interaction state ---
  interactionState: InteractionState;
  setInteractionState: (state: InteractionState) => void;

  // --- Audio ---
  audioEnabled: boolean;
  toggleAudio: () => void;
  setAudioEnabled: (enabled: boolean) => void;
}

export const useStore = create<NazarBattuStore>((set) => ({
  // Charm
  activeCharmId: getDefaultCharmId(),
  setActiveCharm: (id) => set({ activeCharmId: id }),

  // Position Lane: 'right' as default as requested!
  positionLane: 'right',
  setPositionLane: (lane) => set({ positionLane: lane }),

  // Floating Context Menu
  isMenuOpen: false,
  setMenuOpen: (open) => set({ isMenuOpen: open }),

  // Visibility
  isVisible: true,
  toggleVisibility: () => set((state) => ({ isVisible: !state.isVisible })),
  setVisible: (visible) => set({ isVisible: visible }),

  // Physics coordinates
  charmPosition: { x: 0, y: 0 },
  charmAngle: 0,
  updateCharmTransform: (pos, angle) =>
    set({ charmPosition: pos, charmAngle: angle }),

  // Interaction
  interactionState: 'passthrough',
  setInteractionState: (state) => set({ interactionState: state }),

  // Audio
  audioEnabled: true,
  toggleAudio: () => set((state) => ({ audioEnabled: !state.audioEnabled })),
  setAudioEnabled: (enabled) => set({ audioEnabled: enabled }),
}));
