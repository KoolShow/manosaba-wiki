import { extractItemMatchFromCondition, normalizeTriggerType, readObject, readString } from './utils';
import { extractEntityHurtPlayerMatch } from './playerHurt';
import type { ExtractedCriterionMatch } from '../types';

export const extractCriterionItemMatch = (
  criterionName: string,
  criterion: unknown
): ExtractedCriterionMatch => {
  const criterionObj = readObject(criterion);
  const rawTrigger = readString(criterionObj?.trigger);
  const triggerType = normalizeTriggerType(rawTrigger);
  const warnings: string[] = [];

  const conditions = readObject(criterionObj?.conditions);

  if (!criterionObj) {
    return {
      triggerType: 'unknown',
      rawTrigger,
      warnings: [ `Criterion '${criterionName}' is not an object` ],
    };
  }

  if (!conditions) {
    if (triggerType === 'player_hurt_entity') {
      warnings.push(`Criterion '${criterionName}' has no item-related condition`);
    } else {
      return {
        triggerType,
        rawTrigger,
        warnings: [ `Criterion '${criterionName}' has no conditions object` ],
      };
    }
  }

  if (triggerType === 'consume_item' || triggerType === 'using_item') {
    const item = readObject(conditions!.item);
    if (!item) {
      return {
        triggerType,
        rawTrigger,
        warnings: [ `Criterion '${criterionName}' has no conditions.item` ],
      };
    }

    return {
      triggerType,
      rawTrigger,
      matchPath: `criteria.${criterionName}.conditions.item`,
      warnings,
      ...extractItemMatchFromCondition(item),
    };
  }

  if (triggerType === 'inventory_changed') {
    const item = readObject(conditions!.items) ?? readObject(conditions!.item);

    if (!item) {
      return {
        triggerType,
        rawTrigger,
        warnings: [ `Criterion '${criterionName}' inventory_changed has no item-related condition` ],
      };
    }

    return {
      triggerType,
      rawTrigger,
      matchPath: `criteria.${criterionName}.conditions.items`,
      warnings,
      ...extractItemMatchFromCondition(item),
    };
  }

  if (triggerType === 'player_hurt_entity') {
    const damage = readObject(conditions?.damage);
    const type = readObject(damage?.type);
    const sourceEntity = readObject(type?.source_entity);
    const equipment = readObject(sourceEntity?.equipment);
    const mainhand = readObject(equipment?.mainhand);

    if (!mainhand) {
      return {
        triggerType,
        rawTrigger,
        warnings: [ `Criterion '${criterionName}' player_hurt_entity has no item-related condition` ],
      };
    }

    return {
      triggerType,
      rawTrigger,
      slot: 'mainhand',
      matchPath: `criteria.${criterionName}.conditions.damage.type.source_entity.equipment.mainhand`,
      warnings,
      ...extractItemMatchFromCondition(mainhand),
    };
  }

  if (triggerType === 'entity_hurt_player') {
    return {
      triggerType,
      rawTrigger,
      ...extractEntityHurtPlayerMatch(criterionName, conditions!),
    };
  }

  if (triggerType === 'item_used_on_block') {
    const item = readObject(conditions!.item);
    if (item) {
      return {
        triggerType,
        rawTrigger,
        matchPath: `criteria.${criterionName}.conditions.item`,
        warnings,
        ...extractItemMatchFromCondition(item),
      };
    }

    const location = readObject(conditions!.location);
    const player = readObject(location?.player);
    const equipment = readObject(player?.equipment);
    const mainhand = readObject(equipment?.mainhand);

    if (mainhand) {
      return {
        triggerType,
        rawTrigger,
        slot: 'mainhand',
        matchPath: `criteria.${criterionName}.conditions.location.player.equipment.mainhand`,
        warnings,
        ...extractItemMatchFromCondition(mainhand),
      };
    }

    return {
      triggerType,
      rawTrigger,
      warnings: [ `Criterion '${criterionName}' item_used_on_block shape not supported` ],
    };
  }

  return {
    triggerType,
    rawTrigger,
    warnings: [ `Criterion '${criterionName}' trigger '${rawTrigger ?? 'unknown'}' not supported` ],
  };
};
