import { TrifleTriggerHelper } from '../TriggerHelper';

export function TrifleWhileTargetTileIsOnBoardTriggerBrain(triggerContext) {
	this.board = triggerContext.board;
	this.triggerContext = triggerContext;
	this.targetTiles = [];
	this.targetTilePoints = [];
}

TrifleWhileTargetTileIsOnBoardTriggerBrain.prototype.isTriggerMet = function() {
	var self = this;
	this.board.forEachBoardPointWithTile(function(boardPointWithTile) {
		var triggerHelper = new TrifleTriggerHelper(self.triggerContext, boardPointWithTile);
		if (triggerHelper.tileIsTargeted()) {
			self.targetTiles.push(boardPointWithTile.tile);
			self.targetTilePoints.push(boardPointWithTile);
		}
	});

	return this.targetTiles.length > 0;
};


