import { readFile } from 'node:fs/promises';
import { scanSupplyDefinitionFiles } from './files';
import { getSupplyPosZ, getSupplyRanges } from './parse';
import { extractKnownFields } from './fields';
import { containerFilter, inferLocationName } from './utils';
import { readContainerAt } from '../../utils/region';
import { inferSourceStem, inferSourceDir } from '../../utils/fs';
import type { ItemDefinitionEvidence } from './types';

const SupplyPosX = 1029;
const SupplyStoragePosY = 45;
const SupplyReplacePosY = 44;

const componentParser = (component?: Record<string, unknown>) => {
  const result: Record<string, string> = {};
  if (!component) return (void 0);

  for (const key of Object.keys(component)) {
    const value = component[key];

    if (typeof value !== 'string') result[key] = JSON.stringify(value);
    else result[key] = value;
  }

  return result;
}

export const extractItemDefinitionsFromSupply = async (
  filePath: string
): Promise<ItemDefinitionEvidence[]> => {
  const content = await readFile(filePath, { encoding: 'utf8' });

  const supplyRanges = getSupplyRanges(content);
  const supplyPosZ = getSupplyPosZ(content) ?? NaN;

  if (isNaN(supplyPosZ))
    throw new Error(`Cannot parse supply container Z coords in definition: ${filePath}`);

  const allItems = [
    ...containerFilter(await readContainerAt(WORLD_ROOT, { x: SupplyPosX, y: SupplyStoragePosY, z: supplyPosZ })), // Storage
    ...containerFilter(await readContainerAt(WORLD_ROOT, { x: SupplyPosX, y: SupplyReplacePosY, z: supplyPosZ })) // Replacements
  ];

  const evidences: ItemDefinitionEvidence[] = [];

  for (const item of allItems) {
    const rangeIndex = supplyRanges.findIndex(e => item.slot >= e.slotStart && item.slot <= e.slotEnd);
    const range = rangeIndex !== -1 ? supplyRanges[rangeIndex] : null;

    evidences.push({
      kind: 'item_definition',

      sourcePath: filePath,
      sourceStem: inferSourceStem(filePath),
      sourceDir: inferSourceDir(filePath),
      namespace: inferLocationName(filePath),

      definitionSourceType: 'supply',
      slotRange: range ?? (void 0),

      baseItemId: item.id,
      count: item.count,
      rawComponents: componentParser(item.components),
      ...extractKnownFields(item.components ?? {}),

      warnings: [],
    });
  }

  return evidences;
};

export const scanItemDefinitions = async (): Promise<ItemDefinitionEvidence[]> => {
  const fileList = await scanSupplyDefinitionFiles();
  const result: ItemDefinitionEvidence[] = [];

  for (const filePath of fileList)
    result.push(...(await extractItemDefinitionsFromSupply(filePath)));

  return result;
};
