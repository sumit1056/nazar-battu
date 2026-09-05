/**
 * Nazar Battu — Authentic Multi-Layer Nimbu-Mirchi Charm
 *
 * Culturally authentic Indian protective talisman:
 * - Upper cord threaded with sacred gold and protective glass evil eye beads.
 * - 7 green chilies pierced horizontally across the sacred black cord with organic tilt jitter.
 * - Glossy yellow lemon at the bottom.
 * - Piece of black charcoal (koyla / nazar battu) at the base to absorb evil glances.
 *
 * Fully articulated along the Matter.js physics rope chain for fluid dynamic flexing.
 */

import type { CharmDefinition, CharmRenderContext } from './types';
import { getRopeInterpolation } from '../physics/rope';

// Import individual authentic multi-layer sprites
import chili1Url from '../assets/charms/nimbu/nimbu-chili-1.png';
import chili2Url from '../assets/charms/nimbu/nimbu-chili-2.png';
import chili3Url from '../assets/charms/nimbu/nimbu-chili-3.png';
import chili4Url from '../assets/charms/nimbu/nimbu-chili-4.png';
import chili5Url from '../assets/charms/nimbu/nimbu-chili-5.png';
import chili6Url from '../assets/charms/nimbu/nimbu-chili-6.png';
import chili7Url from '../assets/charms/nimbu/nimbu-chili-7.png';
import lemonUrl from '../assets/charms/nimbu/nimbu-lemon.png';
import coalUrl from '../assets/charms/nimbu/nimbu-coal.png';

// Pre-load all sprite images
function loadImage(src: string): HTMLImageElement | null {
  if (typeof Image === 'undefined') return null;
  const img = new Image();
  img.src = src;
  return img;
}

const chiliImages = [
  loadImage(chili1Url),
  loadImage(chili2Url),
  loadImage(chili3Url),
  loadImage(chili4Url),
  loadImage(chili5Url),
  loadImage(chili6Url),
  loadImage(chili7Url),
];

const lemonImg = loadImage(lemonUrl);
const coalImg = loadImage(coalUrl);

/** 7 chilies configuration matching authentic Indian horizontal piercing layout */
interface ChiliSlot {
  spriteIndex: number;
  width: number;
  height: number;
  jitter: number;
  flip: boolean;
  t: number; // Normalized rope station (0 = top anchor, 1 = bottom lemon)
}

const CHILI_SLOTS: ChiliSlot[] = [
  { spriteIndex: 1, width: 66.0, height: 8.2, jitter: 0.08, flip: false, t: 0.46 }, // Chili 2
  { spriteIndex: 4, width: 42.3, height: 11.3, jitter: -0.12, flip: true, t: 0.52 }, // Chili 5
  { spriteIndex: 2, width: 55.6, height: 11.3, jitter: 0.05, flip: false, t: 0.58 }, // Chili 3
  { spriteIndex: 6, width: 59.1, height: 9.0, jitter: -0.08, flip: true, t: 0.64 }, // Chili 7
  { spriteIndex: 0, width: 65.2, height: 16.2, jitter: 0.13, flip: false, t: 0.70 }, // Chili 1
  { spriteIndex: 3, width: 57.8, height: 12.1, jitter: -0.05, flip: true, t: 0.76 }, // Chili 4
  { spriteIndex: 5, width: 56.8, height: 10.1, jitter: 0.10, flip: false, t: 0.82 }, // Chili 6
];

