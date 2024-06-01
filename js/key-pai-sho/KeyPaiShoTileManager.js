/* Key Pai Sho Tile Manager */

import {
  ACCENT_TILE,
  BASIC_FLOWER,
  SPECIAL_FLOWER,
  copyArray,
  debug,
} from '../GameData';
import { GUEST, HOST } from '../CommonNotationObjects';
import { KeyPaiShoTile, KeyPaiShoTileCodes } from './KeyPaiShoTile';
import {
  NO_EFFECT_TILES,
  OPTION_ANCIENT_OASIS_EXPANSION,
  gameOptionEnabled,
} from '../GameOptions';
import {
  getPlayerCodeFromName,
  hostPlayerCode,
} from '../pai-sho-common/PaiShoPlayerHelp';

export function KeyPaiShoTileManager(forActuating) {
	if (forActuating) {
		this.hostTiles = this.loadOneOfEach('H');
		this.guestTiles = this.loadOneOfEach('G');
		return;
	}
	this.hostTiles = this.loadTileSet('H');
	this.guestTiles = this.loadTileSet('G');

	/* Used to have 2 of each Ancient Oasis tile available, but now just one.
	This is to support old games if someone chose two of something. */
	this.additionalAncientOasisCount = 0;
}

KeyPaiShoTileManager.prototype.loadTileSet = function(ownerCode) {
	var tiles = [];

	if (!gameOptionEnabled(NO_EFFECT_TILES)) {
		// 1 of each accent tile
		tiles.push(new KeyPaiShoTile('R', ownerCode));
		tiles.push(new KeyPaiShoTile('W', ownerCode));
		tiles.push(new KeyPaiShoTile('K', ownerCode));
		tiles.push(new KeyPaiShoTile('B', ownerCode));

		// 1 of each special flower
		// tiles.push(new KeyPaiShoTile(KeyPaiShoTileCodes.Lotus, ownerCode));
		tiles.push(new KeyPaiShoTile(KeyPaiShoTileCodes.Orchid, ownerCode));

		tiles.forEach(function(tile) {
			tile.selectedFromPile = true;
		});
	}

	/* Keep the next line to test White Lotus */
	tiles.push(new KeyPaiShoTile(KeyPaiShoTileCodes.Lotus, ownerCode));

	// 3 of each basic flower
	for (var i = 0; i < 3; i++) {
		tiles.push(new KeyPaiShoTile(KeyPaiShoTileCodes.Red3, ownerCode));
		tiles.push(new KeyPaiShoTile(KeyPaiShoTileCodes.RedO, ownerCode));
		tiles.push(new KeyPaiShoTile(KeyPaiShoTileCodes.RedD, ownerCode));
		tiles.push(new KeyPaiShoTile(KeyPaiShoTileCodes.White3, ownerCode));
		tiles.push(new KeyPaiShoTile(KeyPaiShoTileCodes.WhiteO, ownerCode));
		tiles.push(new KeyPaiShoTile(KeyPaiShoTileCodes.WhiteD, ownerCode));
	}

	return tiles;
};

KeyPaiShoTileManager.prototype.loadSimpleCanonSet = function(ownerCode) {
	var tiles = [];

	// Accent tiles
	for (var i = 0; i < 2; i++) {
		tiles.push(new KeyPaiShoTile('W', ownerCode));
	}

	tiles.forEach(function(tile) {
		tile.selectedFromPile = true;
	});

	// Basic flowers
	for (var i = 0; i < 6; i++) {
		tiles.push(new KeyPaiShoTile("R3", ownerCode));
		tiles.push(new KeyPaiShoTile("W5", ownerCode));
	}

	// Special flowers
	tiles.push(new KeyPaiShoTile('L', ownerCode));
	tiles.push(new KeyPaiShoTile('O', ownerCode));

	return tiles;
};

KeyPaiShoTileManager.prototype.loadOneOfEach = function(ownerCode) {
	var tiles = [];

	tiles.push(new KeyPaiShoTile('R', ownerCode));
	tiles.push(new KeyPaiShoTile('W', ownerCode));
	tiles.push(new KeyPaiShoTile('K', ownerCode));
	tiles.push(new KeyPaiShoTile('B', ownerCode));

	if (gameOptionEnabled(OPTION_ANCIENT_OASIS_EXPANSION)) {
		tiles.push(new KeyPaiShoTile('P', ownerCode));
		tiles.push(new KeyPaiShoTile('M', ownerCode));
		tiles.push(new KeyPaiShoTile('T', ownerCode));
	}

	tiles.push(new KeyPaiShoTile(KeyPaiShoTileCodes.Red3, ownerCode));
	tiles.push(new KeyPaiShoTile(KeyPaiShoTileCodes.RedO, ownerCode));
	tiles.push(new KeyPaiShoTile(KeyPaiShoTileCodes.RedD, ownerCode));
	tiles.push(new KeyPaiShoTile(KeyPaiShoTileCodes.White3, ownerCode));
	tiles.push(new KeyPaiShoTile(KeyPaiShoTileCodes.WhiteO, ownerCode));
	tiles.push(new KeyPaiShoTile(KeyPaiShoTileCodes.WhiteD, ownerCode));

	tiles.push(new KeyPaiShoTile(KeyPaiShoTileCodes.Lotus, ownerCode));
	tiles.push(new KeyPaiShoTile(KeyPaiShoTileCodes.Orchid, ownerCode));

	return tiles;
};

