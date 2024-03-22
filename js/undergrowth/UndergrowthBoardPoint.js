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
import { UNDERGROWTH_SIMPLE, gameOptionEnabled } from '../GameOptions';
import { Undergrowth } from './UndergrowthController';

export function UndergrowthBoardPoint() {
	this.types = [];
	this.row = -1;
	this.col = -1;
}

UndergrowthBoardPoint.prototype.addType = function(type) {
	if (!this.types.includes(type)) {
		this.types.push(type);
	}
};

UndergrowthBoardPoint.prototype.removeType = function(type) {
	for (var i = 0; i < this.types.length; i++) {
		if (this.types[i] === type) {
			this.types.splice(i, 1);
		}
	}
};

UndergrowthBoardPoint.prototype.getConsoleDisplay = function() {
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

UndergrowthBoardPoint.prototype.putTile = function(tile) {
	this.tile = tile;
};

UndergrowthBoardPoint.prototype.hasTile = function() {
	if (this.tile) {
		return true;
	}
	return false;
};

UndergrowthBoardPoint.prototype.isType = function(type) {
	return this.types.includes(type);
};

UndergrowthBoardPoint.prototype.isOpenGate = function() {
	return !this.hasTile() && this.types.includes(GATE);
};

UndergrowthBoardPoint.prototype.removeTile = function() {
	var theTile = this.tile;

	this.tile = null;

	return theTile;
};

UndergrowthBoardPoint.prototype.drainTile = function() {
	if (this.tile) {
		this.tile.drain();
	}
};

UndergrowthBoardPoint.prototype.restoreTile = function() {
	if (this.tile) {
		this.tile.restore();
	}
};

UndergrowthBoardPoint.prototype.canHoldTile = function(tile, ignoreTileCheck) {
	// Validate this point's ability to hold given tile

	if (this.isType(NON_PLAYABLE)) {
		return false;
	}

	if (!ignoreTileCheck && this.hasTile()) {
		// This function does not take into account capturing abilities
		return false;
	}

	if (gameOptionEnabled(UNDERGROWTH_SIMPLE)) {
		return true;
	}

	// For Solitaire: GATEs are OK
	if (this.isType(GATE)) {
		return true;
	}

	if (tile.type === BASIC_FLOWER) {
		if (!(this.isType(NEUTRAL) || this.isType(tile.basicColorName))) {
			// Opposing colored point
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

UndergrowthBoardPoint.prototype.isCompletelyWithinRedOrWhiteGarden = function() {
	return !this.isType(NEUTRAL) 
			&& ((this.isType(RED) && !this.isType(WHITE)) 
				|| (this.isType(WHITE) && !this.isType(RED)));
};

UndergrowthBoardPoint.prototype.betweenPlayerHarmony = function(player) {
	if (player === GUEST) {
		return this.betweenHarmonyGuest;
	} else if (player === HOST) {
		return this.betweenHarmonyHost;
	}
	return false;
};

UndergrowthBoardPoint.prototype.getCopy = function() {
	var copy = new UndergrowthBoardPoint();

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

UndergrowthBoardPoint.neutral = function() {
	var point = new UndergrowthBoardPoint();
	point.addType(NEUTRAL);

	return point;
};

UndergrowthBoardPoint.gate = function() {
	var point = new UndergrowthBoardPoint();
	point.addType(GATE);

	return point;
};

UndergrowthBoardPoint.red = function() {
	var point = new UndergrowthBoardPoint();
	point.addType(RED);

	return point;
};

UndergrowthBoardPoint.white = function() {
	var point = new UndergrowthBoardPoint();
	point.addType(WHITE);

	return point;
};

UndergrowthBoardPoint.redWhite = function() {
	var point = new UndergrowthBoardPoint();
	point.addType(RED);
	point.addType(WHITE);

	return point;
};

UndergrowthBoardPoint.redWhiteNeutral = function() {
	var point = new UndergrowthBoardPoint();
	point.addType(RED);
	point.addType(WHITE);
	point.addType(NEUTRAL);

	return point;
};

UndergrowthBoardPoint.redNeutral = function() {
	var point = new UndergrowthBoardPoint();
	point.addType(RED);
	point.addType(NEUTRAL);

	return point;
};

UndergrowthBoardPoint.whiteNeutral = function() {
	var point = new UndergrowthBoardPoint();
	point.addType(WHITE);
	point.addType(NEUTRAL);

	return point;
};



