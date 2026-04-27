import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { scanAdvancements } from './files';
import { extractCriterionItemMatch } from './extractor';
import { inferNamespace, inferSourceStem, inferSourceDir } from '../../utils/fs';
import type { ItemTriggerEvidence } from './types';

const inferAdvancementId = (filePath: string) => {
  const normalizedPath = filePath.split(path.sep).join('/');
  const marker = '/data/';
  const dataIndex = normalizedPath.indexOf(marker);

  if (dataIndex === -1) return inferSourceStem(filePath);

  const rest = normalizedPath.slice(dataIndex + marker.length);
  const firstSlash = rest.indexOf('/');
  if (firstSlash === -1) return inferSourceStem(filePath);

  const namespace = rest.slice(0, firstSlash);
  const namespaceRest = rest.slice(firstSlash + 1);

  const advancementMarker = '/advancement/';
  const advancementIndex = namespaceRest.indexOf(advancementMarker);

  if (advancementIndex === -1) return `${namespace}:${inferSourceStem(filePath)}`;

  const localPath = namespaceRest
    .slice(advancementIndex + advancementMarker.length)
    .replace(/\.json$/, '');

  return `${namespace}:${localPath}`;
};

const extractRewardFunction = (parsed: unknown): string | undefined => {
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return undefined;

  const rewards = (parsed as Record<string, unknown>).rewards;
  if (!rewards || typeof rewards !== 'object' || Array.isArray(rewards)) return undefined;

  const fn = (rewards as Record<string, unknown>).function;
  return typeof fn === 'string' ? fn : undefined;
};

export const extractItemTriggerEvidenceFromFile = async (
  filePath: string
): Promise<ItemTriggerEvidence[]> => {
  const content = await readFile(filePath, { encoding: 'utf8' });
  const parsed = JSON.parse(content) as Record<string, unknown>;

  const criteria =
    parsed.criteria && typeof parsed.criteria === 'object' && !Array.isArray(parsed.criteria)
      ? parsed.criteria as Record<string, unknown>
      : undefined;

  const rewardFunction = extractRewardFunction(parsed);
  const evidences: ItemTriggerEvidence[] = [];

  if (!criteria) {
    return [{
      kind: 'item_trigger',
      sourcePath: filePath,
      sourceStem: inferSourceStem(filePath),
      sourceDir: inferSourceDir(filePath),
      namespace: inferNamespace(filePath),
      advancementId: inferAdvancementId(filePath),
      criterionName: 'unknown',
      triggerType: 'unknown',
      rewardFunction,
      warnings: [ 'Advancement has no criteria object' ],
    }];
  }

  for (const [ criterionName, criterion ] of Object.entries(criteria)) {
    const extracted = extractCriterionItemMatch(criterionName, criterion);
    const warnings = extracted.warnings;

    if (
      extracted.matchPath &&
      !extracted.matchedBaseItemId &&
      !extracted.matchedCustomDataRaw &&
      !extracted.matchedCustomNameRaw &&
      !extracted.matchedItemModel
    ) warnings.push('item condition matched, but no recognized identity field was extracted');

    evidences.push({
      kind: 'item_trigger',
      sourcePath: filePath,
      sourceStem: inferSourceStem(filePath),
      sourceDir: inferSourceDir(filePath),
      namespace: inferNamespace(filePath),
      advancementId: inferAdvancementId(filePath),
      criterionName,
      triggerType: extracted.triggerType,
      rawTrigger: extracted.rawTrigger,
      rewardFunction,
      matchedBaseItemId: extracted.matchedBaseItemId,
      matchedItemModel: extracted.matchedItemModel,
      matchedCustomDataRaw: extracted.matchedCustomDataRaw,
      matchedCustomNameRaw: extracted.matchedCustomNameRaw,
      matchPath: extracted.matchPath,
      slot: extracted.slot,
      warnings: warnings,
    });
  }

  return evidences;
};

export const scanItemTriggerEvidence = async (): Promise<ItemTriggerEvidence[]> => {
  const fileList = await scanAdvancements();
  const result: ItemTriggerEvidence[] = [];

  for (const filePath of fileList) {
    result.push(...(await extractItemTriggerEvidenceFromFile(filePath)));
  }

  return result;
};
