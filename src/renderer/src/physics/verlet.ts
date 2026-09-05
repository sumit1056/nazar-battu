/**
 * Nazar Battu — Authentic Verlet Rope Physics Engine
 *
 * Direct mathematical implementation inspired by Lucky Dangle's core simulation:
 * - 12-particle Verlet integration with 0.98 air damping and 0.125 gravity.
 * - 5-pass distance constraint relaxation (zero elastic springiness / zero jitter).
 * - Full-cord cursor repulsion: intermediate string segments physically bow away from cursor.
 * - Mouse velocity momentum transfer: fast cursor sweeps inject wind gusts into the talisman.
 * - Harmonic ocean-wave ambient sway: dual-sine oscillation scaled by link depth.
 * - Taut leash drag clamping: dragging respects a physical 1.4x maximum cord length.
 */

export interface VerletPoint {
  x: number;
  y: number;
  px: number; // Previous X for Verlet velocity: vx = (x - px) * damping
  py: number; // Previous Y for Verlet velocity: vy = (y - py) * damping
}

export interface VerletRopeOptions {
  pointCount?: number;     // Number of particle nodes (default: 12)
  segmentLength?: number;  // Distance between nodes (default: 15.5px)
  hangOffset?: number;     // Charm anchor attachment offset (default: 0)
  anchorX?: number;        // Static anchor ceiling X (default: screen center)
  anchorY?: number;        // Static anchor ceiling Y (default: 0)
}

export class VerletRope {
  public pts: VerletPoint[];
  public anchorX: number;
  public anchorY: number;
  public anchorXTarget: number | null = null;
  public minAX: number = 90;
  public maxAX: number = 2500;

  public isDragging: boolean = false;
  public dragTarget: { x: number; y: number } | null = null;

  public mouse: { x: number; y: number } | null = null;
  private lastMouse: { x: number; y: number } | null = null;
  public mVX: number = 0;
  public mVY: number = 0;
  public elapsed: number = 0;

  public readonly pointCount: number;
  public readonly segmentLength: number;
  public hangOffset: number;
  private maxLen: number;

  constructor(options: VerletRopeOptions = {}) {
    this.pointCount = options.pointCount ?? 12;
    this.segmentLength = options.segmentLength ?? 15.5;
    this.hangOffset = options.hangOffset ?? 0;
    this.anchorX = options.anchorX ?? (typeof window !== 'undefined' ? window.innerWidth / 2 : 500);
    this.anchorY = options.anchorY ?? 0;
    this.maxLen = this.segmentLength * (this.pointCount - 1) * 1.4;

    this.pts = Array.from({ length: this.pointCount }, (_, i) => ({
      x: this.anchorX,
      y: this.anchorY + i * this.segmentLength,
      px: this.anchorX,
      py: this.anchorY + i * this.segmentLength,
    }));
  }

  /** Bottom talisman node at end of the rope */
  get end(): VerletPoint {
    return this.pts[this.pointCount - 1];
  }

  /** Rest length of the entire cord */
  get restLength(): number {
    return this.segmentLength * (this.pointCount - 1);
  }

  /** Current rotation angle of the bottom talisman relative to vertical */
  public endAngle(): number {
    const pPrev = this.pts[this.pointCount - 2];
    const pEnd = this.pts[this.pointCount - 1];
    return Math.atan2(pEnd.x - pPrev.x, pEnd.y - pPrev.y);
  }

  /**
   * Interpolate position and tangent angle along the 12-particle polyline.
   * @param t Normalized position along the cord (0.0 = top anchor, 1.0 = bottom talisman)
   */
  public interpolated(t: number): { x: number; y: number; angle: number } {
    const clamped = Math.min(Math.max(t, 0), 1) * (this.pointCount - 1);
    const idx = Math.min(Math.floor(clamped), this.pointCount - 2);
    const frac = clamped - idx;
    const a = this.pts[idx];
    const b = this.pts[idx + 1];

    return {
      x: a.x + (b.x - a.x) * frac,
      y: a.y + (b.y - a.y) * frac,
      angle: Math.atan2(b.x - a.x, b.y - a.y),
    };
  }

  /** Apply an impulsive flick to the bottom of the talisman */
  public flick(impulse = 18): void {
    this.end.px += (impulse + Math.random() * 8) * (Math.random() < 0.5 ? 1 : -1);
  }

  /** Begin user drag interaction */
  public startDrag(x: number, y: number): void {
    this.isDragging = true;
    this.dragTo(x, y);
  }

  /** Update drag target with taut leash distance clamping */
  public dragTo(x: number, y: number): void {
    const dx = x - this.anchorX;
    const dy = y - this.anchorY;
    const dist = Math.max(Math.hypot(dx, dy), 1);
    const clampedDist = Math.min(Math.max(dist - this.hangOffset, 1), this.maxLen);

    this.dragTarget = {
      x: this.anchorX + (dx / dist) * clampedDist,
      y: this.anchorY + (dy / dist) * clampedDist,
    };
  }

  /** Release drag with velocity momentum transfer */
  public endDrag(releaseVx = 0, releaseVy = 0): void {
    this.isDragging = false;
    this.dragTarget = null;

    if (Math.abs(releaseVx) > 0.5 || Math.abs(releaseVy) > 0.5) {
      this.end.px -= Math.max(-25, Math.min(25, releaseVx)) * 0.7;
      this.end.py -= Math.max(-25, Math.min(25, releaseVy)) * 0.7;
    }
  }

