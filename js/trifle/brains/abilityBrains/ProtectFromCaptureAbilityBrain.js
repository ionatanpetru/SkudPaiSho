import { debug } from '../../../GameData';

export function TrifleProtectFromCaptureAbilityBrain(abilityObject) {
	this.abilityObject = abilityObject;
}

TrifleProtectFromCaptureAbilityBrain.prototype.activateAbility = function() {
	debug("Protect From Capture ability activating...");

	var targetTiles = this.abilityObject.targetTiles;

	debug("Target Tiles:");
	debug(targetTiles);
};
