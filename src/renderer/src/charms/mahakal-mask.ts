/**
 * Nazar Battu — Authentic Mahakal Demon Mask Charm (Drishti Bommai)
 *
 * Traditional Indian guardian face mounted on homes and vehicles to ward off buri nazar:
 * - Upper sacred cord threaded with gold and red striped protective talisman beads.
 * - Authentic high-resolution Drishti Bommai guardian mask with fierce fangs and demon eyes.
 * - Suspended on sacred vermilion red cord with gold accent thread stitches.
 */

import type { CharmDefinition, CharmRenderContext } from './types';
import { getRopeInterpolation } from '../physics/rope';
import { drawGoldBead, drawStripedBead } from './beads';
import drishtiImgUrl from '../assets/charms/drishti-bommai.png';

const drishtiImg = typeof Image !== 'undefined' ? new Image() : null;
if (drishtiImg) {
  drishtiImg.src = drishtiImgUrl;
}

export const mahakalMaskCharm: CharmDefinition = {
  id: 'mahakal-mask',
  name: 'Mahakal Demon Mask',
  description: 'Fierce Indian guardian face to ward off the evil eye and malicious gazes',

  bodyShape: 'rectangle',
  bodyDimensions: { width: 68, height: 86 },
  mass: 7,
  ropeAttachOffset: { x: 0, y: -32 },

  hitAreaPadding: 22,

  render({ ctx, position, angle, ropePoints }: CharmRenderContext): void {
    const hasRope = Boolean(ropePoints && ropePoints.length >= 2);

    // 1. Draw sacred gold and striped beads along vermilion cord
    if (hasRope && ropePoints) {
      const b1 = getRopeInterpolation(ropePoints, 0.38);
      const b2 = getRopeInterpolation(ropePoints, 0.58);
      const b3 = getRopeInterpolation(ropePoints, 0.78);

      drawGoldBead(ctx, b1.x, b1.y, 4.5);
      drawStripedBead(ctx, b2.x, b2.y, 7.5);
      drawGoldBead(ctx, b3.x, b3.y, 4.5);
    }

    // 2. Draw authentic high-resolution Drishti Bommai guardian mask
    ctx.save();
    ctx.translate(position.x, position.y);
    ctx.rotate(angle);

    ctx.shadowColor = 'rgba(25, 5, 0, 0.32)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 5;

    const w = 68;
    const h = 88;
    if (drishtiImg && drishtiImg.naturalWidth > 0) {
      ctx.drawImage(drishtiImg, -w / 2, -h / 2, w, h);
    } else {
      // Fallback vector mask
      ctx.beginPath();
      ctx.arc(0, 0, 30, 0, Math.PI * 2);
      ctx.fillStyle = '#1a1a1a';
      ctx.fill();
    }

    ctx.restore();
  },
};
