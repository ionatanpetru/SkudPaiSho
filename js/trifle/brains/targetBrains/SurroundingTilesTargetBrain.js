import { TrifleTargetHelper } from '../TargetHelper';

export function TrifleSurroundingTilesTargetBrain(abilityObject) {
	this.abilityObject = abilityObject;
	this.board = abilityObject.board;

	this.targetTiles = [];
	this.targetTilePoints = [];
	
	this.setTargets();
}

TrifleSurroundingTilesTargetBrain.prototype.setTargets = function() {
	this.targetTiles = [];
	this.targetTilePoints = [];

	var self = this;
	
	this.abilityObject.triggerTargetTilePoints.forEach(function(boardPointWithTile) {
		var targetHelper = new TrifleTargetHelper(self.abilityObject, boardPointWithTile, self);
		if (targetHelper.tileIsTargeted()) {
			self.targetTiles.push(boardPointWithTile.tile);
			self.targetTilePoints.push(boardPointWithTile);
		}
	});
};


