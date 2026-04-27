import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { generateItems } from './generator/index';
import { linkItemEvidence } from './linker/index';
import { scanItemDefinitions } from './scanner/item';
import { scanItemTriggerEvidence } from './scanner/advancement';
import { analyzeVariants } from './variants/index';

const OUTPUT_PATH = path.resolve(process.cwd(), 'dist/items.json');

const buildItems = async () => {
  const definitions = await scanItemDefinitions();
  const triggers = await scanItemTriggerEvidence();

  const linkResult = linkItemEvidence(definitions, triggers);
  const variantResult = analyzeVariants(linkResult);
  const generated = generateItems(linkResult, variantResult);

  return {
    definitions,
    triggers,
    linkResult,
    variantResult,
    generated,
  };
};

const main = async () => {
  const result = await buildItems();

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, JSON.stringify(result.generated.items, null, 2), 'utf8');

  console.log('Wrote items.json');
  console.log({
    outputPath: OUTPUT_PATH,
    definitionCount: result.definitions.length,
    triggerCount: result.triggers.length,
    linkedItemCount: result.linkResult.linkedItems.length,
    variantAnalysisCount: result.variantResult.analyses.length,
    itemCount: result.generated.items.length,
  });
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
