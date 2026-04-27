import { extractItemMatchFromCondition, hasAnyItemIdentity, readObject } from './utils';
import type { ExtractedCriterionMatch, TriggerSlot } from '../types';

interface CandidateCondition {
  path: string;
  slot?: TriggerSlot;
  value: unknown;
}

export const extractEntityHurtPlayerMatch = (
  criterionName: string,
  conditions: Record<string, unknown>
): Omit<ExtractedCriterionMatch, 'triggerType' | 'rawTrigger'> => {
  const warnings: string[] = [];

  const damage = readObject(conditions.damage);
  const damageType = readObject(damage?.type);
  const damageSourceEntity = readObject(damage?.source_entity);
  const typeSourceEntity = readObject(damageType?.source_entity);
  const player = readObject(conditions.player);

  const damageSourceEquipment = readObject(damageSourceEntity?.equipment);
  const typeSourceEquipment = readObject(typeSourceEntity?.equipment);
  const playerEquipment = readObject(player?.equipment);

  const candidates: CandidateCondition[] = [
    {
      path: `criteria.${criterionName}.conditions.damage.source_entity.equipment.mainhand`,
      slot: 'mainhand',
      value: damageSourceEquipment?.mainhand,
    },
    {
      path: `criteria.${criterionName}.conditions.damage.source_entity.equipment.offhand`,
      slot: 'offhand',
      value: damageSourceEquipment?.offhand,
    },
    {
      path: `criteria.${criterionName}.conditions.damage.type.source_entity.equipment.mainhand`,
      slot: 'mainhand',
      value: typeSourceEquipment?.mainhand,
    },
    {
      path: `criteria.${criterionName}.conditions.damage.type.source_entity.equipment.offhand`,
      slot: 'offhand',
      value: typeSourceEquipment?.offhand,
    },
    {
      path: `criteria.${criterionName}.conditions.player.equipment.mainhand`,
      slot: 'mainhand',
      value: playerEquipment?.mainhand,
    },
    {
      path: `criteria.${criterionName}.conditions.player.equipment.offhand`,
      slot: 'offhand',
      value: playerEquipment?.offhand,
    },
  ];

  for (const candidate of candidates) {
    const extracted = extractItemMatchFromCondition(candidate.value);

    if (hasAnyItemIdentity(extracted)) {
      return {
        ...extracted,
        matchPath: candidate.path,
        slot: candidate.slot ?? 'unknown',
        warnings,
      };
    }
  }

  if (typeSourceEntity || damageSourceEntity) {
    return {
      matchPath: typeSourceEntity ?
        `criteria.${criterionName}.conditions.damage.type.source_entity` :
        `criteria.${criterionName}.conditions.damage.source_entity`,
      warnings: [
        'entity_hurt_player matched a source_entity condition, but no item/equipment identity was found',
      ],
    };
  }

  if (player) {
    return {
      matchPath: `criteria.${criterionName}.conditions.player`,
      warnings: [
        'entity_hurt_player matched a player condition, but no supported equipment item identity was found',
      ],
    };
  }

  return {
    warnings: [
      'entity_hurt_player has no supported item-related condition',
    ],
  };
};
