/**
 * Nazar Battu — usePhysics Hook (Verlet Integration Engine)
 *
 * React hook managing the 12-particle Verlet rope physics simulation.
 * Replaces rigid-body constraints with pure particle Verlet integration:
 * - 0.98 air damping for silky, non-elastic pendulum oscillation.
 * - Full-cord cursor repulsion: intermediate nodes physically curve away from cursor.
 * - Wind velocity momentum injection from rapid cursor sweeps.
 * - Harmonic ocean-wave dual-sine ambient sway.
 * - Taut leash drag clamping with velocity fling.
 */

import { useRef, useEffect, useCallback } from 'react';
import { VerletRope } from '../physics/verlet';

interface UsePhysicsOptions {
  /** Active charm ID */
  charmId: string;
  /** Canvas element ref */
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  /** Whether physics should be active */
  enabled: boolean;
}

export interface UsePhysicsReturn {
  /** The Verlet rope simulation instance */
  verletRopeRef: React.RefObject<VerletRope | null>;
  /** Advance physics simulation by dt */
  stepPhysics: (dt?: number) => void;
  /** Reset charm position and trigger gentle settling sway */
  resetCharmPosition: () => void;
}

export function usePhysics({
  charmId,
  enabled,
}: UsePhysicsOptions): UsePhysicsReturn {
  const verletRopeRef = useRef<VerletRope | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const anchorX = typeof window !== 'undefined' ? window.innerWidth / 2 : 500;
    const rope = new VerletRope({
      pointCount: 12,
      segmentLength: 15.5,
      anchorX,
      anchorY: 0,
    });

    // Gentle flick on load or charm switch to bring it alive
    rope.flick(14);
    verletRopeRef.current = rope;

    const handleResize = (): void => {
      if (verletRopeRef.current) {
        verletRopeRef.current.anchorX = window.innerWidth / 2;
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      verletRopeRef.current = null;
    };
  }, [charmId, enabled]);

  /** Step simulation forward by 1 frame (1/60s) */
  const stepPhysics = useCallback((dt = 1 / 60) => {
    if (verletRopeRef.current) {
      verletRopeRef.current.step(dt);
    }
  }, []);

  /** Emergency or tray command to re-center the talisman */
  const resetCharmPosition = useCallback(() => {
    if (verletRopeRef.current) {
      const anchorX = window.innerWidth / 2;
      verletRopeRef.current.reset(anchorX, 0);
    }
  }, []);

  return {
    verletRopeRef,
    stepPhysics,
    resetCharmPosition,
  };
}
