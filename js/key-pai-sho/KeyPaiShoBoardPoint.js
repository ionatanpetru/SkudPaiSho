// Board Point

import { ACCENT_TILE, BASIC_FLOWER, SPECIAL_FLOWER } from '../GameData';
import {
  GATE,
  NEUTRAL,
  NON_PLAYABLE,
  gateDot,
  thickDot,
  thinDot,
  whiteDot,
} from '../skud-pai-sho/SkudPaiShoBoardPoint';
import { GUEST, HOST } from '../CommonNotationObjects';
import { RED, WHITE } from '../skud-pai-sho/SkudPaiShoTile';

export function KeyPaiShoBoardPoint() {
	this.types = [];
	this.row = -1;
	this.col = -1;
}

KeyPaiShoBoardPoint.prototype.addType = function(type) {
	if (!this.types.includes(type)) {
		this.types.push(type);
	}
};

KeyPaiShoBoardPoint.prototype.removeType = function(type) {
	for (var i = 0; i < this.types.length; i++) {
		if (this.types[i] === type) {
			this.types.splice(i, 1);
		}
	}
};

KeyPaiShoBoardPoint.prototype.getConsoleDisplay = function() {
	if (this.tile) {
		return this.tile.getConsoleDisplay();
	} else {
		var consoleDisplay = thinDot;

		if (this.types.includes(NON_PLAYABLE)) {
			consoleDisplay = " ";
		}

		var str = "";

		if (this.types.includes(RED)) {
			str = "R";
			consoleDisplay = thickDot;
		}
		if (this.types.includes(WHITE)) {
			str += "W";
			consoleDisplay = whiteDot;
		}
		if (this.types.includes(NEUTRAL)) {
			str += "N";
		}

		if (this.types.includes(GATE)) {
			str = "G";
			consoleDisplay = gateDot;
		}

		if (str.length > 1) {
			consoleDisplay = "+";
		}

		return consoleDisplay;
	}
};

KeyPaiShoBoardPoint.prototype.putTile = function(tile) {
	this.tile = tile;
};

KeyPaiShoBoardPoint.prototype.hasTile = function() {
	if (this.tile) {
		return true;
	}
	return false;
};

KeyPaiShoBoardPoint.prototype.hasTileOfType = function(types) {
	return this.tile && types && types.includes(this.tile.type);
};

KeyPaiShoBoardPoint.prototype.isType = function(type) {
	return this.types.includes(type);
};

KeyPaiShoBoardPoint.prototype.isOpenGate = function() {
	return !this.hasTile() && this.types.includes(GATE);
};

KeyPaiShoBoardPoint.prototype.removeTile = function() {
	var theTile = this.tile;

	this.tile = null;

	return theTile;
};

KeyPaiShoBoardPoint.prototype.drainTile = function() {
	if (this.tile) {
		this.tile.drain();
	}
};

KeyPaiShoBoardPoint.prototype.restoreTile = function() {
	if (this.tile) {
		this.tile.restore();
	}
};

KeyPaiShoBoardPoint.prototype.canHoldTile = function(tile, ignoreTileCheck) {
	// Validate this point's ability to hold given tile

	if (this.isType(NON_PLAYABLE)) {
		return false;
	}

	if (!ignoreTileCheck && this.hasTile()) {
		// This function does not take into account capturing abilities
		return false;
	}

	if (tile.type === BASIC_FLOWER) {
		if (!(this.isType(NEUTRAL) || this.isType(tile.basicColorName))) {
			// Opposing colored point
			return false;
		}

		if (this.isType(GATE)) {
			return false;
		}

		return true;
	} else if (tile.type === SPECIAL_FLOWER) {
		return true;
	} else if (tile.type === ACCENT_TILE) {
		return true;
	}

	return false;
};

KeyPaiShoBoardPoint.prototype.betweenPlayerHarmony = function(player) {
	if (player === GUEST) {
		return this.betweenHarmonyGuest;
	} else if (player === HOST) {
		return this.betweenHarmonyHost;
	}
	return false;
};

KeyPaiShoBoardPoint.prototype.setMoveDistanceRemaining = function(movementInfo, distanceRemaining) {
	this.moveDistanceRemaining = distanceRemaining;
};
KeyPaiShoBoardPoint.prototype.getMoveDistanceRemaining = function(movementInfo) {
	return this.moveDistanceRemaining;
};
KeyPaiShoBoardPoint.prototype.clearPossibleMovementTypes = function() {
	this.moveDistanceRemaining = null;
};

KeyPaiShoBoardPoint.prototype.getCopy = function() {
	var copy = new KeyPaiShoBoardPoint();

	// this.types
	for (var i = 0; i < this.types.length; i++) {
		copy.types.push(this.types[i]);
	}

	// this.row
	copy.row = this.row;
	// this.col
	copy.col = this.col;

	// tile
	if (this.hasTile()) {
		copy.tile = this.tile.getCopy();
	}

	return copy;
};



// Point makers

KeyPaiShoBoardPoint.neutral = function() {
	var point = new KeyPaiShoBoardPoint();
	point.addType(NEUTRAL);

	return point;
};

KeyPaiShoBoardPoint.gate = function() {
	var point = new KeyPaiShoBoardPoint();
	point.addType(GATE);

	return point;
};

KeyPaiShoBoardPoint.red = function() {
	var point = new KeyPaiShoBoardPoint();
	point.addType(RED);

	return point;
};

KeyPaiShoBoardPoint.white = function() {
	var point = new KeyPaiShoBoardPoint();
	point.addType(WHITE);

	return point;
};

KeyPaiShoBoardPoint.redWhite = function() {
	var point = new KeyPaiShoBoardPoint();
	point.addType(RED);
	point.addType(WHITE);

	return point;
};

KeyPaiShoBoardPoint.redWhiteNeutral = function() {
	var point = new KeyPaiShoBoardPoint();
	point.addType(RED);
	point.addType(WHITE);
	point.addType(NEUTRAL);

	return point;
};

KeyPaiShoBoardPoint.redNeutral = function() {
	var point = new KeyPaiShoBoardPoint();
	point.addType(RED);
	point.addType(NEUTRAL);

	return point;
};

KeyPaiShoBoardPoint.whiteNeutral = function() {
	var point = new KeyPaiShoBoardPoint();
	point.addType(WHITE);
	point.addType(NEUTRAL);

	return point;
};

KeyPaiShoBoardPoint.nonPlayable = function() {
	var point = new KeyPaiShoBoardPoint();
	point.addType(NON_PLAYABLE);

	return point;
};