/** Draw a 3D glass or gold bead at (x, y) */
function drawBead(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  type: 'gold' | 'eye',
): void {
  ctx.save();
  ctx.translate(x, y);

  if (type === 'gold') {
    // 3D shiny gold bead with radial metallic gradient
    const grad = ctx.createRadialGradient(-radius * 0.3, -radius * 0.3, radius * 0.1, 0, 0, radius);
    grad.addColorStop(0, '#ffe685');
    grad.addColorStop(0.4, '#edb52e');
    grad.addColorStop(0.85, '#b8860b');
    grad.addColorStop(1, '#6b4505');

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Specular highlight
    ctx.beginPath();
    ctx.ellipse(-radius * 0.35, -radius * 0.35, radius * 0.35, radius * 0.2, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fill();
  } else {
    // Concentric protective evil eye glass bead
    const grad = ctx.createRadialGradient(-radius * 0.25, -radius * 0.25, radius * 0.1, 0, 0, radius);
    grad.addColorStop(0, '#3f51b5');
    grad.addColorStop(0.7, '#1a237e');
    grad.addColorStop(1, '#0d1642');

    // Outer dark blue glass
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // White circle
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.58, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Turquoise iris
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.38, 0, Math.PI * 2);
    ctx.fillStyle = '#29b6f6';
    ctx.fill();

    // Dark pupil
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.18, 0, Math.PI * 2);
    ctx.fillStyle = '#0a0a14';
    ctx.fill();

    // Specular glass shine
    ctx.beginPath();
    ctx.ellipse(-radius * 0.4, -radius * 0.4, radius * 0.3, radius * 0.18, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fill();
  }

  ctx.restore();
}

/** The Nimbu-Mirchi charm definition */
export const nimbuMirchiCharm: CharmDefinition = {
  id: 'nimbu-mirchi',
  name: 'Nimbu-Mirchi',
  description: 'Seven chilies, lemon, and charcoal — authentic talisman to ward off the evil eye',

  bodyShape: 'rectangle',
  bodyDimensions: { width: 56, height: 72 },
  mass: 5,
  ropeAttachOffset: { x: 0, y: -24 },

  hitAreaPadding: 24,

  render({ ctx, position, angle, ropePoints }: CharmRenderContext): void {
    const hasRope = Boolean(ropePoints && ropePoints.length >= 2);

    // 1. Draw decorative beads along upper cord
    if (hasRope && ropePoints) {
      const b1 = getRopeInterpolation(ropePoints, 0.15);
      const b2 = getRopeInterpolation(ropePoints, 0.25);
      const b3 = getRopeInterpolation(ropePoints, 0.35);

      drawBead(ctx, b1.x, b1.y, 4.2, 'gold');
      drawBead(ctx, b2.x, b2.y, 7.2, 'eye');
      drawBead(ctx, b3.x, b3.y, 4.2, 'gold');
    }

    // 2. Draw 7 articulated chilies pierced horizontally across the cord
    for (const slot of CHILI_SLOTS) {
      const img = chiliImages[slot.spriteIndex];
      if (!img || img.naturalWidth === 0) continue;

      let cx: number;
      let cy: number;
      let rot: number;

      if (hasRope && ropePoints) {
        const pt = getRopeInterpolation(ropePoints, slot.t);
        cx = pt.x;
        cy = pt.y;
        rot = pt.angle + slot.jitter;
      } else {
        // Fallback: stack along body
        cx = position.x;
        cy = position.y - 70 + slot.t * 50;
        rot = angle + slot.jitter;
      }

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);

      if (slot.flip) {
        ctx.scale(-1, 1);
      }

      // Soft natural drop shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.22)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetY = 3;

      ctx.drawImage(img, -slot.width / 2, -slot.height / 2, slot.width, slot.height);
      ctx.restore();
    }

    // 3. Draw Lemon and Charcoal (Koyla) at the bottom end of the cord
    ctx.save();
    ctx.translate(position.x, position.y);
    ctx.rotate(angle);

    ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 4;

    // Lemon
    const lemonW = 44;
    const lemonH = 48.6;
    if (lemonImg && lemonImg.naturalWidth > 0) {
      ctx.drawImage(lemonImg, -lemonW / 2, -lemonH / 2, lemonW, lemonH);
    }

    // Coal (tied right beneath lemon at base of the talisman)
    const coalW = 21;
    const coalH = 18.8;
    const coalY = lemonH / 2 - 4;
    if (coalImg && coalImg.naturalWidth > 0) {
      ctx.drawImage(coalImg, -coalW / 2, coalY, coalW, coalH);
    }

    ctx.restore();
  },
};
