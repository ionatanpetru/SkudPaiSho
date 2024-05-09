// Tile

import { GUEST, HOST } from '../CommonNotationObjects';
import { debug } from '../GameData';

export var TrifleTileId = 1;

export var TrifleTile = function(code, ownerCode) {
	this.code = code;
	this.ownerCode = ownerCode;
	if (this.ownerCode === 'G') {
		this.ownerName = GUEST;
	} else if (this.ownerCode === 'H') {
		this.ownerName = HOST;
	} else {
		debug("INCORRECT OWNER CODE");
	}
	this.id = TrifleTileId++;
	this.selectedFromPile = false;
}

TrifleTile.prototype.resetTrifleTileId = function() {
	TrifleTileId = 1;
};

TrifleTile.prototype.getImageName = function() {
	return this.ownerCode + "" + this.code;
};

TrifleTile.prototype.canMove = function(first_argument) {
	return !(this.code === 'C' || this.code === 'F');
};

TrifleTile.prototype.getMoveDistance = function() {
	if (this.code === 'L' || this.code === 'B') {
		return 1;
	} else if (this.code === 'S') {
		return 6;
	}

	return 0;
};

TrifleTile.prototype.isFlowerTile = function() {
	// Must be L, C, F
	return this.code === 'L' || this.code === 'C' || this.code === 'F';
};

TrifleTile.prototype.hasCaptureAbility = function() {
	// Must be D, W, S
	return this.code === 'D' || this.code === 'W' || this.code === 'S';
};

TrifleTile.prototype.getName = function() {
	return TrifleTile.getTileName(this.code);
};

TrifleTile.prototype.getNotationName = function() {
	return this.ownerCode + "" + this.code;
}

TrifleTile.prototype.getCopy = function() {
	return new TrifleTile(this.code, this.ownerCode);
};


TrifleTile.getTileName = function(tileCode) {
	var name = "";

	if (PaiShoGames.currentTileNames && PaiShoGames.currentTileNames[tileCode]) {
		name = PaiShoGames.currentTileNames[tileCode];
	} else {
		Object.keys(PaiShoGames.currentTileCodes).forEach(function(key, index) {
			if (PaiShoGames.currentTileCodes[key] === tileCode) {
				name = key;
			}
		});
	}

	return name;
};

TrifleTile.prototype.getOwnerCodeIdObject = function() {
	return {
		ownerName: this.ownerName,
		code: this.code,
		id: this.id
	};
};
TrifleTile.prototype.getOwnerCodeIdObjectString = function() {
	return JSON.stringify(this.getOwnerCodeIdObject());
};

TrifleTile.getTeamLimitForTile = function(tileCode) {
	var tileData = PaiShoGames.currentTileMetadata[tileCode];
	if (tileData) {
		if (tileData.teamLimit) {
			return tileData.teamLimit;
		} else if (tileData.isBanner) {
			return 1;
		}
	}
	return 2;
};


