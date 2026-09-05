/**
 * Nazar Battu — Rope Chain Constraint Builder
 *
 * Constructs the anchor → link chain → charm body constraint system.
 * See docs/TRD.md §4.2 for the constraint chain architecture diagram.
 *
 * Structure:
 *   Anchor (static) → Link1 → Link2 → Link3 → Link4 → CharmBody
 *   Each connection is a Matter.js Constraint with configurable stiffness/damping.
 */

import { Bodies, Body, Composite, Constraint } from 'matter-js';
import type { PhysicsConfig, RopeChain } from './types';
import { DEFAULT_PHYSICS_CONFIG } from './types';

// Collision categories — used to separate rope links from charm for MouseConstraint
export const ROPE_CATEGORY = 0x0001;
export const CHARM_CATEGORY = 0x0002;

/**
 * Build the complete rope chain from anchor to charm body.
 *
 * @param anchorX - X coordinate of the anchor point (typically screen center)
 * @param anchorY - Y coordinate of the anchor point (typically 0)
 * @param charmWidth - Width of the charm body in pixels
 * @param charmHeight - Height of the charm body in pixels
 * @param config - Physics configuration
 * @returns Complete RopeChain with all bodies, constraints, and composite
 */
export function createRopeChain(
  anchorX: number,
  anchorY: number,
  charmWidth: number,
  charmHeight: number,
  config: PhysicsConfig = DEFAULT_PHYSICS_CONFIG,
): RopeChain {
  // Static anchor body — pinned at top-center, invisible, immovable
  const anchor = Bodies.circle(anchorX, anchorY, 2, {
    isStatic: true,
    render: { visible: false },
    collisionFilter: {
      category: ROPE_CATEGORY,
      mask: 0, // Collides with nothing
    },
  });

  // Build invisible link bodies for the rope chain
  const links: Body[] = [];
  for (let i = 0; i < config.ropeSegmentCount; i++) {
    const linkY = anchorY + (i + 1) * config.ropeSegmentLength;
    const link = Bodies.circle(anchorX, linkY, 2, {
      mass: 0.1,
      frictionAir: config.airFriction,
      render: { visible: false },
      collisionFilter: {
        category: ROPE_CATEGORY,
        mask: 0, // Collides with nothing — ghost bodies
      },
    });
    links.push(link);
  }

  // Charm body — the visible talisman at the end of the chain
  const charmY = anchorY + (config.ropeSegmentCount + 1) * config.ropeSegmentLength;
  const charmBody = Bodies.rectangle(anchorX, charmY, charmWidth, charmHeight, {
    mass: config.charmMass,
    frictionAir: config.airFriction,
    friction: 0.1,
    restitution: 0.05,
    collisionFilter: {
      category: CHARM_CATEGORY,
      mask: 0, // No physical collisions — only MouseConstraint interaction
    },
  });

  // Build constraint chain: anchor → link1 → link2 → ... → charmBody
  const constraints: Constraint[] = [];
  const allBodies = [anchor, ...links, charmBody];

  for (let i = 0; i < allBodies.length - 1; i++) {
    const constraint = Constraint.create({
      bodyA: allBodies[i],
      bodyB: allBodies[i + 1],
      length: config.ropeSegmentLength,
      stiffness: config.ropeStiffness,
      damping: config.ropeDamping,
      render: { visible: false },
    });
    constraints.push(constraint);
  }

  // Assemble into a single composite for easy world management
  const composite = Composite.create({ label: 'RopeChain' });
  Composite.add(composite, [anchor, ...links, charmBody, ...constraints]);

  return {
    anchor,
    links,
    constraints,
    charmBody,
    composite,
  };
}

/**
 * Extract an array of 2D node points from anchor through links to charm.
 */
export function getRopePoints(ropeChain: RopeChain): { x: number; y: number }[] {
  return [
    { x: ropeChain.anchor.position.x, y: ropeChain.anchor.position.y },
    ...ropeChain.links.map((link) => ({ x: link.position.x, y: link.position.y })),
    { x: ropeChain.charmBody.position.x, y: ropeChain.charmBody.position.y },
  ];
}

/**
 * Interpolate a point and tangent angle along the polyline formed by rope nodes.
 * @param points Array of rope node coordinates
 * @param t Normalized position along the rope (0 = anchor, 1 = bottom charm)
 */
export function getRopeInterpolation(
  points: { x: number; y: number }[],
  t: number,
): { x: number; y: number; angle: number } {
  if (points.length === 0) return { x: 0, y: 0, angle: 0 };
  if (points.length === 1) return { x: points[0].x, y: points[0].y, angle: 0 };

  const clampedT = Math.max(0, Math.min(1, t));
  const scaled = clampedT * (points.length - 1);
  const index = Math.min(Math.floor(scaled), points.length - 2);
  const fraction = scaled - index;

  const p0 = points[index];
  const p1 = points[index + 1];

  const dx = p1.x - p0.x;
  const dy = p1.y - p0.y;

  return {
    x: p0.x + dx * fraction,
    y: p0.y + dy * fraction,
    angle: Math.atan2(dx, dy), // Angle from vertical
  };
}
