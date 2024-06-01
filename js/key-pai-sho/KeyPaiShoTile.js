/* Key Pai Sho Tile */

import {
  ACCENT_TILE,
  BAMBOO,
  BASIC_FLOWER,
  BOAT,
  KNOTWEED,
  LION_TURTLE,
  ORCHID,
  POND,
  ROCK,
  SPECIAL_FLOWER,
  WHEEL,
  WHITE_LOTUS,
  debug,
  newOrchidClashRule,
} from '../GameData';
import { GUEST, HOST } from '../CommonNotationObjects';
import { RED, WHITE, tileIdIncrement } from '../skud-pai-sho/SkudPaiShoTile';

export const KeyPaiShoTileCodes = {
	Red3: 'R3',
	RedO: 'RO',	// Red "Orthogonal"
	RedD: 'RD',	// Red "Diagonal"
	White3: 'W3',
	WhiteO: 'WO',
	WhiteD: 'WD',
	Lotus: 'LO',
	Orchid: 'OR'
};

export function KeyPaiShoTile(code, ownerCode) {
	this.code = code;
	this.ownerCode = ownerCode;
	if (this.ownerCode === 'G') {
		this.ownerName = GUEST;
	} else if (this.ownerCode === 'H') {
		this.ownerName = HOST;
	} else {
		debug("INCORRECT OWNER CODE");
	}
	this.id = tileIdIncrement();
	this.drained = false;
	this.selectedFromPile = false;

	if (this.code === KeyPaiShoTileCodes.Lotus || this.code === KeyPaiShoTileCodes.Orchid) {
		this.type = SPECIAL_FLOWER;
		this.setSpecialFlowerInfo();
	} else if (this.code.length === 2 && (this.code.includes('R') || this.code.includes('W'))) {
		this.type = BASIC_FLOWER;
		this.basicColorCode = this.code.charAt(0);
		this.basicValue = this.code.charAt(1);
		if (this.basicColorCode === 'R') {
			this.basicColorName = RED;
		} else if (this.basicColorCode === 'W') {
			this.basicColorName = WHITE;
		}
	} else if (this.code === 'R' || this.code === 'W' || this.code === 'K' || this.code === 'B'
				|| this.code === 'P' || this.code === 'M' || this.code === 'T') {
		this.type = ACCENT_TILE;
		this.setAccentInfo();
	} else {
		debug("Error: Unknown tile type");
	}
}

KeyPaiShoTile.prototype.setAccentInfo = function() {
	if (this.code === 'R') {
		this.accentType = ROCK;
	} else if (this.code === 'W') {
		this.accentType = WHEEL;
	} else if (this.code === 'K') {
		this.accentType = KNOTWEED;
	} else if (this.code === 'B') {
		this.accentType = BOAT;
	} else if (this.code === 'P') {
		this.accentType = POND;
	} else if (this.code === 'M') {
		this.accentType = BAMBOO;
	} else if (this.code === 'T') {
		this.accentType = LION_TURTLE;
	}
};

KeyPaiShoTile.prototype.setSpecialFlowerInfo = function() {
	if (this.code === KeyPaiShoTileCodes.Lotus) {
		this.specialFlowerType = WHITE_LOTUS;
	} else if (this.code === KeyPaiShoTileCodes.Orchid) {
		this.specialFlowerType = ORCHID;
	}
};

KeyPaiShoTile.prototype.getConsoleDisplay = function() {
	if (!this.drained) {
		return this.ownerCode + "" + this.code;
	} else {
		return "*" + this.code;
	}
};

KeyPaiShoTile.prototype.getImageName = function() {
	return this.ownerCode + "" + this.code;
};

KeyPaiShoTile.prototype.formsHarmonyWith = function(otherTile, surroundsLionTurtle) {
	if (this.type !== BASIC_FLOWER && this.code !== KeyPaiShoTileCodes.Lotus) {
		return false;
	}
	
	if (this.type === BASIC_FLOWER && otherTile.type === BASIC_FLOWER && this.code === otherTile.code) {
		return false;
	}

	if (otherTile.ownerName !== this.ownerName 
		&& !(otherTile.code === KeyPaiShoTileCodes.Lotus || this.code === KeyPaiShoTileCodes.Lotus)) {
		return false;
	}
	return true;
};

KeyPaiShoTile.prototype.clashesWith = function(otherTile) {
	if (newOrchidClashRule) {
		if (this.ownerName !== otherTile.ownerName) {
			if (this.specialFlowerType === ORCHID || otherTile.specialFlowerType === ORCHID) {
				return true;
			}
		}
	}

	return (this.type === BASIC_FLOWER && otherTile.type === BASIC_FLOWER 
		&& this.basicColorCode !== otherTile.basicColorCode 
		&& this.basicValue === otherTile.basicValue);
};

