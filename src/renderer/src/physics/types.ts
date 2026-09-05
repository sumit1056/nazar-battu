/**
 * Nazar Battu — Physics Type Definitions
 *
 * All tunable physics constants and composite types for the rope chain system.
 * See docs/TRD.md §4 for the constraint chain architecture.
 */

import type { Body, Constraint, Composite } from 'matter-js';

/** All tunable physics constants — centralized for easy tweaking */
export interface PhysicsConfig {
  /** World gravity vector */
  gravity: { x: number; y: number };

  /** Air friction applied to all bodies (slows oscillation) */
  airFriction: number;

  /** Number of invisible link segments in the rope chain */
  ropeSegmentCount: number;

  /** Distance in pixels between each rope link */
  ropeSegmentLength: number;

  /** Constraint stiffness (0-1): how rigid the rope connections are */
  ropeStiffness: number;

  /** Constraint damping: how quickly oscillation in constraints decays */
  ropeDamping: number;

  /** Mass of the charm body at the end of the chain */
  charmMass: number;

  /** Maximum ambient sway force applied during idle state */
  ambientForceMax: number;

  /** Scaling factor for hover breeze force */
  breezeForceMultiplier: number;

  /** Radius in pixels within which cursor proximity applies breeze force */
  breezeRadius: number;
}

/** Default physics configuration — calibrated for natural pendulum feel */
export const DEFAULT_PHYSICS_CONFIG: PhysicsConfig = {
  gravity: { x: 0, y: 1.5 },
  airFriction: 0.008, // 4–6 oscillations before settling
  ropeSegmentCount: 8,
  ropeSegmentLength: 18,
  ropeStiffness: 0.95, // High stiffness for non-stretchy cord feel
  ropeDamping: 0.01,   // Low damping to avoid elastic feel
  charmMass: 5,
  ambientForceMax: 0.0005,
  breezeForceMultiplier: 0.002,
  breezeRadius: 200,
};

/** The complete rope chain composite — anchor, links, constraints, and charm body */
export interface RopeChain {
  /** Static anchor body pinned at top-center */
  anchor: Body;

  /** Invisible circular link bodies connecting anchor to charm */
  links: Body[];

  /** Constraints chaining anchor → links → charm */
  constraints: Constraint[];

  /** The visible charm body at the end of the chain */
  charmBody: Body;

  /** Matter.js composite containing all bodies and constraints */
  composite: Composite;
}
