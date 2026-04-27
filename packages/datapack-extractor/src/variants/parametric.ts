import { buildVariantId, getDefinitionName, pickBaseDefinitionIndexes } from './helpers';
import type { ParametricSource, VariantAnalysis, VariantContext, VariantDescriptor } from './types';

const extractParametricInfo = (value?: string): { key?: string; pattern?: string } => {
  if (!value) return {};

  const modelMatch = value.match(/\$\(([^)]+)\)/);
  if (!modelMatch) return {};

  return {
    key: modelMatch[1],
    pattern: modelMatch[0],
  };
};

const getParametricSource = (
  itemModel?: string,
  customData?: string,
): ParametricSource | undefined => {
  if (itemModel?.includes('$(')) {
    return 'item_model';
  }

  if (customData?.includes('$(')) {
    return 'custom_data';
  }

  return undefined;
};

const getAxisKey = (
  parametricKey?: string,
): string | undefined => {
  return parametricKey;
};

const getAxisLabel = (
  axisKey?: string,
): string | undefined => {
  return axisKey;
};

const buildParametricDescriptor = (
  candidateId: string,
  definitionIndex: number,
  itemModel: string | undefined,
  customName: string | undefined,
  customData: string | undefined,
  parametricKey?: string,
  parametricPattern?: string,
  parametricSource?: ParametricSource,
): VariantDescriptor => {
  const axisKey = getAxisKey(parametricKey);

  return {
    id: buildVariantId(candidateId, `parametric-${definitionIndex}`),
    label: axisKey ? `${axisKey}-*` : 'parametric',
    source: 'parametric_definition',
    definitionIndexes: [definitionIndex],
    triggerIndexes: [],
    itemModel,
    customName,
    customData,
    axisKey,
    axisLabel: getAxisLabel(axisKey),
    parametricKey,
    parametricPattern,
    parametricSource,
    warnings: [],
  };
};

export const detectParametricVariants = (context: VariantContext): VariantAnalysis | undefined => {
  if (context.parametricDefinitions.length === 0) {
    return undefined;
  }

  const variants = context.parametricDefinitions.map((definition, index) => {
    const modelInfo = extractParametricInfo(definition.itemModel);
    const dataInfo = extractParametricInfo(definition.customDataRaw);
    const parametricKey = modelInfo.key ?? dataInfo.key;
    const parametricPattern = modelInfo.pattern ?? dataInfo.pattern;

    return buildParametricDescriptor(
      context.candidate.id,
      index,
      definition.itemModel,
      getDefinitionName(definition),
      definition.customDataRaw,
      parametricKey,
      parametricPattern,
      getParametricSource(definition.itemModel, definition.customDataRaw),
    );
  });

  const baseDefinitionIndexes = context.definitions.length > 0
    ? pickBaseDefinitionIndexes(context.definitions.length, [])
    : [];

  return {
    itemId: context.candidate.id,
    sourceCandidateId: context.candidate.id,
    kind: 'indexed',
    baseDefinitionIndexes,
    variants,
    warnings: [],
  };
};
