import type { Gate3D } from '../state';
import { ascentRig } from './ascent';
import { type RigFactory } from './core';
import { monogramRig } from './monogram';
import { postalRig } from './postal';
import { stackRig } from './stack';

export { createStage, type Stage } from './core';
/** One rig per version of the gate: this module (and three.js) is a chunk of its own, loaded by the gate. */
export const RIGS: Record<Gate3D, RigFactory> = { monograma: monogramRig, codigo: stackRig, ascenso: ascentRig, postal: postalRig };
