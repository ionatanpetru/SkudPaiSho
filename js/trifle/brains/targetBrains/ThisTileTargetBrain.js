import { TrifleTargetHelper } from '../TargetHelper';

export class TrifleThisTileTargetBrain {
	constructor(abilityObject) {
		this.abilityObject = abilityObject;
		this.board = abilityObject.board;

		this.targetTiles = [];
		this.targetTilePoints = [];

		this.setTargets();
	}

	setTargets() {
		this.targetTiles = [];
		this.targetTilePoints = [];

		var targetHelper = new TrifleTargetHelper(this.abilityObject, this.abilityObject.sourceTilePoint, this, this.abilityObject.sourceTile);
		if (targetHelper.tileIsTargeted()) {
			this.targetTiles.push(this.abilityObject.sourceTile);
			this.targetTilePoints.push(this.abilityObject.sourceTilePoint);
		}
	}
}

/* Version using .prototype: */
/* TrifleThisTileTargetBrain = function(abilityObject) {
	this.abilityObject = abilityObject;
	this.board = abilityObject.board;

	this.targetTiles = [];
	this.targetTilePoints = [];
	
	this.setTargets();
}

TrifleThisTileTargetBrain.prototype.setTargets = function() {
	this.targetTiles = [];
	this.targetTilePoints = [];

	var targetHelper = new TrifleTargetHelper(this.abilityObject, this.abilityObject.sourceTilePoint, this);
	if (targetHelper.tileIsTargeted()) {
		this.targetTiles.push(this.abilityObject.sourceTile);
		this.targetTilePoints.push(this.abilityObject.sourceTilePoint);
	}
}; */


