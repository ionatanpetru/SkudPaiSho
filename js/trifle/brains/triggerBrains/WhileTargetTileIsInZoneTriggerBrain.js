import { TrifleTriggerHelper } from '../TriggerHelper';

export function TrifleWhileTargetTileIsInZoneTriggerBrain(triggerContext) {
	this.targetTiles = [];
	this.targetTilePoints = [];
	this.board = triggerContext.board;
	this.triggerContext = triggerContext;

	this.thisTile = triggerContext.tile;
	this.thisTileInfo = triggerContext.tileInfo;
	this.thisTilePoint = triggerContext.pointWithTile;
}

TrifleWhileTargetTileIsInZoneTriggerBrain.prototype.isTriggerMet = function() {
	/* Look at the tiles within this tile's zone. Are they targeted? */

	var zonePoints = this.board.getZonePoints(this.thisTilePoint);

	var self = this;

	zonePoints.forEach(function(zonePoint) {
		if (zonePoint.hasTile()) {
			var triggerHelper = new TrifleTriggerHelper(self.triggerContext, zonePoint);
			if (triggerHelper.tileIsTargeted()) {
				self.targetTiles.push(zonePoint.tile);
				self.targetTilePoints.push(zonePoint);
			}
		}
	});

	return this.targetTiles.length > 0;
};
