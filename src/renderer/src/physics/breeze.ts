/**
 * Nazar Battu — Hover Breeze Force Calculator
 *
 * Applies a gentle force to the charm body when the cursor is within
 * proximity range. The force pushes the charm away from the cursor,
 * simulating a breeze effect. This happens entirely in the renderer
 * during PASSTHROUGH state — no IPC toggle needed.
 *
 * See docs/TRD.md §4.4 and docs/PRD.md FR-06 for specification.
 */

import { Body } from 'matter-js';
import type { PhysicsConfig } from './types';
import { DEFAULT_PHYSICS_CONFIG } from './types';

interface Vector2D {
  x: number;
  y: number;
}

/**
 * Apply a proximity-based "breeze" force that pushes the charm away from the cursor.
 *
 * The force is:
 * - Proportional to inverse distance (stronger when closer)
 * - Directed away from cursor position
 * - Reduced on the vertical axis (0.3x) for natural lateral sway
 * - Zero outside the configured breeze radius
 * - Zero inside a 10px deadzone to prevent singularity
 *
 * @param cursorPos - Current cursor position in canvas/world coordinates
 * @param charmBody - The Matter.js charm body to apply force to
 * @param config - Physics configuration with breeze parameters
 */
export function applyBreezeForce(
  cursorPos: Vector2D,
  charmBody: Body,
  config: PhysicsConfig = DEFAULT_PHYSICS_CONFIG,
): void {
  const dx = charmBody.position.x - cursorPos.x;
  const dy = charmBody.position.y - cursorPos.y;
  const distanceSq = dx * dx + dy * dy;
  const distance = Math.sqrt(distanceSq);

  // Outside breeze radius or inside deadzone — no force
  if (distance > config.breezeRadius || distance < 10) return;

  // Inverse distance scaling: stronger when cursor is closer to charm
  const strength =
    (1 - distance / config.breezeRadius) * config.breezeForceMultiplier;

  // Normalize direction vector and scale by strength
  const force: Vector2D = {
    x: (dx / distance) * strength,
    y: (dy / distance) * strength * 0.3, // Reduced vertical for lateral sway
  };

  Body.applyForce(charmBody, charmBody.position, force);
}

/**
 * Apply a subtle random ambient sway force to simulate micro-breeze at idle.
 * Called at low frequency (~every 2-3 seconds) to prevent the charm from
 * looking completely static.
 *
 * @param charmBody - The Matter.js charm body
 * @param maxForce - Maximum ambient force magnitude
 */
export function applyAmbientSway(
  charmBody: Body,
  maxForce: number = DEFAULT_PHYSICS_CONFIG.ambientForceMax,
): void {
  const force: Vector2D = {
    x: (Math.random() - 0.5) * 2 * maxForce,
    y: (Math.random() - 0.5) * maxForce * 0.3, // Mostly horizontal
  };

  Body.applyForce(charmBody, charmBody.position, force);
}
