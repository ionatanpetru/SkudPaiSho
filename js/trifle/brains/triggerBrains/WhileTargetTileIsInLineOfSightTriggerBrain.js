import { TrifleTriggerHelper } from '../TriggerHelper';

export function TrifleWhileTargetTileIsInLineOfSightTriggerBrain(triggerContext) {
	this.board = triggerContext.board;
	this.triggerContext = triggerContext;
	this.targetTiles = [];
	this.targetTilePoints = [];

	this.thisTile = triggerContext.tile;
	this.thisTileInfo = triggerContext.tileInfo;
	this.thisTilePoint = triggerContext.pointWithTile;
}

TrifleWhileTargetTileIsInLineOfSightTriggerBrain.prototype.isTriggerMet = function() {
	this.targetTiles = [];

	var sightTilePoints = this.board.getPointsForTilesInLineOfSight(this.thisTilePoint);

	var self = this;

	sightTilePoints.forEach(function(sightTilePoint) {
		if (sightTilePoint.hasTile()) {	// It should, but why not check? We're inside a BRAIN for crying out loud!
			var triggerHelper = new TrifleTriggerHelper(self.triggerContext, sightTilePoint);
			if (triggerHelper.tileIsTargeted()) {
				self.targetTiles.push(sightTilePoint.tile);
				self.targetTilePoints.push(sightTilePoint);
			}
		}
	});

	return this.targetTiles.length > 0;
};


