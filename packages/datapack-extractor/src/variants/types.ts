import type { ItemDefinitionEvidence } from '../scanner/item/types';
import type { ItemTriggerEvidence } from '../scanner/advancement/types';
import type { LinkedItemCandidate } from '../linker/types';

export type VariantKind = 'none' | 'state' | 'indexed' | 'unknown';
export type VariantSource = 'linked_definition' | 'parametric_definition';
export type ParametricSource = 'item_model' | 'custom_data';

export interface VariantDescriptor {
  id?: string,
  label: string,
  source: VariantSource,
  definitionIndexes: number[],
  triggerIndexes: number[],
  itemModel?: string,
  customName?: string,
  customData?: string,
  stateKey?: string,
  stateValue?: string | number | boolean,
  axisKey?: string,
  axisLabel?: string,
  parametricKey?: string,
  parametricPattern?: string,
  parametricSource?: ParametricSource,
  warnings: string[],
}

export interface VariantAnalysis {
  itemId: string,
  sourceCandidateId: string,
  kind: VariantKind,
  baseDefinitionIndexes: number[],
  variants: VariantDescriptor[],
  warnings: string[],
}

export interface VariantAnalysisResult {
  analyses: VariantAnalysis[],
  unclassifiedCandidates: string[],
  warnings: string[],
}

export interface VariantContext {
  candidate: LinkedItemCandidate,
  definitions: ItemDefinitionEvidence[],
  triggers: ItemTriggerEvidence[],
  parametricDefinitions: ItemDefinitionEvidence[],
}
