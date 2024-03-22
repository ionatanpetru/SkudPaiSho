// Board Point

import { GUEST, HOST } from "../CommonNotationObjects";
import { ACCENT_TILE, BASIC_FLOWER, SPECIAL_FLOWER } from "../GameData";
import { RED, WHITE } from './SkudPaiShoTile';

export var NON_PLAYABLE = "Non-Playable";
export var NEUTRAL = "Neutral";

export var GATE = "Gate";

export var MARKED = "Marked";
export var POSSIBLE_MOVE = "Possible Move";
export var OPEN_GATE = "OPEN GATE";

export var thinDot = "·";
export var thickDot = "•";
export var whiteDot = "◦";
export var gateDot = "⟡";

export class SkudPaiShoBoardPoint {
	constructor() {
		this.types = [];
		this.row = -1;
		this.col = -1;
	}
	// Point makers
	static neutral() {
		var point = new SkudPaiShoBoardPoint();
		point.addType(NEUTRAL);

		return point;
	}
	static gate() {
		var point = new SkudPaiShoBoardPoint();
		point.addType(GATE);

		return point;
	}
	static red() {
		var point = new SkudPaiShoBoardPoint();
		point.addType(RED);

		return point;
	}
	static white() {
		var point = new SkudPaiShoBoardPoint();
		point.addType(WHITE);

		return point;
	}
	static redWhite() {
		var point = new SkudPaiShoBoardPoint();
		point.addType(RED);
		point.addType(WHITE);

		return point;
	}
	static redWhiteNeutral() {
		var point = new SkudPaiShoBoardPoint();
		point.addType(RED);
		point.addType(WHITE);
		point.addType(NEUTRAL);

		return point;
	}
	static redNeutral() {
		var point = new SkudPaiShoBoardPoint();
		point.addType(RED);
		point.addType(NEUTRAL);

		return point;
	}
	static whiteNeutral() {
		var point = new SkudPaiShoBoardPoint();
		point.addType(WHITE);
		point.addType(NEUTRAL);

		return point;
	}
	addType(type) {
		if (!this.types.includes(type)) {
			this.types.push(type);
		}
	}
	removeType(type) {
		for (var i = 0; i < this.types.length; i++) {
			if (this.types[i] === type) {
				this.types.splice(i, 1);
			}
		}
	}
	getConsoleDisplay() {
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
	}
	putTile(tile) {
		this.tile = tile;
	}
	hasTile() {
		if (this.tile) {
			return true;
		}
		return false;
	}
	isType(type) {
		return this.types.includes(type);
	}
	isOpenGate() {
		return !this.hasTile() && this.types.includes(GATE);
	}
	removeTile() {
		var theTile = this.tile;

		this.tile = null;

		return theTile;
	}
	drainTile() {
		if (this.tile) {
			this.tile.drain();
		}
	}
	restoreTile() {
		if (this.tile) {
			this.tile.restore();
		}
	}
	canHoldTile(tile, ignoreTileCheck) {
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
	}
	betweenPlayerHarmony(player) {
		if (player === GUEST) {
			return this.betweenHarmonyGuest;
		} else if (player === HOST) {
			return this.betweenHarmonyHost;
		}
		return false;
	}
	setMoveDistanceRemaining(movementInfo, distanceRemaining) {
		this.moveDistanceRemaining = distanceRemaining;
	}
	getMoveDistanceRemaining( /* movementInfo */) {
		return this.moveDistanceRemaining;
	}
	clearPossibleMovementTypes() {
		this.moveDistanceRemaining = null;
	}
	getCopy() {
		var copy = new SkudPaiShoBoardPoint();

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
	}
}



