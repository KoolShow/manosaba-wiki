import { buildVariantId, compact, getDefinitionName, pickBaseDefinitionIndexes, unique } from './helpers';
import type { VariantAnalysis, VariantContext, VariantDescriptor } from './types';

const groupDefinitionsByModel = (definitions: VariantContext['definitions']) => {
  const groups = new Map<string, number[]>();

  definitions.forEach((definition, index) => {
    if (!definition.itemModel) return;

    const current = groups.get(definition.itemModel) ?? [];
    current.push(index);
    groups.set(definition.itemModel, current);
  });

  return groups;
};

const groupTriggersByModel = (triggers: VariantContext['triggers']) => {
  const groups = new Map<string, number[]>();

  triggers.forEach((trigger, index) => {
    if (!trigger.matchedItemModel) return;

    const current = groups.get(trigger.matchedItemModel) ?? [];
    current.push(index);
    groups.set(trigger.matchedItemModel, current);
  });

  return groups;
};

const buildModelVariant = (
  candidateId: string,
  itemModel: string,
  definitionIndexes: number[],
  triggerIndexes: number[],
  context: VariantContext,
): VariantDescriptor => {
  const firstDefinition = definitionIndexes[0] !== undefined ? context.definitions[definitionIndexes[0]] : undefined;
  const modelSuffix = itemModel.includes(':') ? itemModel.split(':')[1] : itemModel;

  return {
    id: buildVariantId(candidateId, `model-${modelSuffix}`),
    label: modelSuffix,
    source: 'linked_definition',
    definitionIndexes,
    triggerIndexes,
    itemModel,
    customName: firstDefinition ? getDefinitionName(firstDefinition) : undefined,
    warnings: [],
  };
};

export const detectModelStateVariants = (context: VariantContext): VariantAnalysis | undefined => {
  const definitionNames = compact(context.definitions.map(getDefinitionName));
  const uniqueNames = unique(definitionNames);

  if (uniqueNames.length !== 1) {
    return undefined;
  }

  const definitionGroups = groupDefinitionsByModel(context.definitions);
  const triggerGroups = groupTriggersByModel(context.triggers);
  const itemModels = unique([
    ...definitionGroups.keys(),
    ...triggerGroups.keys(),
  ]);

  if (itemModels.length < 2) {
    return undefined;
  }

  if (triggerGroups.size === 0) {
    return undefined;
  }

  const variants = compact(itemModels.map((itemModel) => {
    return buildModelVariant(
      context.candidate.id,
      itemModel,
      definitionGroups.get(itemModel) ?? [],
      triggerGroups.get(itemModel) ?? [],
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
