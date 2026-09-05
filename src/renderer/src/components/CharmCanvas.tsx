/**
 * Nazar Battu — CharmCanvas Component
 *
 * Full-window canvas that renders the rope chain and charm talisman.
 * Runs a requestAnimationFrame loop syncing Matter.js body positions
 * to canvas drawing calls. Handles hit-testing, breeze forces, and
 * cursor state management.
 *
 * See docs/TRD.md §5 for the rendering pipeline architecture.
 */

import { useRef, useEffect, useCallback, type JSX } from 'react';
import { Events } from 'matter-js';
import { usePhysics } from '../hooks/usePhysics';
import { useHitTest } from '../hooks/useHitTest';
import { useStore } from '../store/useStore';
import { getCharm } from '../charms';
import { getRopePoints } from '../physics/rope';
import { playChime, playSwish } from '../audio/sounds';

export function CharmCanvas(): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const cursorPosRef = useRef({ x: 0, y: 0 });

  // Zustand state
  const activeCharmId = useStore((s) => s.activeCharmId);
  const isVisible = useStore((s) => s.isVisible);
  const audioEnabled = useStore((s) => s.audioEnabled);
  const setInteractionState = useStore((s) => s.setInteractionState);

  // Get charm definition
  const charm = getCharm(activeCharmId);

  // Physics engine + rope chain
  const { engineRef, ropeChainRef, mouseConstraintRef, applyBreeze, resetCharmPosition } = usePhysics({
    charmId: activeCharmId,
    canvasRef,
    enabled: isVisible,
  });

  // Hit-testing with hysteresis + IPC toggle
  const { checkHitArea, startDrag, endDrag, getState } = useHitTest();

  /**
   * Draw the rope segments with authentic multi-layer cord styling.
   * Uses braided core, gradient thread tint, and stitched accent dashes.
   */
  const drawRope = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const ropeChain = ropeChainRef.current;
      if (!ropeChain) return;

      const allBodies = [ropeChain.anchor, ...ropeChain.links, ropeChain.charmBody];

      const traceRopePath = () => {
        ctx.beginPath();
        ctx.moveTo(allBodies[0].position.x, allBodies[0].position.y);
        for (let i = 1; i < allBodies.length; i++) {
          ctx.lineTo(allBodies[i].position.x, allBodies[i].position.y);
        }
      };

      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (activeCharmId === 'nimbu-mirchi') {
        // Layer 1: Dark outer cord border
        traceRopePath();
        ctx.strokeStyle = '#4e342e';
        ctx.lineWidth = 2.4;
        ctx.stroke();

        // Layer 2: Warm twisted jute cord
        traceRopePath();
        ctx.strokeStyle = '#a1887f';
        ctx.lineWidth = 1.4;
        ctx.stroke();

        // Layer 3: Gold accent thread dashes
        traceRopePath();
        ctx.strokeStyle = '#ffe082';
        ctx.lineWidth = 0.8;
        ctx.setLineDash([2, 5, 1.5, 7]);
        ctx.stroke();
      } else if (activeCharmId === 'mahakal-mask') {
        // Sacred vermilion thread with gold accents
        traceRopePath();
        ctx.strokeStyle = '#7f0000';
        ctx.lineWidth = 2.6;
        ctx.stroke();

        traceRopePath();
        ctx.strokeStyle = '#d32f2f';
        ctx.lineWidth = 1.6;
        ctx.stroke();

        traceRopePath();
        ctx.strokeStyle = '#ffca28';
        ctx.lineWidth = 0.8;
        ctx.setLineDash([2, 4]);
        ctx.stroke();
      } else {
        // Evil eye: braided steel cord
        traceRopePath();
        ctx.strokeStyle = '#263238';
        ctx.lineWidth = 2.2;
        ctx.stroke();

        traceRopePath();
        ctx.strokeStyle = '#78909c';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      ctx.restore();
    },
    [ropeChainRef, activeCharmId],
  );

  /**
   * Main render loop — requestAnimationFrame.
   * Clears canvas (transparent), draws rope, draws charm,
   * and applies breeze force from cursor position.
   */
  const renderLoop = useCallback(() => {
    const canvas = canvasRef.current;
    const ropeChain = ropeChainRef.current;
    if (!canvas || !ropeChain || !charm) {
      animFrameRef.current = requestAnimationFrame(renderLoop);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    // Clear entire canvas (transparent)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Scale for HiDPI
    ctx.save();
    ctx.scale(dpr, dpr);

    // Draw the multi-layer rope cord
    drawRope(ctx);

    // Extract current rope node points for articulated talisman rendering
    const ropePoints = getRopePoints(ropeChain);

    // Draw the charm synced to physics body
    charm.render({
      ctx,
      position: ropeChain.charmBody.position,
      angle: ropeChain.charmBody.angle,
      dpr,
      ropePoints,
    });

    ctx.restore();

    // Apply breeze force from cursor (runs every frame in passthrough mode)
    applyBreeze(cursorPosRef.current);

    // Hit-test for IPC toggle
    checkHitArea(
      cursorPosRef.current.x,
      cursorPosRef.current.y,
      ropeChain.charmBody,
      charm,
    );

    // Continue loop
    animFrameRef.current = requestAnimationFrame(renderLoop);
  }, [ropeChainRef, charm, drawRope, applyBreeze, checkHitArea]);

  /**
   * Canvas setup: resize to window, handle DPI, start render loop.
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isVisible) return;

    const resizeCanvas = (): void => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      canvas.style.width = '100vw';
      canvas.style.height = '100vh';
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Start render loop
    animFrameRef.current = requestAnimationFrame(renderLoop);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [isVisible, renderLoop]);

  /**
   * Emergency Dev Controls:
   * - Esc: Toggle visibility / unhide tray
   * - Shift + Esc: Emergency Quit
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        if (e.shiftKey) {
          window.electronAPI.emergencyDevAction?.('quit');
        } else {
          window.electronAPI.emergencyDevAction?.('toggle');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  /**
   * Mouse event handlers for hit-testing and drag lifecycle.
   * mousemove: track cursor position (used by breeze + hit-test in render loop)
   * mousedown: detect grab on charm body → start drag
   * mouseup: release drag → fling with accumulated velocity
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isVisible) return;

    const handleMouseMove = (e: MouseEvent): void => {
      cursorPosRef.current = { x: e.clientX, y: e.clientY };

      // Update cursor style based on hit-test state
      const hitState = getState();
      if (hitState.isDragging) {
        canvas.style.cursor = 'grabbing';
      } else if (hitState.isInside) {
        canvas.style.cursor = 'grab';
      } else {
        canvas.style.cursor = 'default';
      }
    };

    const handleMouseDown = (_e: MouseEvent): void => {
      const hitState = getState();
      if (hitState.isInside && !hitState.isDragging) {
        startDrag();
        setInteractionState('dragging');
        canvas.style.cursor = 'grabbing';
        if (audioEnabled) {
          playChime(0.25);
        }
      }
    };

    const handleMouseUp = (e: MouseEvent): void => {
      const hitState = getState();
      if (hitState.isDragging && ropeChainRef.current && charm) {
        const body = ropeChainRef.current.charmBody;
        const speed = Math.hypot(body.velocity.x, body.velocity.y);
        if (audioEnabled && speed > 2.5) {
          playSwish(speed, 0.2);
        }
        const isInside = endDrag(
          e.clientX,
          e.clientY,
          body,
          charm,
        );
        setInteractionState(isInside ? 'interactive' : 'passthrough');
        canvas.style.cursor = isInside ? 'grab' : 'default';
      }
    };

    const handleDoubleClick = (e: MouseEvent): void => {
      const anchorX = window.innerWidth / 2;
      // Double click near the top anchor node triggers emergency reset
      if (Math.abs(e.clientX - anchorX) < 50 && e.clientY < 60) {
        resetCharmPosition();
        window.electronAPI.emergencyDevAction?.('toggle');
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('dblclick', handleDoubleClick);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('dblclick', handleDoubleClick);
    };
  }, [isVisible, charm, audioEnabled, startDrag, endDrag, getState, setInteractionState, ropeChainRef, resetCharmPosition]);

  /**
   * Listen for tray reset-position command to re-center the charm.
   */
  useEffect(() => {
    if (!window.electronAPI) return;
    window.electronAPI.onResetPosition?.(() => {
      resetCharmPosition();
    });
    return () => {
      window.electronAPI.removeAllListeners('tray:reset-position');
    };
  }, [resetCharmPosition]);

  /**
   * Listen for MouseConstraint events from Matter.js
   * to detect when the physics engine grabs/releases the body.
   */
  useEffect(() => {
    const mc = mouseConstraintRef.current;
    const engine = engineRef.current;
    if (!mc || !engine) return;

    const onStartDrag = (): void => {
      const hitState = getState();
      if (!hitState.isDragging) {
        startDrag();
        setInteractionState('dragging');
      }
    };

    const onEndDrag = (): void => {
      // The mouseup handler will resolve the final state
    };

    Events.on(mc, 'startdrag', onStartDrag);
    Events.on(mc, 'enddrag', onEndDrag);

    return () => {
      Events.off(mc, 'startdrag', onStartDrag);
      Events.off(mc, 'enddrag', onEndDrag);
    };
  }, [mouseConstraintRef.current, engineRef.current, startDrag, getState, setInteractionState]);

  if (!isVisible) return <></>;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'transparent',
        pointerEvents: 'auto',
      }}
    />
  );
}