KeyPaiShoTile.prototype.getMoveDistance = function() {
	if (this.type === BASIC_FLOWER) {
		if (this.basicValue === '3') {
			return 3;
		} else {
			return 5
		}
	} else if (this.code === KeyPaiShoTileCodes.Lotus) {
		return 2;
	} else if (this.code === KeyPaiShoTileCodes.Orchid) {
		return 1;
	}
	return 0;
};

KeyPaiShoTile.prototype.getHarmonyDistance = function() {
	if (this.type === BASIC_FLOWER) {
		return this.getMoveDistance();
	} else if (this.code === KeyPaiShoTileCodes.Lotus) {
		return 20;
	}
};

KeyPaiShoTile.prototype.hasOrthogonalMovement = function() {
	if (this.type === BASIC_FLOWER) {
		return this.basicValue === '3' || this.basicValue === 'O';
	} else {
		return this.code === KeyPaiShoTileCodes.Lotus;
	}
};

KeyPaiShoTile.prototype.hasDiagonalMovement = function() {
	if (this.type === BASIC_FLOWER) {
		return this.basicValue === '3' || this.basicValue === 'D';
	} else {
		return this.code === KeyPaiShoTileCodes.Lotus;
	}
};

KeyPaiShoTile.prototype.getMovementDirectionWording = function() {
	var directionWording = "";
	if (this.hasOrthogonalMovement()) {
		directionWording += "Horizontally/Vertically";
	}
	if (this.hasDiagonalMovement()) {
		if (directionWording.length > 1) {
			directionWording += " and ";
		}
		directionWording += "Diagonally";
	}
	return directionWording;
};

KeyPaiShoTile.prototype.movementMustPreserveDirection = function() {
	if (this.code === KeyPaiShoTileCodes.Lotus) {
		return false;
	} else {
		return true;
	}
};

KeyPaiShoTile.prototype.drain = function() {
	if (this.type === BASIC_FLOWER) {
		this.drained = true;
	}
};

KeyPaiShoTile.prototype.restore = function() {
	this.drained = false;
};

KeyPaiShoTile.prototype.getName = function() {
	return KeyPaiShoTile.getTileName(this.code);
};

KeyPaiShoTile.prototype.getCopy = function() {
	return new KeyPaiShoTile(this.code, this.ownerCode);
};


KeyPaiShoTile.getTileName = function(tileCode) {
	var name = "";
	
	if (tileCode.length > 1) {
		var colorCode = tileCode.charAt(0);
		var tileNum = tileCode.charAt(1);

		if (colorCode === 'R') {
			if (tileNum === '3') {
				name = "Rose";
			} else if (tileNum === 'O') {
				name = "Chrysanthemum";
			} else if (tileNum === 'D') {
				name = "Rhododendron";
			}
		} else if (colorCode === 'W') {
			if (tileNum === '3') {
				name = "Lily";
			} else if (tileNum === 'O') {
				name = "Jasmine";
			} else if (tileNum === 'D') {
				name = "White Jade";
			}
		}
	} else {
		if (tileCode === 'R') {
			name = "Rock";
		} else if (tileCode === 'W') {
			name = "Wheel";
		} else if (tileCode === 'K') {
			name = "Knotweed";
		} else if (tileCode === 'B') {
			name = "Boat";
		} else if (tileCode === KeyPaiShoTileCodes.Orchid) {
			name = "Orchid";
		} else if (tileCode === KeyPaiShoTileCodes.Lotus) {
			name = "White Lotus";
		} else if (tileCode === 'P') {
			name = "Pond";
		} else if (tileCode === 'M') {
			name = "Bamboo";
		} else if (tileCode === 'T') {
			name = "Lion Turtle";
		}
	}

	return name;
};

KeyPaiShoTile.getClashTileCode = function(tileCode) {
	if (tileCode.length === 2) {
		if (tileCode.startsWith("R")) {
			return "W" + tileCode.charAt(1);
		} else if (tileCode.startsWith("W")) {
			return "R" + tileCode.charAt(1);
		}
	}
};

// Tile.getTileHeading = function(tileCode) {
// 	var heading = Tile.getTileName(tileCode);

// 	if (tileCode.length ===  1) {
// 		return heading;
// 	}

// 	// For Basic Flower Tile, add simple name (like "Red 3")

// 	heading += " (";
// 	if ()
// };






















