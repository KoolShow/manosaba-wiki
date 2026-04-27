import type { LinkResult } from '../linker/types';
import { normalizeCustomName } from '../linker/normalizer';
import { detectModelStateVariants } from './modelState';
import { detectParametricVariants } from './parametric';
import { detectStateVariants } from './state';
import type { VariantAnalysis, VariantAnalysisResult, VariantContext } from './types';

const buildContext = (result: LinkResult, index: number): VariantContext => {
  const candidate = result.linkedItems[index];
  const candidateNames = new Set(
    candidate.definitions
      .map(definition => normalizeCustomName(definition.customNameRaw))
      .filter((value): value is string => Boolean(value))
  );

  return {
    candidate,
    definitions: candidate.definitions,
    triggers: candidate.triggers,
    parametricDefinitions: result.parametricDefinitions.filter((definition) => {
      const definitionName = normalizeCustomName(definition.customNameRaw);
      return Boolean(definitionName && candidateNames.has(definitionName));
    }),
  };
};

const buildNoneAnalysis = (context: VariantContext): VariantAnalysis => {
  return {
    itemId: context.candidate.id,
    sourceCandidateId: context.candidate.id,
    kind: 'none',
    baseDefinitionIndexes: context.definitions.map((_, index) => index),
    variants: [],
    warnings: [],
  };
};

export const analyzeVariants = (result: LinkResult): VariantAnalysisResult => {
  const analyses = result.linkedItems.map((_, index) => {
    const context = buildContext(result, index);

    return detectStateVariants(context)
      ?? detectModelStateVariants(context)
      ?? detectParametricVariants(context)
      ?? buildNoneAnalysis(context);
  });

  return {
    analyses,
    unclassifiedCandidates: analyses
      .filter(analysis => analysis.kind === 'unknown')
      .map(analysis => analysis.sourceCandidateId),
    warnings: [],
  };
};
