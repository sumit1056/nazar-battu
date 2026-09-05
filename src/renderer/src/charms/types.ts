/**
 * Nazar Battu — Charm Type Definitions
 *
 * Modular charm system: each charm implements this interface to provide
 * physics body configuration and canvas rendering logic.
 * See docs/TRD.md §5.2 for the asset architecture.
 */

import type { Body } from 'matter-js';

/** Rendering context passed to charm draw functions */
export interface CharmRenderContext {
  /** Canvas 2D rendering context */
  ctx: CanvasRenderingContext2D;
  /** Current position of the charm's Matter.js body */
  position: { x: number; y: number };
  /** Current rotation angle of the charm's Matter.js body (radians) */
  angle: number;
  /** Device pixel ratio for crisp rendering on HiDPI displays */
  dpr: number;
  /** Optional rope chain node positions from anchor to charm for articulated rendering */
  ropePoints?: { x: number; y: number }[];
}

/** Definition interface for all charms — physics + rendering */
export interface CharmDefinition {
  /** Unique identifier */
  id: string;
  /** Display name for tray menu */
  name: string;
  /** Short description */
  description: string;

  // --- Physics body configuration ---
  /** Shape type for the Matter.js body */
  bodyShape: 'rectangle' | 'circle' | 'vertices';
  /** Dimensions of the physics body in pixels */
  bodyDimensions: { width: number; height: number };
  /** Mass of the charm body */
  mass: number;
  /** Offset from body center to rope attachment point */
  ropeAttachOffset: { x: number; y: number };

  // --- Rendering ---
  /** Draw the charm on the canvas, transformed to match physics body state */
  render: (context: CharmRenderContext) => void;

  /** Extra padding around body AABB for hit-testing (pixels) */
  hitAreaPadding: number;
}
