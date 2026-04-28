import { buildIdentity } from './identity';
import {
  buildPrimaryCanonicalKey,
  buildPrimaryDescription,
  buildPrimaryDescriptionRich,
  buildPrimaryName,
  buildPrimaryTextureKey,
  getPrimaryRawTypes,
  toSlug
} from './helpers';
import { mapItemTypes } from './types-map';
import { buildVariantGroup } from './variants';
import { buildLocationSourcesForCandidate } from '../location/sources';
import type { Item } from '@manosaba/types';
import type { GenerateItemsResult } from './types';
import type { SupplyLocationSnapshot } from '../location/types';
import type { LinkResult, LinkedItemCandidate } from '../linker/types';
import type { VariantAnalysisResult } from '../variants/types';

const getVariantAnalysisMap = (result: VariantAnalysisResult) => {
  return new Map(result.analyses.map(analysis => [analysis.sourceCandidateId, analysis]));
};

const buildItem = (
  candidate: LinkedItemCandidate,
  analysisMap: Map<string, VariantAnalysisResult['analyses'][number]>,
  supplyLocations: SupplyLocationSnapshot[],
): Item => {
  const name = buildPrimaryName(candidate);
  const canonicalKey = buildPrimaryCanonicalKey(candidate);
  const analysis = analysisMap.get(candidate.id);
  const rawTypes = getPrimaryRawTypes(candidate);
  const types = mapItemTypes(rawTypes);
  const description = buildPrimaryDescription(candidate);

  return {
    id: candidate.id,
    canonicalKey,
    sourceCandidateId: candidate.id,
    name,
    slug: toSlug(name),
    types: types.length > 0 ? types : undefined,
    rawTypes: rawTypes.length > 0 ? rawTypes : undefined,
    textureKey: buildPrimaryTextureKey(candidate),
    description,
    descriptionRich: buildPrimaryDescriptionRich(candidate),
    identity: buildIdentity(candidate),
    sources: buildLocationSourcesForCandidate(candidate, supplyLocations),
    variant: analysis ? buildVariantGroup(analysis, candidate) : undefined,
    warnings: candidate.warnings.length > 0 ? candidate.warnings : undefined,
  };
};

export const generateItems = (
  linkResult: LinkResult,
  variantResult: VariantAnalysisResult,
  supplyLocations: SupplyLocationSnapshot[] = [],
): GenerateItemsResult => {
  const analysisMap = getVariantAnalysisMap(variantResult);

  return {
    items: linkResult.linkedItems.map(candidate => buildItem(candidate, analysisMap, supplyLocations)),
    warnings: [],
  };
};
