import { debug } from '../../../GameData';

export function TrifleGrantBonusMovementAbilityBrain(abilityObject) {
	this.abilityObject = abilityObject;
	this.abilityInfo = abilityObject.abilityInfo;
	this.bonusMovementInfo = this.abilityInfo.bonusMovement;
}

TrifleGrantBonusMovementAbilityBrain.prototype.activateAbility = function() {
	debug("Grant Bonus Movement ability activating...");

	var targetTiles = this.abilityObject.targetTiles;

	debug("Target Tiles:");
	debug(targetTiles);
};
