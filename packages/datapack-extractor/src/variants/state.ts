import { buildVariantId, compact, getDefinitionData, getDefinitionName, getTriggerData, pickBaseDefinitionIndexes, unique } from './helpers';
import type { VariantAnalysis, VariantContext, VariantDescriptor } from './types';

const extractSimpleState = (customData?: string): { key: string; value: string } | undefined => {
  if (!customData) return undefined;

  try {
    const parsed = JSON.parse(customData) as Record<string, unknown>;
    const entries = Object.entries(parsed);
    if (entries.length !== 1) return undefined;

    const [key, value] = entries[0];
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return { key, value: String(value) };
    }
  } catch {
    return undefined;
  }

  return undefined;
};

const groupDefinitionsByState = (definitions: VariantContext['definitions']) => {
  const groups = new Map<string, number[]>();

  definitions.forEach((definition, index) => {
    const state = extractSimpleState(getDefinitionData(definition));
    if (!state) return;

    const key = `${state.key}:${state.value}`;
    const current = groups.get(key) ?? [];
    current.push(index);
    groups.set(key, current);
  });

  return groups;
};

const groupTriggersByState = (triggers: VariantContext['triggers']) => {
  const groups = new Map<string, number[]>();

  triggers.forEach((trigger, index) => {
    const state = extractSimpleState(getTriggerData(trigger));
    if (!state) return;

    const key = `${state.key}:${state.value}`;
    const current = groups.get(key) ?? [];
    current.push(index);
    groups.set(key, current);
  });

  return groups;
};

const buildStateDescriptor = (
  candidateId: string,
  stateKey: string,
  stateValue: string,
  definitionIndexes: number[],
  triggerIndexes: number[],
  context: VariantContext,
): VariantDescriptor => {
  const firstDefinition = definitionIndexes[0] !== undefined ? context.definitions[definitionIndexes[0]] : undefined;

  return {
    id: buildVariantId(candidateId, `${stateKey}-${stateValue}`),
    label: `${stateKey}-${stateValue}`,
    source: 'linked_definition',
    definitionIndexes,
    triggerIndexes,
    itemModel: firstDefinition?.itemModel,
    customName: firstDefinition ? getDefinitionName(firstDefinition) : undefined,
    customData: firstDefinition ? getDefinitionData(firstDefinition) : undefined,
    stateKey,
    stateValue,
    warnings: [],
  };
};

export const detectStateVariants = (context: VariantContext): VariantAnalysis | undefined => {
  const definitionGroups = groupDefinitionsByState(context.definitions);
  const triggerGroups = groupTriggersByState(context.triggers);
  const stateKeys = unique([
    ...definitionGroups.keys(),
    ...triggerGroups.keys(),
  ]);

  if (stateKeys.length < 2) {
    return undefined;
  }

  const variants = compact(stateKeys.map((stateKey) => {
    const [key, value] = stateKey.split(':');
    if (!key || value === undefined) return undefined;

    return buildStateDescriptor(
      context.candidate.id,
      key,
      value,
      definitionGroups.get(stateKey) ?? [],
      triggerGroups.get(stateKey) ?? [],
      context,
    );
  }));

  if (variants.length < 2) {
    return undefined;
  }

  const usedDefinitionIndexes = variants.flatMap(variant => variant.definitionIndexes);

  return {
    itemId: context.candidate.id,
    sourceCandidateId: context.candidate.id,
    kind: 'state',
    baseDefinitionIndexes: pickBaseDefinitionIndexes(context.definitions.length, usedDefinitionIndexes),
    variants,
    warnings: [],
  };
};
