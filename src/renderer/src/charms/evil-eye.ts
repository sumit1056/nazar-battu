/**
 * Nazar Battu — Authentic Evil Eye Charm (Nazar Boncuğu)
 *
 * Authentic Mediterranean cobalt blue glass talisman:
 * - Upper cord threaded with pearl white glass and concentric evil eye beads.
 * - High-resolution handcrafted cobalt glass talisman with subtle translucency.
 * - Suspended on a braided steel cord with natural pendulum motion.
 */

import type { CharmDefinition, CharmRenderContext } from './types';
import { getRopeInterpolation } from '../physics/rope';
import { drawWhiteBead, drawEyeBead } from './beads';
import nazarImgUrl from '../assets/charms/nazar.png';

const nazarImg = typeof Image !== 'undefined' ? new Image() : null;
if (nazarImg) {
  nazarImg.src = nazarImgUrl;
}

export const evilEyeCharm: CharmDefinition = {
  id: 'evil-eye',
  name: 'Evil Eye (Nazar Boncuğu)',
  description: 'Ancient cobalt blue glass talisman with protective concentric rings',

  bodyShape: 'circle',
  bodyDimensions: { width: 68, height: 68 },
  mass: 6,
  ropeAttachOffset: { x: 0, y: -24 },

  hitAreaPadding: 22,

  render({ ctx, position, angle, ropePoints }: CharmRenderContext): void {
    const hasRope = Boolean(ropePoints && ropePoints.length >= 2);

    // 1. Draw decorative pearl and eye beads along the cord
    if (hasRope && ropePoints) {
      const b1 = getRopeInterpolation(ropePoints, 0.40);
      const b2 = getRopeInterpolation(ropePoints, 0.60);
      const b3 = getRopeInterpolation(ropePoints, 0.80);

      drawWhiteBead(ctx, b1.x, b1.y, 4.5);
      drawEyeBead(ctx, b2.x, b2.y, 7.5);
      drawWhiteBead(ctx, b3.x, b3.y, 4.5);
    }

    // 2. Draw high-resolution cobalt glass Nazar talisman
    ctx.save();
    ctx.translate(position.x, position.y);
    ctx.rotate(angle);

    // Soft ambient glass drop shadow
    ctx.shadowColor = 'rgba(10, 20, 50, 0.28)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 4;

    const size = 66;
    if (nazarImg && nazarImg.naturalWidth > 0) {
      ctx.drawImage(nazarImg, -size / 2, -size / 2, size, size);
    } else {
      // Fallback vector drawing
      const radius = size / 2;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#1a237e';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.65, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = '#0288d1';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.18, 0, Math.PI * 2);
      ctx.fillStyle = '#111111';
      ctx.fill();
    }

    ctx.restore();
  },
};
