
export type AdvancementTriggerType = 
  'consume_item' |
  'using_item' |
  'inventory_changed' |
  'player_hurt_entity' |
  'entity_hurt_player' |
  'item_used_on_block' |
  'unknown';

export type TriggerSlot = 'mainhand' | 'offhand' | 'head' | 'chest' | 'legs' | 'feet' | 'unknown';

export interface ExtractedCriterionMatch {
  triggerType: AdvancementTriggerType;
  rawTrigger?: string;
  matchedBaseItemId?: string;
  matchedItemModel?: string;
  matchedCustomDataRaw?: string;
  matchedCustomNameRaw?: string;
  matchPath?: string;
  slot?: TriggerSlot;
  warnings: string[];
}

// TODO: Base interface
export interface ItemTriggerEvidence {
  kind: 'item_trigger',

  sourcePath: string,
  sourceStem: string,
  sourceDir: string,
  namespace: string,

  advancementId: string,
  criterionName: string,
  triggerType: AdvancementTriggerType,
  rawTrigger?: string,

  rewardFunction?: string,
  
  matchedBaseItemId?: string,
  matchedItemModel?: string,
  matchedCustomDataRaw?: string,
  matchedCustomNameRaw?: string,

  matchPath?: string,
  slot?: TriggerSlot,

  warnings: string[],
}
