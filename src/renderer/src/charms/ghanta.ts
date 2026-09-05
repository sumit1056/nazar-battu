/**
 * Nazar Battu — Authentic Indian Temple Bell Charm (Ghanta)
 *
 * Sacred brass temple bell rung to clear the air, mark a auspicious beginning,
 * and dispel negative energies:
 * - Upper cord adorned with 24k gold beads and a radiant ruby lacquer glass bead.
 * - High-resolution handcrafted brass bell with intricate relief carvings.
 * - Triggers the authentic resonant bronze temple bell chime (ghanta-ring.wav).
 */

import type { CharmDefinition, CharmRenderContext } from './types';
import { getRopeInterpolation } from '../physics/rope';
import { drawGoldBead, drawRedLacquerBead } from './beads';
import ghantaImgUrl from '../assets/charms/ghanta.png';

const ghantaImg = typeof Image !== 'undefined' ? new Image() : null;
if (ghantaImg) {
  ghantaImg.src = ghantaImgUrl;
}

export const ghantaCharm: CharmDefinition = {
  id: 'ghanta',
  name: 'Ghanta (Temple Bell)',
  description: 'Sacred brass temple bell to clear negative energy and mark auspicious beginnings',

  bodyShape: 'rectangle',
  bodyDimensions: { width: 64, height: 84 },
  mass: 6.5,
  ropeAttachOffset: { x: 0, y: -34 },

  hitAreaPadding: 20,

  render({ ctx, position, angle, ropePoints }: CharmRenderContext): void {
    const hasRope = Boolean(ropePoints && ropePoints.length >= 2);

    // 1. Sacred gold and ruby beads along the cord
    if (hasRope && ropePoints) {
      const b1 = getRopeInterpolation(ropePoints, 0.38);
      const b2 = getRopeInterpolation(ropePoints, 0.58);
      const b3 = getRopeInterpolation(ropePoints, 0.78);

      drawGoldBead(ctx, b1.x, b1.y, 4.5);
      drawRedLacquerBead(ctx, b2.x, b2.y, 7.5);
      drawGoldBead(ctx, b3.x, b3.y, 4.5);
    }

    // 2. High-resolution brass Ghanta artwork
    ctx.save();
    ctx.translate(position.x, position.y);
    ctx.rotate(angle);

    ctx.shadowColor = 'rgba(20, 15, 5, 0.3)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 4;

    const w = 64;
    const h = 84;
    if (ghantaImg && ghantaImg.naturalWidth > 0) {
      ctx.drawImage(ghantaImg, -w / 2, -h / 2, w, h);
    } else {
      // Fallback
      ctx.beginPath();
      ctx.arc(0, 0, 26, 0, Math.PI * 2);
      ctx.fillStyle = '#fbc02d';
      ctx.fill();
    }

    ctx.restore();
  },
};
