import { debug } from '../../../GameData';

export function TrifleImmobilizeTilesAbilityBrain(abilityObject) {
	this.abilityObject = abilityObject;
}

TrifleImmobilizeTilesAbilityBrain.prototype.activateAbility = function() {
	debug("Immobilize Tiles ability activating...");
	// Attach ability to target tile
	// Get target tiles
	var targetTiles = this.abilityObject.targetTiles;

	debug("Target Tiles:");
	debug(targetTiles);
	
};
