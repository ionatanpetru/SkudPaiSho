import { debug } from '../../../GameData';

export function TrifleCancelZoneAbilityBrain(abilityObject) {
	this.abilityObject = abilityObject;

	this.targetTiles = [];
	this.targetTilePoints = [];
	this.setTargetTiles();
}

TrifleCancelZoneAbilityBrain.prototype.setTargetTiles = function() {
	this.targetTiles = this.abilityObject.targetTiles;

	debug("Target Tiles:");
	debug(this.targetTiles);
};

TrifleCancelZoneAbilityBrain.prototype.activateAbility = function() {
	debug("Cancel Zone ability activating...");
	// Nothing to do, ability just exists
};

TrifleCancelZoneAbilityBrain.prototype.getTargetTiles = function() {
	return this.targetTiles;
}

TrifleCancelZoneAbilityBrain.prototype.getTargetTilesPoints = function() {
	return this.targetTilePoints;
};
