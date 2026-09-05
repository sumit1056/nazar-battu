/**
 * Nazar Battu — Mahakal Demon Mask Charm
 *
 * The classic ferocious guardian mask widely mounted on Indian homes and trucks
 * to absorb and deflect malicious gazes (buri nazar).
 * Features:
 *   - Jet-black ceramic face contour
 *   - Twin golden curved horns
 *   - Fiery demon eyes with red pupils
 *   - Exposed white fangs
 *   - Protruding red tongue
 *   - Red vermilion sacred tilak on forehead
 */

import type { CharmDefinition, CharmRenderContext } from './types';

export const mahakalMaskCharm: CharmDefinition = {
  id: 'mahakal-mask',
  name: 'Mahakal Demon Mask',
  description: 'Fierce guardian face with horns, fangs, and tongue to ward off buri nazar',

  bodyShape: 'rectangle',
  bodyDimensions: { width: 64, height: 76 },
  mass: 7,
  ropeAttachOffset: { x: 0, y: -38 },

  hitAreaPadding: 16,

  render({ ctx, position, angle }: CharmRenderContext): void {
    ctx.save();
    ctx.translate(position.x, position.y);
    ctx.rotate(angle);

    // --- Hanging Thread & Metal Ring ---
    ctx.beginPath();
    ctx.moveTo(0, -38);
    ctx.lineTo(0, -28);
    ctx.strokeStyle = '#b71c1c'; // Red sacred thread
    ctx.lineWidth = 1.8;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, -28, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffd700'; // Brass ring
    ctx.fill();

    // --- Twin Golden Horns ---
    // Left Horn
    ctx.beginPath();
    ctx.moveTo(-18, -20);
    ctx.bezierCurveTo(-26, -34, -30, -38, -22, -40);
    ctx.bezierCurveTo(-18, -32, -14, -26, -10, -22);
    ctx.closePath();
    const leftHornGrad = ctx.createLinearGradient(-30, -40, -10, -20);
    leftHornGrad.addColorStop(0, '#ffd700');
    leftHornGrad.addColorStop(0.5, '#ffa000');
    leftHornGrad.addColorStop(1, '#ff6f00');
    ctx.fillStyle = leftHornGrad;
    ctx.fill();
    ctx.strokeStyle = '#b26a00';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Right Horn
    ctx.beginPath();
    ctx.moveTo(18, -20);
    ctx.bezierCurveTo(26, -34, 30, -38, 22, -40);
    ctx.bezierCurveTo(18, -32, 14, -26, 10, -22);
    ctx.closePath();
    const rightHornGrad = ctx.createLinearGradient(30, -40, 10, -20);
    rightHornGrad.addColorStop(0, '#ffd700');
    rightHornGrad.addColorStop(0.5, '#ffa000');
    rightHornGrad.addColorStop(1, '#ff6f00');
    ctx.fillStyle = rightHornGrad;
    ctx.fill();
    ctx.strokeStyle = '#b26a00';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // --- Face Base (Jet Black Ceramic Shield) ---
    ctx.beginPath();
    ctx.moveTo(0, -26); // Forehead center
    ctx.bezierCurveTo(22, -26, 28, -12, 28, 4); // Right cheek
    ctx.bezierCurveTo(28, 22, 16, 32, 0, 34);   // Chin
    ctx.bezierCurveTo(-16, 32, -28, 22, -28, 4); // Left cheek
    ctx.bezierCurveTo(-28, -12, -22, -26, 0, -26); // Left forehead
    ctx.closePath();

    const faceGrad = ctx.createRadialGradient(-4, -6, 5, 0, 4, 32);
    faceGrad.addColorStop(0, '#2d3748');
    faceGrad.addColorStop(0.4, '#1a202c');
    faceGrad.addColorStop(1, '#0b0f19');
    ctx.fillStyle = faceGrad;
    ctx.fill();

    ctx.strokeStyle = '#4a5568';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // --- Sacred Red Tilak & Crescent (Forehead) ---
    ctx.beginPath();
    ctx.ellipse(0, -18, 3, 6, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#dc2626'; // Vermilion red
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, -12, 4, 0.1 * Math.PI, 0.9 * Math.PI, false);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // --- Fierce Demon Eyes ---
    [-13, 13].forEach((eyeX, idx) => {
      // White/yellow eye background
      ctx.beginPath();
      ctx.arc(eyeX, -4, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#fef08a';
      ctx.fill();
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Red fiery iris
      ctx.beginPath();
      ctx.arc(eyeX, -4, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ef4444';
      ctx.fill();

      // Black pupil
      ctx.beginPath();
      ctx.arc(eyeX, -4, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#000000';
      ctx.fill();

      // Catchlight
      ctx.beginPath();
      ctx.arc(eyeX - 1.2, -5.2, 1, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // Angry brow arch
      ctx.beginPath();
      ctx.moveTo(eyeX - 8, -12);
      ctx.lineTo(eyeX + (idx === 0 ? 8 : -8), -9);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.stroke();
    });

    // --- Nose ---
    ctx.beginPath();
    ctx.moveTo(0, -4);
    ctx.lineTo(-4, 6);
    ctx.lineTo(4, 6);
    ctx.closePath();
    ctx.fillStyle = '#1e293b';
    ctx.fill();

    // --- Mustache & Wide Open Mouth ---
    // Curved black mustache
    ctx.beginPath();
    ctx.moveTo(-18, 8);
    ctx.bezierCurveTo(-8, 6, -2, 12, 0, 10);
    ctx.bezierCurveTo(2, 12, 8, 6, 18, 8);
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Mouth cavity
    ctx.beginPath();
    ctx.arc(0, 14, 11, 0, Math.PI, false);
    ctx.fillStyle = '#450a0a'; // Dark maroon inner mouth
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // --- Protruding Red Tongue ---
    ctx.beginPath();
    ctx.moveTo(-5, 14);
    ctx.bezierCurveTo(-6, 26, -5, 30, 0, 31);
    ctx.bezierCurveTo(5, 30, 6, 26, 5, 14);
    ctx.closePath();
    const tongueGrad = ctx.createLinearGradient(0, 14, 0, 31);
    tongueGrad.addColorStop(0, '#f87171');
    tongueGrad.addColorStop(0.6, '#dc2626');
    tongueGrad.addColorStop(1, '#991b1b');
    ctx.fillStyle = tongueGrad;
    ctx.fill();

    // Tongue center indentation line
    ctx.beginPath();
    ctx.moveTo(0, 16);
    ctx.lineTo(0, 27);
    ctx.strokeStyle = 'rgba(153, 27, 27, 0.7)';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // --- White Exposed Fangs ---
    // Left Fang
    ctx.beginPath();
    ctx.moveTo(-9, 13);
    ctx.lineTo(-7, 20);
    ctx.lineTo(-5, 13);
    ctx.closePath();
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Right Fang
    ctx.beginPath();
    ctx.moveTo(5, 13);
    ctx.lineTo(7, 20);
    ctx.lineTo(9, 13);
    ctx.closePath();
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.restore();
  },
};
