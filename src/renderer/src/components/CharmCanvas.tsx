/**
 * Nazar Battu — CharmCanvas Component
 *
 * Full-window canvas that renders the 12-point Verlet rope and charm talisman.
 * Runs a requestAnimationFrame loop syncing Verlet particle positions
 * to canvas drawing calls. Handles hit-testing, cursor wind momentum,
 * and mouse drag/fling interactions.
 *
 * See docs/TRD.md §5 for the rendering pipeline architecture.
 */

import { useRef, useEffect, useCallback, type JSX } from 'react';
import { usePhysics } from '../hooks/usePhysics';
import { useHitTest } from '../hooks/useHitTest';
import { useStore } from '../store/useStore';
import { getCharm } from '../charms';
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
  const setMenuOpen = useStore((s) => s.setMenuOpen);
  const isMenuOpen = useStore((s) => s.isMenuOpen);

  // Get active charm definition
  const charm = getCharm(activeCharmId);

  // 12-particle Verlet physics engine
  const { verletRopeRef, stepPhysics, resetCharmPosition } = usePhysics({
    charmId: activeCharmId,
    canvasRef,
    enabled: isVisible,
  });

  // Hit-testing with hysteresis + IPC toggle
  const { checkHitArea, startDrag, endDrag, getState } = useHitTest();

  /**
   * Draw the rope segments with authentic multi-layer cord styling.
   * Renders through all 12 Verlet points with braided core, gradient thread tint,
   * and stitched accent dashes.
   */
  const drawRope = useCallback(
    (ctx: CanvasRenderingContext2D, points: { x: number; y: number }[]) => {
      if (points.length < 2) return;

      const traceRopePath = () => {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
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
      } else if (activeCharmId === 'ghanta') {
        // Temple brass bell: sacred red cord with radiant gold stitching
        traceRopePath();
        ctx.strokeStyle = '#880e4f';
        ctx.lineWidth = 2.4;
        ctx.stroke();

        traceRopePath();
        ctx.strokeStyle = '#e65100';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        traceRopePath();
        ctx.strokeStyle = '#ffd54f';
        ctx.lineWidth = 0.8;
        ctx.setLineDash([2, 5]);
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
    [activeCharmId],
  );

  /**
   * Main render loop — requestAnimationFrame.
   * Advances Verlet physics, clears canvas (transparent), draws braided rope,
   * draws charm at bottom node, and runs hit-testing.
   */
  const renderLoop = useCallback(() => {
    const canvas = canvasRef.current;
    const verlet = verletRopeRef.current;
    if (!canvas || !verlet || !charm) {
      animFrameRef.current = requestAnimationFrame(renderLoop);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    // Advance Verlet simulation
    stepPhysics(1 / 60);

    // Reset transform to identity and clear entire canvas (transparent)
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Scale for HiDPI
    ctx.save();
    ctx.scale(dpr, dpr);

    // Draw the multi-layer rope cord through all 12 Verlet points
    drawRope(ctx, verlet.pts);

    // Extract current bottom talisman state and tangent angle
    const charmPos = verlet.end;
    const charmAngle = verlet.endAngle();

    // Draw the charm synced to bottom Verlet node
    charm.render({
      ctx,
      position: charmPos,
      angle: charmAngle,
      dpr,
      ropePoints: verlet.pts,
    });

    // CRITICAL: restore canvas transform state to prevent scale(dpr, dpr)
    // from multiplying exponentially every frame on HiDPI/laptop displays (dpr > 1)
    ctx.restore();

    // Hit-test for IPC toggle (bypassed while context menu is open to prevent pass-through click bleed)
    if (!isMenuOpen) {
      checkHitArea(
        cursorPosRef.current.x,
        cursorPosRef.current.y,
        { position: charmPos },
        charm,
      );
    }

    // Continue loop
    animFrameRef.current = requestAnimationFrame(renderLoop);
  }, [verletRopeRef, charm, drawRope, stepPhysics, checkHitArea, isMenuOpen]);

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
   * Mouse event handlers for hit-testing, rope breeze, and drag/fling lifecycle.
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isVisible) return;

    const handleMouseMove = (e: MouseEvent): void => {
      cursorPosRef.current = { x: e.clientX, y: e.clientY };

      const hitState = getState();
      const verlet = verletRopeRef.current;

      if (hitState.isDragging && verlet) {
        canvas.style.cursor = 'grabbing';
        verlet.dragTo(e.clientX, e.clientY);
      } else if (verlet) {
        verlet.setMouse(e.clientX, e.clientY);
        canvas.style.cursor = hitState.isInside ? 'grab' : 'default';
      }
    };

    const handleMouseDown = (e: MouseEvent): void => {
      const hitState = getState();
      const verlet = verletRopeRef.current;
      if (hitState.isInside && !hitState.isDragging && verlet) {
        startDrag();
        setInteractionState('dragging');
        canvas.style.cursor = 'grabbing';
        verlet.startDrag(e.clientX, e.clientY);
        if (audioEnabled) {
          playChime(activeCharmId, 0.25);
        }
      }
    };

    const handleMouseUp = (e: MouseEvent): void => {
      const hitState = getState();
      const verlet = verletRopeRef.current;
      if (hitState.isDragging && verlet && charm) {
        const releaseVx = verlet.mVX;
        const releaseVy = verlet.mVY;
        const speed = Math.hypot(releaseVx, releaseVy);

        // End drag with momentum fling transfer
        verlet.endDrag(releaseVx, releaseVy);

        if (audioEnabled && speed > 2.0) {
          playSwish(speed, 0.2);
        }

        const isInside = endDrag(
          e.clientX,
          e.clientY,
          { position: verlet.end },
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

    const handleContextMenu = (e: MouseEvent): void => {
      e.preventDefault();
      const hitState = getState();
      if (hitState.isInside || hitState.isDragging) {
        setMenuOpen(true);
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('dblclick', handleDoubleClick);
    canvas.addEventListener('contextmenu', handleContextMenu);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('dblclick', handleDoubleClick);
      canvas.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [isVisible, charm, audioEnabled, startDrag, endDrag, getState, setInteractionState, verletRopeRef, resetCharmPosition]);

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

  return <canvas ref={canvasRef} id="charm-canvas" />;
}
