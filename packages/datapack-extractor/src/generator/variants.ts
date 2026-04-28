import { buildDefinitionDescription, buildDefinitionDescriptionRich, getVariantAxis, getVariantName, toSlug } from './helpers';
import type { ItemVariant, ItemVariantGroup } from '@manosaba/types';
import type { LinkedItemCandidate } from '../linker/types';
import type { VariantAnalysis, VariantDescriptor } from '../variants/types';

const getVariantDefinition = (
  descriptor: VariantDescriptor,
  candidate: LinkedItemCandidate,
) => {
  return descriptor.definitionIndexes[0] !== undefined
    ? candidate.definitions[descriptor.definitionIndexes[0]]
    : undefined;
};

const shouldKeepVariantDescriptions = (
  descriptors: VariantDescriptor[],
  candidate: LinkedItemCandidate,
): boolean => {
  const descriptions = descriptors
    .map(descriptor => buildDefinitionDescription(getVariantDefinition(descriptor, candidate)))
    .filter((value): value is string => Boolean(value));

  return new Set(descriptions).size > 1;
};

const buildVariantItem = (
  descriptor: VariantDescriptor,
  candidate: LinkedItemCandidate,
  keepDescription: boolean,
): ItemVariant => {
  const definition = getVariantDefinition(descriptor, candidate);
  const description = buildDefinitionDescription(definition);
  const descriptionRich = buildDefinitionDescriptionRich(definition);

  return {
    id: descriptor.id,
    name: getVariantName(descriptor),
    slug: toSlug(descriptor.label),
    textureKey: descriptor.itemModel,
    description: keepDescription ? description : undefined,
    descriptionRich: keepDescription ? descriptionRich : undefined,
    itemModel: descriptor.itemModel,
    customData: descriptor.customData,
    stateKey: descriptor.stateKey,
    stateValue: descriptor.stateValue,
  };
};

export const buildVariantGroup = (
  analysis: VariantAnalysis,
  candidate: LinkedItemCandidate,
): ItemVariantGroup | undefined => {
  if (analysis.kind === 'none' || analysis.variants.length === 0) {
    return undefined;
  }

  const { axisKey, axisLabel } = getVariantAxis(analysis);
  const keepDescription = shouldKeepVariantDescriptions(analysis.variants, candidate);

  return {
    type: analysis.kind === 'indexed' ? 'indexed' : analysis.kind === 'state' ? 'state' : 'unknown',
    axisKey,
    axisLabel,
    variants: analysis.variants.map(variant => buildVariantItem(variant, candidate, keepDescription)),
  };
};
