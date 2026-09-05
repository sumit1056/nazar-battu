/**
 * Nazar Battu — Zustand Store
 *
 * Lightweight state management for active charm, visibility, interaction state,
 * and physics coordinates. Accessed by React components and the physics loop.
 * See docs/TRD.md §6 for the full store interface.
 */

import { create } from 'zustand';
import { getDefaultCharmId } from '../charms';

/** Interaction state machine — matches the IPC 3-state loop in TRD §3.1 */
export type InteractionState = 'passthrough' | 'interactive' | 'dragging';

export interface NazarBattuStore {
  // --- Charm state ---
  activeCharmId: string;
  setActiveCharm: (id: string) => void;

  // --- Visibility ---
  isVisible: boolean;
  toggleVisibility: () => void;
  setVisible: (visible: boolean) => void;

  // --- Physics coordinates (updated by rAF loop, read by React) ---
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
