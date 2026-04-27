import type { ItemTriggerEvidence } from '../scanner/advancement/types';
import type { ItemDefinitionEvidence } from '../scanner/item/types';

export interface ItemFingerprint {
  baseItemId?: string,
  itemModel?: string,
  customDataNormalized?: string,
  customNameNormalized?: string,
  sourceStem?: string,
  namespace?: string,
}

export interface LinkedItemCandidate {
  id: string,
  definitions: ItemDefinitionEvidence[],
  triggers: ItemTriggerEvidence[],
  fingerprints: ItemFingerprint[],
  warnings: string[],
}

export interface LinkResult {
  linkedItems: LinkedItemCandidate[],
  unlinkedDefinitions: ItemDefinitionEvidence[],
  templateDefinitions: ItemDefinitionEvidence[],
  parametricDefinitions: ItemDefinitionEvidence[],
  unlinkedTriggers: ItemTriggerEvidence[],
  nonItemTriggers: ItemTriggerEvidence[],
  warnings: string[],
}

export type LinkStrength = 'strong' | 'medium' | 'weak';

export interface LinkMatch {
  matched: boolean,
  strength?: LinkStrength,
  ruleName?: string,
  reason?: string,
}

export interface LinkRuleInput {
  definition: ItemFingerprint,
  trigger: ItemFingerprint,
}

export type LinkRule = (input: LinkRuleInput) => LinkMatch;
