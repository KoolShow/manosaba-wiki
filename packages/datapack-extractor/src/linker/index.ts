import { buildDefinitionFingerprint, buildTriggerFingerprint } from './fingerprint';
import { matchFingerprints } from './rules';
import type {
  ItemFingerprint,
  LinkedItemCandidate,
  LinkMatch,
  LinkResult,
} from './types';
import type { ItemDefinitionEvidence } from '../scanner/item/types';
import type { ItemTriggerEvidence } from '../scanner/advancement/types';

interface CandidateState {
  candidate: LinkedItemCandidate;
  definitionFingerprints: ItemFingerprint[];
}

interface TriggerMatchCandidate {
  candidateIndex: number;
  match: LinkMatch;
}

interface DefinitionMatchCandidate {
  candidateIndex: number;
  match: LinkMatch;
}

const hasAnyIdentity = (fingerprint: ItemFingerprint): boolean => {
  return Boolean(
    fingerprint.itemModel ||
    fingerprint.baseItemId ||
    fingerprint.customDataNormalized ||
    fingerprint.customNameNormalized
  );
};

const hasTemplateMarker = (value?: string): boolean => {
  return typeof value === 'string' && value.includes('$(');
};

const hasStableIdentityPrefix = (value?: string): boolean => {
  return typeof value === 'string' && /[A-Za-z0-9_:-]\$\(/.test(value);
};

const hasStableCustomDataKey = (value?: string): boolean => {
  return typeof value === 'string' && /\{\s*[A-Za-z0-9_:-]+\s*:\s*\$\(/.test(value);
};

const isParametricDefinition = (definition: ItemDefinitionEvidence): boolean => {
  if (!isTemplateDefinition(definition)) {
    return false;
  }

  return Boolean(
    hasStableIdentityPrefix(definition.itemModel) ||
    hasStableCustomDataKey(definition.customDataRaw) ||
    (definition.customNameRaw && !hasTemplateMarker(definition.customNameRaw))
  );
};

const isTemplateDefinition = (definition: ItemDefinitionEvidence): boolean => {
  return Boolean(
    hasTemplateMarker(definition.itemModel) ||
    hasTemplateMarker(definition.customNameRaw) ||
    hasTemplateMarker(definition.customDataRaw)
  );
};

const matchDefinitionFingerprints = (
  left: ItemFingerprint,
  right: ItemFingerprint
): LinkMatch => {
  if (left.itemModel && right.itemModel && left.itemModel === right.itemModel) {
    if (
      left.customDataNormalized &&
      right.customDataNormalized &&
      left.customDataNormalized === right.customDataNormalized
    ) {
      return {
        matched: true,
        strength: 'strong',
        ruleName: 'itemModel+customData',
        reason: `Merged definitions by itemModel '${left.itemModel}' and customData`,
      };
    }

    if (
      left.customNameNormalized &&
      right.customNameNormalized &&
      left.customNameNormalized === right.customNameNormalized
    ) {
      return {
        matched: true,
        strength: 'strong',
        ruleName: 'itemModel+customName',
        reason: `Merged definitions by itemModel '${left.itemModel}' and customName '${left.customNameNormalized}'`,
      };
    }

    if (
      !left.customDataNormalized &&
      !right.customDataNormalized &&
      !left.customNameNormalized &&
      !right.customNameNormalized
    ) {
      return {
        matched: true,
        strength: 'medium',
        ruleName: 'itemModel',
        reason: `Merged definitions by itemModel '${left.itemModel}'`,
      };
    }
  }

  if (
    left.baseItemId &&
    right.baseItemId &&
    left.customDataNormalized &&
    right.customDataNormalized &&
    left.baseItemId === right.baseItemId &&
    left.customDataNormalized === right.customDataNormalized
  ) {
    return {
      matched: true,
      strength: 'strong',
      ruleName: 'baseItem+customData',
      reason: `Merged definitions by baseItemId '${left.baseItemId}' and customData`,
    };
  }

  if (
    left.customNameNormalized &&
    right.customNameNormalized &&
    left.customNameNormalized === right.customNameNormalized
  ) {
    return {
      matched: true,
      strength: 'medium',
      ruleName: 'customName',
      reason: `Merged definitions by customName '${left.customNameNormalized}'`,
    };
  }

  return { matched: false };
};

const findBestCandidateForDefinition = (
  definitionFingerprint: ItemFingerprint,
  candidates: CandidateState[]
): DefinitionMatchCandidate | undefined => {
  let best: DefinitionMatchCandidate | undefined;

  for (let i = 0; i < candidates.length; i++) {
    const candidateState = candidates[i];

    for (const fingerprint of candidateState.definitionFingerprints) {
      const match = matchDefinitionFingerprints(fingerprint, definitionFingerprint);
      if (!match.matched) continue;

      const rank = strengthRank(match.strength);
      if (!best || rank > strengthRank(best.match.strength)) {
        best = {
          candidateIndex: i,
          match,
        };
      }
    }
  }

  return best;
};

const createDefinitionCandidates = (
  definitions: ItemDefinitionEvidence[]
): CandidateState[] => {
  const candidates: CandidateState[] = [];

  for (const definition of definitions) {
    const { fingerprint, warnings } = buildDefinitionFingerprint(definition);
    const matched = findBestCandidateForDefinition(fingerprint, candidates);

    if (!matched) {
      candidates.push({
        candidate: {
          id: `candidate:${candidates.length}`,
          definitions: [definition],
          triggers: [],
          fingerprints: [fingerprint],
          warnings: [...warnings],
        },
        definitionFingerprints: [fingerprint],
      });
      continue;
    }

    const target = candidates[matched.candidateIndex];
    target.candidate.definitions.push(definition);
    target.candidate.fingerprints.push(fingerprint);
    target.definitionFingerprints.push(fingerprint);
    target.candidate.warnings.push(...warnings);
    if (matched.match.reason) {
      target.candidate.warnings.push(matched.match.reason);
    }
  }

  return candidates;
};

const strengthRank = (strength?: LinkMatch['strength']): number => {
  switch (strength) {
    case 'strong':
      return 3;
    case 'medium':
      return 2;
    case 'weak':
      return 1;
    default:
      return 0;
  }
};

const findBestCandidateForTrigger = (
  triggerFingerprint: ItemFingerprint,
  candidates: CandidateState[]
): TriggerMatchCandidate | undefined => {
  let best: TriggerMatchCandidate | undefined;

  for (let i = 0; i < candidates.length; i++) {
    const candidateState = candidates[i];

    for (const definitionFingerprint of candidateState.definitionFingerprints) {
      const match = matchFingerprints(definitionFingerprint, triggerFingerprint);
      if (!match.matched) continue;

      if (!best || strengthRank(match.strength) > strengthRank(best.match.strength)) {
        best = {
          candidateIndex: i,
          match,
        };
      }
    }
  }

  return best;
};

export const linkItemEvidence = (
  definitions: ItemDefinitionEvidence[],
  triggers: ItemTriggerEvidence[]
): LinkResult => {
  const parametricDefinitions = definitions.filter(isParametricDefinition);
  const templateDefinitions = definitions.filter(definition => isTemplateDefinition(definition) && !isParametricDefinition(definition));
  const linkableDefinitions = definitions.filter(definition => !isTemplateDefinition(definition));
  const candidates = createDefinitionCandidates(linkableDefinitions);

  const unlinkedTriggers: ItemTriggerEvidence[] = [];
  const nonItemTriggers: ItemTriggerEvidence[] = [];
  const warnings: string[] = [];

  for (const trigger of triggers) {
    const { fingerprint: triggerFingerprint, warnings: triggerWarnings } =
      buildTriggerFingerprint(trigger);

    if (!hasAnyIdentity(triggerFingerprint)) {
      nonItemTriggers.push(trigger);
      continue;
    }

    const best = findBestCandidateForTrigger(triggerFingerprint, candidates);

    if (!best) {
      unlinkedTriggers.push(trigger);
      continue;
    }

    const target = candidates[best.candidateIndex];
    target.candidate.triggers.push(trigger);
    target.candidate.fingerprints.push(triggerFingerprint);

    if (triggerWarnings.length > 0) {
      target.candidate.warnings.push(...triggerWarnings);
    }

    if (best.match.ruleName) {
      target.candidate.warnings.push(
        `Linked trigger '${trigger.advancementId}' by rule '${best.match.ruleName}'`
      );
    }

    if (best.match.reason) {
      target.candidate.warnings.push(best.match.reason);
    }
  }

  const linkedItems = candidates.map(({ candidate }) => candidate);

  const unlinkedDefinitions = linkedItems
    .filter(candidate => candidate.triggers.length === 0)
    .flatMap(candidate => candidate.definitions);

  return {
    linkedItems,
    unlinkedDefinitions,
    templateDefinitions,
    parametricDefinitions,
    unlinkedTriggers,
    nonItemTriggers,
    warnings,
  };
};
