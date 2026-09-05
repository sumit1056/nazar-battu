/**
 * Nazar Battu — Matter.js Engine Setup
 *
 * Creates and configures the physics engine with custom gravity.
 * Uses a fixed-timestep runner for deterministic simulation.
 * See docs/TRD.md §4.1 for configuration rationale.
 */

import { Engine, Runner } from 'matter-js';
import type { PhysicsConfig } from './types';
import { DEFAULT_PHYSICS_CONFIG } from './types';

/**
 * Create a configured Matter.js engine with custom gravity and timing.
 *
 * @param config - Physics configuration (defaults to DEFAULT_PHYSICS_CONFIG)
 * @returns Configured Matter.js Engine instance
 */
export function createPhysicsEngine(config: PhysicsConfig = DEFAULT_PHYSICS_CONFIG): Engine {
  const engine = Engine.create({
    gravity: {
      x: config.gravity.x,
      y: config.gravity.y,
      scale: 0.001, // Default Matter.js gravity scale
    },
  });

  return engine;
}

/**
 * Create a fixed-timestep runner for deterministic physics.
 * Delta is fixed at ~60fps (16.67ms) to prevent physics instability
 * on high-refresh-rate displays.
 *
 * @returns Configured Matter.js Runner instance
 */
export function createPhysicsRunner(): Runner {
  return Runner.create({
    isFixed: true,
    delta: 1000 / 60, // Fixed 60fps timestep
  });
}