KeyPaiShoTileManager.prototype.grabTile = function(player, tileCode) {
	var tilePile = this.hostTiles;
	if (player === GUEST) {
		tilePile = this.guestTiles;
	}

	var tile;
	for (var i = 0; i < tilePile.length; i++) {
		if (tilePile[i].code === tileCode) {
			var newTileArr = tilePile.splice(i, 1);
			tile = newTileArr[0];
			break;
		}
	}

	if (!tile) {
		debug("NONE OF THAT TILE FOUND");
		/* Secretly allow 3 additional Ancient Oasis tiles to be selected */
		if (this.additionalAncientOasisCount < 3) {
			var oasisTileCodes = ['M','P','T'];
			if (oasisTileCodes.includes(tileCode)) {
				this.additionalAncientOasisCount++;
				tile = new KeyPaiShoTile(tileCode, getPlayerCodeFromName(player));
			}
		}
	}

	return tile;
};

KeyPaiShoTileManager.prototype.numberOfAccentTilesPerPlayerSet = function() {
	var tileSet = this.loadTileSet(hostPlayerCode);
	var accentTileCount = 0;
	for (var i = 0; i < tileSet.length; i++) {
		if (tileSet[i].type === ACCENT_TILE) {
			accentTileCount++;
		}
	}
	return accentTileCount;
};

KeyPaiShoTileManager.prototype.peekTile = function(player, tileCode, tileId) {
	var tilePile = this.hostTiles;
	if (player === GUEST) {
		tilePile = this.guestTiles;
	}

	var tile;
	if (tileId) {
		for (var i = 0; i < tilePile.length; i++) {
			if (tilePile[i].id === tileId) {
				return tilePile[i];
			}
		}
	}

	for (var i = 0; i < tilePile.length; i++) {
		if (tilePile[i].code === tileCode) {
			tile = tilePile[i];
			break;
		}
	}

	if (!tile) {
		debug("NONE OF THAT TILE FOUND");
	}

	return tile;
};

KeyPaiShoTileManager.prototype.removeSelectedTileFlags = function() {
	this.hostTiles.forEach(function(tile) {
		tile.selectedFromPile = false;
	});
	this.guestTiles.forEach(function(tile) {
		tile.selectedFromPile = false;
	});
};

KeyPaiShoTileManager.prototype.unselectTiles = function(player) {
	var tilePile = this.hostTiles;
	if (player === GUEST) {
		tilePile = this.guestTiles;
	}

	tilePile.forEach(function(tile) {
		tile.selectedFromPile = false;
	});
}

KeyPaiShoTileManager.prototype.putTileBack = function(tile) {
	var player = tile.ownerName;
	var tilePile = this.hostTiles;
	if (player === GUEST) {
		tilePile = this.guestTiles;
	}

	tilePile.push(tile);
};

KeyPaiShoTileManager.prototype.aPlayerIsOutOfBasicFlowerTiles = function() {
	// Check Host
	var hostHasBasic = false;
	for (var i = 0; i < this.hostTiles.length; i++) {
		if (this.hostTiles[i].type === BASIC_FLOWER) {
			hostHasBasic = true;
			break;
		}
	}

	var guestHasBasic = false;
	for (var i = 0; i < this.guestTiles.length; i++) {
		if (this.guestTiles[i].type === BASIC_FLOWER) {
			guestHasBasic = true;
			break;
		}
	}

	if (!hostHasBasic && guestHasBasic) {
		return HOST;
	} else if (!guestHasBasic && hostHasBasic) {
		return GUEST;
	} else if (!guestHasBasic && !hostHasBasic) {
		return "BOTH PLAYERS";
	}
};

KeyPaiShoTileManager.prototype.getPlayerWithMoreAccentTiles = function() {
	var hostCount = 0;
	for (var i = 0; i < this.hostTiles.length; i++) {
		if (this.hostTiles[i].type === ACCENT_TILE) {
			hostCount++;
		}
	}

	var guestCount = 0;
	for (var i = 0; i < this.guestTiles.length; i++) {
		if (this.guestTiles[i].type === ACCENT_TILE) {
			guestCount++;
		}
	}

	if (hostCount > guestCount) {
		return HOST;
	} else if (guestCount > hostCount) {
		return GUEST;
	}
};

KeyPaiShoTileManager.prototype.playerHasBothSpecialTilesRemaining = function(player) {
	var tilePile = this.hostTiles;
	if (player === GUEST) {
		tilePile = this.guestTiles;
	}

	var specialTileCount = 0;

	tilePile.forEach(function(tile) {
		if (tile.type === SPECIAL_FLOWER) {
			specialTileCount++;
		}
	});

	return specialTileCount > 1;
};

KeyPaiShoTileManager.prototype.getCopy = function() {
	var copy = new KeyPaiShoTileManager();

	// copy this.hostTiles and this.guestTiles
	copy.hostTiles = copyArray(this.hostTiles);
	copy.guestTiles = copyArray(this.guestTiles);
	
	return copy;
};

