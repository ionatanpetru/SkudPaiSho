// Vababond Board Point

import {
  ACCENT_TILE,
  BASIC_FLOWER,
  SPECIAL_FLOWER,
  copyArray,
} from '../GameData';
import {
  GATE,
  NEUTRAL,
  NON_PLAYABLE,
} from '../skud-pai-sho/SkudPaiShoBoardPoint';
import { RED, WHITE } from '../skud-pai-sho/SkudPaiShoTile';

export class VagabondBoardPoint {
	constructor() {
		this.types = [];
		this.row = -1;
		this.col = -1;
	}
	// Point makers
	static neutral() {
		var point = new VagabondBoardPoint();
		point.addType(NEUTRAL);

		return point;
	}
	static gate() {
		var point = new VagabondBoardPoint();
		point.addType(GATE);

		return point;
	}
	static red() {
		var point = new VagabondBoardPoint();
		point.addType(RED);

		return point;
	}
	static white() {
		var point = new VagabondBoardPoint();
		point.addType(WHITE);

		return point;
	}
	static redWhite() {
		var point = new VagabondBoardPoint();
		point.addType(RED);
		point.addType(WHITE);

		return point;
	}
	static redWhiteNeutral() {
		var point = new VagabondBoardPoint();
		point.addType(RED);
		point.addType(WHITE);
		point.addType(NEUTRAL);

		return point;
	}
	static redNeutral() {
		var point = new VagabondBoardPoint();
		point.addType(RED);
		point.addType(NEUTRAL);

		return point;
	}
	static whiteNeutral() {
		var point = new VagabondBoardPoint();
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
	getCopy() {
		var copy = new VagabondBoardPoint();

		copy.types = copyArray(this.types);

		copy.row = this.row;
		copy.col = this.col;

		if (this.hasTile()) {
			copy.tile = this.tile.getCopy();
		}

		return copy;
	}
	getBgIoState() {
		return {
			types: this.types,
			// row: this.row,
			// col: this.col,
			tile: this.tile.getBgIoState()
		};
	}
}

























