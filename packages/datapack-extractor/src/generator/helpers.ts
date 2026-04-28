import { normalizeCustomData, normalizeCustomName } from '../linker/normalizer';
import type { LinkedItemCandidate } from '../linker/types';
import type { VariantAnalysis, VariantDescriptor } from '../variants/types';
import type { ItemDefinitionEvidence } from '../scanner/item/types';
import { getMinecraftLocalizedItemName } from './minecraft-name';
import { getLoreDescription, getLoreTypeCandidates, parseLoreLines } from './lore';
import { buildRichTextFromLore } from './rich-text';
import type { RichTextDocument } from '@manosaba/types';

export const compact = <T>(values: Array<T | undefined>): T[] => {
  return values.filter((value): value is T => value !== undefined);
};

export const unique = <T>(values: T[]): T[] => {
  return Array.from(new Set(values));
};

export const toSlug = (value?: string): string | undefined => {
  if (!value) return undefined;

  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || undefined;
};

export const getCandidateNames = (candidate: LinkedItemCandidate): string[] => {
  return compact(candidate.definitions.map(definition => normalizeCustomName(definition.customNameRaw)));
};

const getReadableIdFallback = (candidate: LinkedItemCandidate): string | undefined => {
  const itemModel = getPrimaryItemModel(candidate);
  if (itemModel) {
    return itemModel.includes(':') ? itemModel.split(':').at(-1) : itemModel;
  }

  const baseItemId = getPrimaryBaseItemId(candidate);
  if (baseItemId) {
    return baseItemId.includes(':') ? baseItemId.split(':').at(-1) : baseItemId;
  }

  return undefined;
};

export const buildPrimaryName = (candidate: LinkedItemCandidate): string => {
  const customName = getCandidateNames(candidate)[0];
  if (customName) {
    return customName;
  }

  const localizedName = getMinecraftLocalizedItemName(getPrimaryBaseItemId(candidate));
  if (localizedName) {
    return localizedName;
  }

  return getReadableIdFallback(candidate) ?? candidate.id;
};

export const getPrimaryItemModel = (candidate: LinkedItemCandidate): string | undefined => {
  return candidate.definitions.find(definition => definition.itemModel)?.itemModel;
};

export const getPrimaryBaseItemId = (candidate: LinkedItemCandidate): string | undefined => {
  return candidate.definitions.find(definition => definition.baseItemId)?.baseItemId;
};

export const getPrimaryCustomData = (candidate: LinkedItemCandidate): string | undefined => {
  return candidate.definitions.find(definition => definition.customDataRaw)?.customDataRaw;
};

export const getPrimaryLoreLines = (candidate: LinkedItemCandidate): string[] => {
  for (const definition of candidate.definitions) {
    const lines = parseLoreLines(definition.loreRaw);
    if (lines.length > 0) {
      return lines;
    }
  }

  return [];
};

export const buildPrimaryDescription = (candidate: LinkedItemCandidate): string | undefined => {
  return getLoreDescription(getPrimaryLoreLines(candidate));
};

export const buildPrimaryDescriptionRich = (candidate: LinkedItemCandidate): RichTextDocument | undefined => {
  for (const definition of candidate.definitions) {
    const rich = buildRichTextFromLore(definition.loreRaw);
    if (rich) {
      return rich;
    }
  }

  return undefined;
};

export const buildDefinitionDescription = (definition?: ItemDefinitionEvidence): string | undefined => {
  return definition ? getLoreDescription(parseLoreLines(definition.loreRaw)) : undefined;
};

export const buildDefinitionDescriptionRich = (definition?: ItemDefinitionEvidence): RichTextDocument | undefined => {
  return definition ? buildRichTextFromLore(definition.loreRaw) : undefined;
};

export const getPrimaryRawTypes = (candidate: LinkedItemCandidate): string[] => {
  return getLoreTypeCandidates(getPrimaryLoreLines(candidate));
};

export const buildPrimaryCanonicalKey = (candidate: LinkedItemCandidate): string => {
  const name = buildPrimaryName(candidate);
  const itemModel = getPrimaryItemModel(candidate);
  const baseItemId = getPrimaryBaseItemId(candidate);
  const customData = normalizeCustomData(getPrimaryCustomData(candidate));

  return compact([
    itemModel ? `itemModel=${itemModel}` : undefined,
    baseItemId ? `baseItemId=${baseItemId}` : undefined,
    customData ? `customData=${customData}` : undefined,
    name ? `name=${name}` : undefined,
  ]).join('|');
};

export const buildPrimaryTextureKey = (candidate: LinkedItemCandidate): string | undefined => {
  return getPrimaryItemModel(candidate) ?? getPrimaryBaseItemId(candidate);
};

export const getVariantAxis = (analysis: VariantAnalysis): { axisKey?: string; axisLabel?: string } => {
  const axisKey = analysis.variants.find(variant => variant.axisKey)?.axisKey
    ?? analysis.variants.find(variant => variant.stateKey)?.stateKey;

  const axisLabel = analysis.variants.find(variant => variant.axisLabel)?.axisLabel
    ?? axisKey;

  return { axisKey, axisLabel };
};

export const getVariantName = (descriptor: VariantDescriptor): string => {
  return descriptor.customName ?? descriptor.label;
};