  /** Update cursor position for breeze and momentum interaction */
  public setMouse(x: number, y: number): void {
    this.mouse = { x, y };
  }

  /** Clear cursor when mouse leaves the window or inactive */
  public clearMouse(): void {
    this.mouse = null;
    this.lastMouse = null;
    this.mVX = 0;
    this.mVY = 0;
  }

  /** Reset talisman to static vertical resting state */
  public reset(anchorX?: number, anchorY?: number): void {
    if (anchorX !== undefined) this.anchorX = anchorX;
    if (anchorY !== undefined) this.anchorY = anchorY;

    for (let i = 0; i < this.pointCount; i++) {
      const pt = this.pts[i];
      pt.x = pt.px = this.anchorX;
      pt.y = pt.py = this.anchorY + i * this.segmentLength;
    }
    this.flick(14);
  }

  /** Advance simulation by dt (standard 1/60s) */
  public step(dt = 1 / 60): void {
    this.elapsed += dt;
    const t = this.pts;
    const endNode = this.end;

    // 1. Natural harmonic ocean-wave ambient sway
    const sway = 0.0035 * Math.sin(this.elapsed * 0.55) + 0.002 * Math.sin(this.elapsed * 1.3 + 0.8);

    // 2. Verlet integration + gravity + ambient sway
    for (let a = 1; a < this.pointCount; a++) {
      const node = t[a];
      const vx = (node.x - node.px) * 0.98; // 0.98 air damping
      const vy = (node.y - node.py) * 0.98;
      node.px = node.x;
      node.py = node.y;

      // Sway amplitude scales linearly from 0 at ceiling to 1 at bottom talisman
      node.x += vx + sway * (a / (this.pointCount - 1));
      node.y += vy + 0.125; // Gentle constant gravity
    }

    // 3. Cursor breeze, wind gust velocity transfer & rope bowing
    if (this.mouse && !this.isDragging) {
      if (this.lastMouse) {
        this.mVX = this.mVX * 0.75 + (this.mouse.x - this.lastMouse.x) * 0.25;
        this.mVY = this.mVY * 0.75 + (this.mouse.y - this.lastMouse.y) * 0.25;
      }
      this.lastMouse = this.mouse;

      // Talisman proximity repulsion & wind momentum injection
      const angle = this.endAngle();
      const tx = endNode.x + this.hangOffset * Math.sin(angle);
      const ty = endNode.y + this.hangOffset * Math.cos(angle);
      const dx = tx - this.mouse.x;
      const dy = ty - this.mouse.y;
      const dist = Math.hypot(dx, dy);
      const radius = 46;

      if (dist < radius && dist > 0.5) {
        const u = (radius - dist) / radius;
        const pushMag = u * u * 0.45;
        const velFactor = u * 0.12;

        const pushX = (dx / dist) * pushMag + Math.max(-14, Math.min(14, this.mVX)) * velFactor;
        const pushY = (dy / dist) * pushMag + Math.max(-14, Math.min(14, this.mVY)) * velFactor * 0.35;

        endNode.x += pushX;
        endNode.y += pushY;
      }

      // Middle rope segments repulsion (cord physically bows and curves away from cursor!)
      for (let u = 1; u < this.pointCount - 2; u++) {
        const node = t[u];
        const nx = node.x - this.mouse.x;
        const ny = node.y - this.mouse.y;
        const distSq = nx * nx + ny * ny;

        if (distSq < 1600 && distSq > 1) { // 40px interaction radius (1600 = 40^2)
          const d = Math.sqrt(distSq);
          const push = ((40 - d) / 40) * 0.85;
          node.x += (nx / d) * push;
          node.y += (ny / d) * push;
        }
      }
    } else {
      this.lastMouse = null;
      this.mVX = 0;
      this.mVY = 0;
    }

    // 4. Sideways ceiling slide if dragged horizontally near ceiling
    if (this.isDragging && this.dragTarget && this.dragTarget.y < 60) {
      this.anchorX += (this.dragTarget.x - this.anchorX) * 0.12;
      this.anchorX = Math.min(Math.max(this.anchorX, this.minAX), this.maxAX);
    }

    // 5. 5-pass Gauss-Seidel distance constraint relaxation
    const seg = this.segmentLength;
    for (let pass = 0; pass < 5; pass++) {
      t[0].x = this.anchorX;
      t[0].y = this.anchorY;

      if (this.isDragging && this.dragTarget) {
        endNode.x = this.dragTarget.x;
        endNode.y = this.dragTarget.y;
      }

      for (let j = 0; j < this.pointCount - 1; j++) {
        const d = t[j];
        const c = t[j + 1];
        const h = c.x - d.x;
        const g = c.y - d.y;
        const dist = Math.max(Math.hypot(h, g), 1e-4);
        const diff = (dist - seg) / dist / 2;
        const offsetX = h * diff;
        const offsetY = g * diff;

        if (j === 0) {
          // Pinned ceiling anchor
          c.x -= offsetX * 2;
          c.y -= offsetY * 2;
        } else if (this.isDragging && j === this.pointCount - 2) {
          // Bottom end held firmly by cursor drag
          d.x += offsetX * 2;
          d.y += offsetY * 2;
        } else {
          d.x += offsetX;
          d.y += offsetY;
          c.x -= offsetX;
          c.y -= offsetY;
        }
      }
    }
  }
}
