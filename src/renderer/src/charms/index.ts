/**
 * Nazar Battu — Charm Registry
 *
 * Central registry for all available charms. New charms are added here
 * and automatically appear in the tray menu and selection UI.
 */

import type { CharmDefinition } from './types';
import { nimbuMirchiCharm } from './nimbu-mirchi';
import { evilEyeCharm } from './evil-eye';
import { mahakalMaskCharm } from './mahakal-mask';

/** All registered charms, keyed by ID */
const charmRegistry = new Map<string, CharmDefinition>();

// Register built-in charms
charmRegistry.set(nimbuMirchiCharm.id, nimbuMirchiCharm);
charmRegistry.set(evilEyeCharm.id, evilEyeCharm);
charmRegistry.set(mahakalMaskCharm.id, mahakalMaskCharm);

/** Get a charm definition by ID */
export function getCharm(id: string): CharmDefinition | undefined {
  return charmRegistry.get(id);
}

/** List all available charms */
export function listCharms(): CharmDefinition[] {
  return Array.from(charmRegistry.values());
}

/** Get the default charm ID */
export function getDefaultCharmId(): string {
  return nimbuMirchiCharm.id;
}

export { type CharmDefinition } from './types';
