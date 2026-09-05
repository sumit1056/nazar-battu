/**
 * Nazar Battu — usePhysics Hook
 *
 * React hook managing the Matter.js engine lifecycle.
 * Creates the engine, rope chain, and runner on mount; cleans up on unmount.
 * Provides refs to physics objects for the canvas rendering loop.
 */

import { useRef, useEffect, useCallback } from 'react';
import { Engine, Runner, Composite, Mouse, MouseConstraint, Body } from 'matter-js';
import { createPhysicsEngine, createPhysicsRunner } from '../physics/engine';
import { createRopeChain, CHARM_CATEGORY } from '../physics/rope';
import { applyBreezeForce, applyAmbientSway } from '../physics/breeze';
import { DEFAULT_PHYSICS_CONFIG } from '../physics/types';
import type { RopeChain } from '../physics/types';
import { getCharm } from '../charms';

interface UsePhysicsOptions {
  /** Active charm ID to get body dimensions from */
  charmId: string;
  /** Canvas element ref for Mouse tracking */
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  /** Whether physics should be running */
  enabled: boolean;
}

interface UsePhysicsReturn {
  /** The Matter.js engine instance */
  engineRef: React.RefObject<Engine | null>;
  /** The rope chain composite */
  ropeChainRef: React.RefObject<RopeChain | null>;
  /** The mouse constraint for grab-and-fling */
  mouseConstraintRef: React.RefObject<MouseConstraint | null>;
  /** Apply breeze force from cursor position */
  applyBreeze: (cursorPos: { x: number; y: number }) => void;
  /** Reset charm position and velocity */
  resetCharmPosition: () => void;
}

export function usePhysics({
  charmId,
  canvasRef,
  enabled,
}: UsePhysicsOptions): UsePhysicsReturn {
  const engineRef = useRef<Engine | null>(null);
  const runnerRef = useRef<Runner | null>(null);
  const ropeChainRef = useRef<RopeChain | null>(null);
  const mouseConstraintRef = useRef<MouseConstraint | null>(null);
  const ambientTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || !canvasRef.current) return;

    const charm = getCharm(charmId);
    if (!charm) return;

    // Create engine and runner
    const engine = createPhysicsEngine();
    const runner = createPhysicsRunner();

    // Create rope chain with charm body dimensions
    const anchorX = window.innerWidth / 2;
    const anchorY = 0;
    const ropeChain = createRopeChain(
      anchorX,
      anchorY,
      charm.bodyDimensions.width,
      charm.bodyDimensions.height,
    );

    // Add rope chain to world
    Composite.add(engine.world, ropeChain.composite);

    // Create mouse + MouseConstraint for grab-and-fling
    const canvas = canvasRef.current;
    const dpr = window.devicePixelRatio || 1;
    canvas.setAttribute('data-pixel-ratio', String(dpr));

    const mouse = Mouse.create(canvas);
    mouse.pixelRatio = dpr;

    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: {
        stiffness: 0.2,    // Soft constraint for natural drag feel
        damping: 0.1,      // Smooth out rapid cursor movements
        render: { visible: false },
      },
      // Only interact with charm body (not rope links)
      collisionFilter: {
        category: CHARM_CATEGORY,
        mask: CHARM_CATEGORY,
      },
    });

    Composite.add(engine.world, mouseConstraint);

    // Store refs
    engineRef.current = engine;
    ropeChainRef.current = ropeChain;
    mouseConstraintRef.current = mouseConstraint;

    // Start the physics runner
    Runner.run(runner, engine);
    runnerRef.current = runner;

    // Ambient sway timer — applies gentle random force every 2-3 seconds
    const startAmbientSway = (): void => {
      const interval = 2000 + Math.random() * 1000; // 2-3s random interval
      ambientTimerRef.current = window.setTimeout(() => {
        if (ropeChainRef.current) {
          applyAmbientSway(ropeChainRef.current.charmBody);
        }
        startAmbientSway(); // Schedule next
      }, interval);
    };
    startAmbientSway();

    const handleResize = (): void => {
      const currentDpr = window.devicePixelRatio || 1;
      canvas.setAttribute('data-pixel-ratio', String(currentDpr));
      mouse.pixelRatio = currentDpr;
      Mouse.setScale(mouse, { x: 1, y: 1 });
    };
    window.addEventListener('resize', handleResize);

    // Cleanup on unmount or charm change
    return () => {
      window.removeEventListener('resize', handleResize);
      if (ambientTimerRef.current) {
        clearTimeout(ambientTimerRef.current);
      }
      Runner.stop(runner);
      Composite.clear(engine.world, false);
      Engine.clear(engine);
      engineRef.current = null;
      runnerRef.current = null;
      ropeChainRef.current = null;
      mouseConstraintRef.current = null;
    };
  }, [charmId, enabled]); // Re-create physics on charm change or enable toggle

  // Breeze force application (called from canvas mousemove handler)
  const applyBreeze = useCallback((cursorPos: { x: number; y: number }) => {
    if (ropeChainRef.current) {
      applyBreezeForce(cursorPos, ropeChainRef.current.charmBody);
    }
  }, []);

  const resetCharmPosition = useCallback(() => {
    if (ropeChainRef.current) {
      const anchorX = window.innerWidth / 2;
      Body.setPosition(ropeChainRef.current.charmBody, {
        x: anchorX,
        y: 190,
      });
      Body.setVelocity(ropeChainRef.current.charmBody, { x: 0, y: 0 });
      Body.setAngularVelocity(ropeChainRef.current.charmBody, 0);
      Body.setAngle(ropeChainRef.current.charmBody, 0);
    }
  }, []);

  return {
    engineRef,
    ropeChainRef,
    mouseConstraintRef,
    applyBreeze,
    resetCharmPosition,
  };
}
