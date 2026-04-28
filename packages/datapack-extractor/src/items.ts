import { writeArtifacts } from './index';

writeArtifacts().then((result) => {
  console.log('Wrote items.json');
  console.log('Wrote recipes.json');
  console.log({
    definitionCount: result.definitions.length,
    triggerCount: result.triggers.length,
    recipeCount: result.recipes.length,
    supplyLocationCount: result.supplyLocations.length,
    linkedItemCount: result.linkResult.linkedItems.length,
    variantAnalysisCount: result.variantResult.analyses.length,
    itemCount: result.items.items.length,
  });
}).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
