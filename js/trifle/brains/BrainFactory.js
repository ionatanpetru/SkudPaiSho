import {
  TrifleAbilityName,
  TrifleAbilityTriggerType,
  TrifleTargetType,
} from '../TrifleTileInfo';
import { debug } from '../../GameData';

export function TrifleBrainFactory() {

}

TrifleBrainFactory.prototype.createTriggerBrain = function(abilityTriggerInfo, triggerContext) {
	switch(abilityTriggerInfo.triggerType) {
		case TrifleAbilityTriggerType.whileInsideTemple:
			return new TrifleWhileInsideTempleTriggerBrain(triggerContext);
		case TrifleAbilityTriggerType.whileOutsideTemple:
			return new TrifleWhileOutsideTempleTriggerBrain(triggerContext);
		case TrifleAbilityTriggerType.whileTargetTileIsOnBoard:
			return new TrifleWhileTargetTileIsOnBoardTriggerBrain(triggerContext);
		case TrifleAbilityTriggerType.whileTargetTileIsAdjacent:
			return new TrifleWhileTargetTileIsAdjacentTriggerBrain(triggerContext);
		case TrifleAbilityTriggerType.whileTargetTileIsSurrounding:
			return new TrifleWhileTargetTileIsSurroundingTriggerBrain(triggerContext);
		case TrifleAbilityTriggerType.whileTargetTileIsInZone:
			return new TrifleWhileTargetTileIsInZoneTriggerBrain(triggerContext);
		case TrifleAbilityTriggerType.whileTargetTileIsInLineOfSight:
			return new TrifleWhileTargetTileIsInLineOfSightTriggerBrain(triggerContext);
		case TrifleAbilityTriggerType.whenTargetTileLandsInZone:
			return new TrifleWhenTargetTileLandsInZoneTriggerBrain(triggerContext);
		case TrifleAbilityTriggerType.whenTargetTileMovesFromWithinZone:
			return new TrifleWhenTargetTileMovesFromWithinZoneTriggerBrain(triggerContext);
		case TrifleAbilityTriggerType.whenCapturedByTargetTile:
			return new TrifleWhenCapturedByTargetTileTriggerBrain(triggerContext);
		case TrifleAbilityTriggerType.whenCapturingTargetTile:
			return new TrifleWhenCapturingTargetTileTriggerBrain(triggerContext);
		case TrifleAbilityTriggerType.whenLandsAdjacentToTargetTile:
			return new TrifleWhenLandsAdjacentToTargetTileTriggerBrain(triggerContext);
		case TrifleAbilityTriggerType.whenLandsSurroundingTargetTile:
			return new TrifleWhenLandsSurroundingTargetTileTriggerBrain(triggerContext);
		case TrifleAbilityTriggerType.whenTargetTileLandsAdjacent:
			return new TrifleWhenTargetTileLandsAdjacentTriggerBrain(triggerContext);
		case TrifleAbilityTriggerType.whenTargetTileLandsSurrounding:
			return new TrifleWhenTargetTileLandsSurroundingTriggerBrain(triggerContext);
		case TrifleAbilityTriggerType.whenDeployed:
			return new TrifleWhenDeployedTriggerBrain(triggerContext);
		case TrifleAbilityTriggerType.whenActiveMovement:
			return new TrifleWhenActiveMovementTriggerBrain(triggerContext);
		case TrifleAbilityTriggerType.whenTargetTileLandsInTemple:
			return new TrifleWhenTargetTileLandsInTempleTriggerBrain(triggerContext);
		default:
			debug("No Trigger Brain created for trigger: " + abilityTriggerInfo.triggerType);
	}
};

TrifleBrainFactory.createAbilityBrain = function(abilityName, abilityObject) {
	switch(abilityName) {
		/* Action abilities will need specific ability brains
			but ongoing abilities that are checked for in game logic can have generic brain */
		case TrifleAbilityName.captureTargetTiles:
			return new TrifleCaptureTargetTilesAbilityBrain(abilityObject);
		case TrifleAbilityName.growGigantic:
			return new TrifleGrowGiganticAbilityBrain(abilityObject);
		case TrifleAbilityName.recordTilePoint:
			return new TrifleRecordTilePointAbilityBrain(abilityObject);
		case TrifleAbilityName.moveTileToRecordedPoint:
			return new TrifleMoveTileToRecordedPointAbilityBrain(abilityObject);
		case TrifleAbilityName.moveTargetTile:
			return new TrifleMoveTargetTileAbilityBrain(abilityObject);
		case TrifleAbilityName.moveTargetTileToPile:
			return new TrifleMoveTargetTileToPileAbilityBrain(abilityObject);
		case TrifleAbilityName.exchangeWithCapturedTile:
			return new TrifleExchangeWithCapturedTileAbilityBrain(abilityObject);
		default:
			return new TrifleSimpleOngoingAbilityBrain(abilityObject);
	}
};

TrifleBrainFactory.createTargetBrain = function(targetType, abilityObject) {
	switch(targetType) {
		case TrifleTargetType.triggerTargetTiles:
			return new TrifleTriggerTargetTilesTargetBrain(abilityObject);
		case TrifleTargetType.allTiles:
			return new TrifleAllTilesTargetBrain(abilityObject);
		case TrifleTargetType.surroundingTiles:
			return new TrifleSurroundingTilesTargetBrain(abilityObject);
		case TrifleTargetType.thisTile:
			return new TrifleThisTileTargetBrain(abilityObject);
		case TrifleTargetType.chosenCapturedTile:
			return new TrifleChosenCapturedTileTargetBrain(abilityObject);
	}
};

