import { TrifleTriggerHelper } from '../TriggerHelper';

export function TrifleWhileTargetTileIsAdjacentTriggerBrain(triggerContext) {
	this.board = triggerContext.board;
	this.triggerContext = triggerContext;
	this.targetTiles = [];
	this.targetTilePoints = [];
}

TrifleWhileTargetTileIsAdjacentTriggerBrain.prototype.isTriggerMet = function() {
	/* Get adjacent tiles...  */
	var adjacentPoints = this.board.getAdjacentPoints(this.triggerContext.pointWithTile);

	var self = this;

	adjacentPoints.forEach(function(adjacentPoint) {
		if (adjacentPoint.hasTile()) {
			var triggerHelper = new TrifleTriggerHelper(self.triggerContext, adjacentPoint);
			if (triggerHelper.tileIsTargeted()) {
				self.targetTiles.push(adjacentPoint.tile);
				self.targetTilePoints.push(adjacentPoint);
			}
		}
	});

	return this.targetTiles.length > 0;
};


