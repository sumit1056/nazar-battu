/**
 * Nazar Battu — Evil Eye Charm (Nazar Boncuğu)
 *
 * Traditional Turkish / Mediterranean blue glass talisman.
 * Handcrafted look with rich concentric circles:
 * Deep Cobalt Blue → White → Vibrant Cyan → Obsidian Pupil + Glass Specular Glints.
 * Top features a silver mounting ring and decorative blue bead.
 */

import type { CharmDefinition, CharmRenderContext } from './types';

export const evilEyeCharm: CharmDefinition = {
  id: 'evil-eye',
  name: 'Evil Eye (Nazar Boncuğu)',
  description: 'Ancient cobalt blue glass talisman with protective concentric rings',

  bodyShape: 'circle',
  bodyDimensions: { width: 64, height: 64 },
  mass: 6,
  ropeAttachOffset: { x: 0, y: -34 },

  hitAreaPadding: 16,

  render({ ctx, position, angle }: CharmRenderContext): void {
    ctx.save();
    ctx.translate(position.x, position.y);
    ctx.rotate(angle);

    const radius = 32;

    // --- Hanging Mount & Bead ---
    // Thread link
    ctx.beginPath();
    ctx.moveTo(0, -34);
    ctx.lineTo(0, -28);
    ctx.strokeStyle = '#78909c';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Small decorative bead above the talisman
    ctx.beginPath();
    ctx.arc(0, -30, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#0288d1';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Silver attachment loop
    ctx.beginPath();
    ctx.arc(0, -26, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(207, 216, 220, 0.9)';
    ctx.fill();
    ctx.strokeStyle = '#455a64';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // --- Outer Cobalt Blue Glass Ring ---
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    const outerGrad = ctx.createRadialGradient(-6, -8, 4, 0, 0, radius);
    outerGrad.addColorStop(0, '#1976d2');
    outerGrad.addColorStop(0.5, '#0d47a1');
    outerGrad.addColorStop(0.85, '#0a2e6f');
    outerGrad.addColorStop(1, '#051b44');
    ctx.fillStyle = outerGrad;
    ctx.fill();

    // Glass rim glow
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // --- White Middle Ring ---
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.68, 0, Math.PI * 2);
    const whiteGrad = ctx.createRadialGradient(-4, -4, 2, 0, 0, radius * 0.68);
    whiteGrad.addColorStop(0, '#ffffff');
    whiteGrad.addColorStop(0.8, '#f1f5f9');
    whiteGrad.addColorStop(1, '#cbd5e1');
    ctx.fillStyle = whiteGrad;
    ctx.fill();

    // --- Cyan / Sky Blue Ring ---
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.46, 0, Math.PI * 2);
    const cyanGrad = ctx.createRadialGradient(-3, -3, 2, 0, 0, radius * 0.46);
    cyanGrad.addColorStop(0, '#38bdf8');
    cyanGrad.addColorStop(0.6, '#0284c7');
    cyanGrad.addColorStop(1, '#0369a1');
    ctx.fillStyle = cyanGrad;
    ctx.fill();

    // --- Obsidian Black Center Pupil ---
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.24, 0, Math.PI * 2);
    ctx.fillStyle = '#020617';
    ctx.fill();

    // --- Glass Specular Highlights (Authentic Hand-blown 3D effect) ---
    // Primary glint (curved arc highlight top-left)
    ctx.beginPath();
    ctx.ellipse(-10, -12, 10, 5, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.fill();

    // Secondary sharp white dot (pupil reflection)
    ctx.beginPath();
    ctx.arc(-2.5, -2.5, 2.2, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Tiny secondary bounce reflection bottom-right
    ctx.beginPath();
    ctx.arc(12, 12, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.fill();

    ctx.restore();
  },
};
