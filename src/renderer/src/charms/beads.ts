/**
 * Nazar Battu — 3D Procedural Bead Renderer
 *
 * Renders handcrafted protective beads along the talisman cord:
 * - 24k Gold Beads (radial metallic gradient + specular glint)
 * - Pearl White Glass Beads
 * - Cobalt Evil Eye Beads (concentric rings + glass shine)
 * - Striped Sacred Talisman Beads
 * - Ruby Lacquer Glass Beads
 */

/** Draw a 3D metallic gold bead with specular shine */
export function drawGoldBead(ctx: CanvasRenderingContext2D, x: number, y: number, radius = 4.5): void {
  ctx.save();
  ctx.translate(x, y);

  const grad = ctx.createRadialGradient(-radius * 0.3, -radius * 0.3, radius * 0.1, 0, 0, radius);
  grad.addColorStop(0, '#ffe685');
  grad.addColorStop(0.4, '#edb52e');
  grad.addColorStop(0.85, '#b8860b');
  grad.addColorStop(1, '#6b4505');

  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  // Specular shine
  ctx.beginPath();
  ctx.ellipse(-radius * 0.35, -radius * 0.35, radius * 0.35, radius * 0.2, -Math.PI / 4, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.fill();

  ctx.restore();
}

/** Draw a 3D pearl white glass bead */
export function drawWhiteBead(ctx: CanvasRenderingContext2D, x: number, y: number, radius = 4.5): void {
  ctx.save();
  ctx.translate(x, y);

  const grad = ctx.createRadialGradient(-radius * 0.3, -radius * 0.3, radius * 0.1, 0, 0, radius);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.5, '#ebebf0');
  grad.addColorStop(0.85, '#cfd2dc');
  grad.addColorStop(1, '#9ea1ad');

  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(-radius * 0.35, -radius * 0.35, radius * 0.35, radius * 0.2, -Math.PI / 4, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.fill();

  ctx.restore();
}

/** Draw an evil eye glass bead */
export function drawEyeBead(ctx: CanvasRenderingContext2D, x: number, y: number, radius = 7.5): void {
  ctx.save();
  ctx.translate(x, y);

  const grad = ctx.createRadialGradient(-radius * 0.25, -radius * 0.25, radius * 0.1, 0, 0, radius);
  grad.addColorStop(0, '#3f51b5');
  grad.addColorStop(0.7, '#1a237e');
  grad.addColorStop(1, '#0d1642');

  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.58, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.38, 0, Math.PI * 2);
  ctx.fillStyle = '#29b6f6';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.18, 0, Math.PI * 2);
  ctx.fillStyle = '#0a0a14';
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(-radius * 0.4, -radius * 0.4, radius * 0.3, radius * 0.18, -Math.PI / 4, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.fill();

  ctx.restore();
}

/** Draw a striped sacred protector bead */
export function drawStripedBead(ctx: CanvasRenderingContext2D, x: number, y: number, radius = 7.5): void {
  ctx.save();
  ctx.translate(x, y);

  const grad = ctx.createRadialGradient(-radius * 0.25, -radius * 0.25, radius * 0.1, 0, 0, radius);
  grad.addColorStop(0, '#fa7354');
  grad.addColorStop(0.7, '#cc2417');
  grad.addColorStop(1, '#700808');

  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  // Striped accents
  ctx.strokeStyle = '#ffe082';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.8, -Math.PI / 3, Math.PI / 3);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.8, (2 * Math.PI) / 3, (4 * Math.PI) / 3);
  ctx.stroke();

  // Highlight
  ctx.beginPath();
  ctx.ellipse(-radius * 0.35, -radius * 0.35, radius * 0.3, radius * 0.18, -Math.PI / 4, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.fill();

  ctx.restore();
}

/** Draw a red lacquer glass bead */
export function drawRedLacquerBead(ctx: CanvasRenderingContext2D, x: number, y: number, radius = 7.5): void {
  ctx.save();
  ctx.translate(x, y);

  const grad = ctx.createRadialGradient(-radius * 0.25, -radius * 0.25, radius * 0.1, 0, 0, radius);
  grad.addColorStop(0, '#e53935');
  grad.addColorStop(0.65, '#b71c1c');
  grad.addColorStop(1, '#5f0909');

  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(-radius * 0.35, -radius * 0.35, radius * 0.3, radius * 0.18, -Math.PI / 4, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.fill();

  ctx.restore();
}
