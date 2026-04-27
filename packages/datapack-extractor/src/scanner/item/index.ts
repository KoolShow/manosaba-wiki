import { readFile } from 'node:fs/promises';
import { commandMatch } from './commands';
import { scanItemDefinitionFunctions } from './files';
import { parseItemExpression, parseTopLevelComponents } from './parser';
import { extractKnownFields } from './fields';
import { normalizer } from '../../utils/mcfunction';
import { inferNamespace, inferSourceStem, inferSourceDir } from '../../utils/fs';
import type { ItemDefinitionEvidence } from './types';

export const extractItemDefinitionsFromFile = async (
  filePath: string
): Promise<ItemDefinitionEvidence[]> => {
  const content = await readFile(filePath, { encoding: 'utf8' });
  const lines = normalizer(content);
  const evidences: ItemDefinitionEvidence[] = [];

  for (const line of lines) {
    const match = commandMatch(line);
    if (!match) continue;

    try {
      const parsedExpr = parseItemExpression(match.itemExpr);
      const rawComponents = (
        parsedExpr.componentsText ?
        parseTopLevelComponents(parsedExpr.componentsText) : {}
      );

      const known = extractKnownFields(rawComponents);

      evidences.push({
        kind: 'item_definition',
        definitionSourceType: 'mcfunction',

        sourcePath: filePath,
        sourceStem: inferSourceStem(filePath),
        sourceDir: inferSourceDir(filePath),
        namespace: inferNamespace(filePath),
        commandType: match.type,
        slot: match.slot,
        baseItemId: parsedExpr.baseItemId,
        count: parsedExpr.count,
        rawComponents,
        warnings: [],
        ...known,
      });
    } catch (error) {
      evidences.push({
        kind: 'item_definition',
        definitionSourceType: 'mcfunction',

        sourcePath: filePath,
        sourceStem: inferSourceStem(filePath),
        sourceDir: inferSourceDir(filePath),
        namespace: inferNamespace(filePath),
        commandType: match.type,
        slot: match.slot,
        warnings: [ error instanceof Error ? error.message : String(error) ],
      });
    }
  }

  return evidences;
};

export const scanItemDefinitions = async (): Promise<ItemDefinitionEvidence[]> => {
  const fileList = await scanItemDefinitionFunctions();
  const result: ItemDefinitionEvidence[] = [];

  for (const filePath of fileList) {
    result.push(...(await extractItemDefinitionsFromFile(filePath)));
  }

  return result;
};
