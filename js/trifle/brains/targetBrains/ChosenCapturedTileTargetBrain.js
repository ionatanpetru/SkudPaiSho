import { TrifleTargetHelper } from '../TargetHelper';

export function TrifleChosenCapturedTileTargetBrain(abilityObject) {
	this.abilityObject = abilityObject;
	this.board = abilityObject.board;

	this.targetTiles = [];
	this.targetTilePoints = [];
	
	this.setTargets();
}

TrifleChosenCapturedTileTargetBrain.prototype.setTargets = function() {
	this.targetTiles = [];

	this.abilityObject.board.tileManager.capturedTiles.forEach(capturedTile => {
		var targetHelper = new TrifleTargetHelper(this.abilityObject, null, this, capturedTile);
		if (targetHelper.tileIsTargeted()) {
			this.targetTiles.push(capturedTile);
		}
	});
};
