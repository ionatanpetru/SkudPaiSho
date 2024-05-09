import { TEMPLE } from '../../TrifleBoardPoint';
import { TrifleTriggerHelper } from '../TriggerHelper';

export function TrifleWhenTargetTileLandsInTempleTriggerBrain(triggerContext) {
	this.targetTiles = [];
	this.targetTilePoints = [];
	this.board = triggerContext.board;
	this.triggerContext = triggerContext;

	this.possibleTargetTile = triggerContext.lastTurnAction.tileMovedOrPlaced;
	this.possibleTargetTileInfo = triggerContext.lastTurnAction.tileMovedOrPlacedInfo;
	this.possibleTargetTilePoint = triggerContext.lastTurnAction.boardPointEnd;

	this.thisTile = triggerContext.tile;
	this.thisTileInfo = triggerContext.tileInfo;
	this.thisTilePoint = triggerContext.pointWithTile;
}

TrifleWhenTargetTileLandsInTempleTriggerBrain.prototype.isTriggerMet = function() {
	/* Look at the tile that moved, did it just land in Temple? Is it targeted? */
	
	if (this.possibleTargetTilePoint && this.possibleTargetTilePoint.tile === this.possibleTargetTile) {
		if (this.possibleTargetTilePoint.isType(TEMPLE)) {
			var triggerHelper = new TrifleTriggerHelper(this.triggerContext, this.possibleTargetTilePoint);
			if (triggerHelper.tileIsTargeted()) {
				this.targetTiles.push(this.possibleTargetTilePoint.tile);
				this.targetTilePoints.push(this.possibleTargetTilePoint);
			}
		}
	}

	return this.targetTiles.length > 0;
};
