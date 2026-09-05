/**
 * Nazar Battu — useHitTest Hook
 *
 * Computes axis-aligned bounding box from charm body position + dimensions,
 * and manages IPC toggle calls with hysteresis and debouncing.
 *
 * The hit-area defines when the window becomes interactive (cursor can click).
 * A 10px hysteresis zone prevents rapid toggling at the boundary edge.
 *
 * See docs/TRD.md §3.5 for race condition mitigations.
 */

import { useRef, useCallback } from 'react';
import type { Body } from 'matter-js';
import type { CharmDefinition } from '../charms/types';

interface HitTestState {
  /** Whether cursor is currently inside the hit-area */
  isInside: boolean;
  /** Whether a drag operation is in progress */
  isDragging: boolean;
  /** Timestamp of last IPC call — for debouncing */
  lastIPCTime: number;
}

const HYSTERESIS_PADDING = 10; // Extra px around hit-area to prevent rapid toggle
const IPC_DEBOUNCE_MS = 16;    // Max 1 IPC call per frame (~60fps)

interface UseHitTestReturn {
  /** Check if cursor position is within the charm's hit-area */
  checkHitArea: (
    cursorX: number,
    cursorY: number,
    charmBody: Body | { position: { x: number; y: number } },
    charm: CharmDefinition,
  ) => boolean;

  /** Notify that a drag has started */
  startDrag: () => void;

  /** Notify that a drag has ended, returns whether cursor is in hit-area */
  endDrag: (
    cursorX: number,
    cursorY: number,
    charmBody: Body | { position: { x: number; y: number } },
    charm: CharmDefinition,
  ) => boolean;

  /** Get current hit-test state */
  getState: () => HitTestState;
}

export function useHitTest(): UseHitTestReturn {
  const stateRef = useRef<HitTestState>({
    isInside: false,
    isDragging: false,
    lastIPCTime: 0,
  });

  /**
   * Pure AABB check — is cursor inside charm bounding box + padding?
   * Does NOT include hysteresis — that's handled in the state transition.
   */
  const isInsideBounds = (
    cursorX: number,
    cursorY: number,
    charmBody: Body | { position: { x: number; y: number } },
    charm: CharmDefinition,
    extraPadding: number = 0,
  ): boolean => {
    const { x, y } = charmBody.position;
    const halfW = charm.bodyDimensions.width / 2 + charm.hitAreaPadding + extraPadding;
    const halfH = charm.bodyDimensions.height / 2 + charm.hitAreaPadding + extraPadding;

    return (
      cursorX >= x - halfW &&
      cursorX <= x + halfW &&
      cursorY >= y - halfH &&
      cursorY <= y + halfH
    );
  };

  /**
   * Check hit-area and manage state transitions with hysteresis + debouncing.
   * Returns true if cursor is in the interactive zone.
   */
  const checkHitArea = useCallback(
    (
      cursorX: number,
      cursorY: number,
      charmBody: Body | { position: { x: number; y: number } },
      charm: CharmDefinition,
    ): boolean => {
      const state = stateRef.current;

      // During drag, always report as inside
      if (state.isDragging) return true;

      // Use hysteresis: if currently inside, use larger bounds for "leave" check
      const padding = state.isInside ? HYSTERESIS_PADDING : 0;
      const inside = isInsideBounds(cursorX, cursorY, charmBody, charm, padding);

      // State transition: only fire IPC on actual change, with debounce
      if (inside !== state.isInside) {
        const now = performance.now();
        if (now - state.lastIPCTime >= IPC_DEBOUNCE_MS) {
          state.isInside = inside;
          state.lastIPCTime = now;

          // IPC toggle — make window interactive or pass-through
          if (window.electronAPI) {
            if (inside) {
              window.electronAPI.setInteractive(false); // ignore=false → interactive
            } else {
              window.electronAPI.setInteractive(true, { forward: true }); // pass-through
            }
          }
        }
      }

      return state.isInside;
    },
    [],
  );

  /** Lock hit-test in "inside" state during drag */
  const startDrag = useCallback(() => {
    stateRef.current.isDragging = true;
    stateRef.current.isInside = true;
    if (window.electronAPI) {
      window.electronAPI.notifyDragStart();
    }
  }, []);

  /** Release drag lock and resolve next state */
  const endDrag = useCallback(
    (
      cursorX: number,
      cursorY: number,
      charmBody: Body | { position: { x: number; y: number } },
      charm: CharmDefinition,
    ): boolean => {
      const state = stateRef.current;
      state.isDragging = false;

      const inside = isInsideBounds(cursorX, cursorY, charmBody, charm);
      state.isInside = inside;

      if (window.electronAPI) {
        window.electronAPI.notifyDragEnd(inside);
      }

      return inside;
    },
    [],
  );

  const getState = useCallback(() => stateRef.current, []);

  return { checkHitArea, startDrag, endDrag, getState };
}
