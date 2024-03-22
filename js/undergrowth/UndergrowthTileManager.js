// Tile Manager

import { GUEST } from '../CommonNotationObjects';
import { UNDERGROWTH_SIMPLE, gameOptionEnabled } from '../GameOptions';
import { UndergrowthTile } from './UndergrowthTile';
import { copyArray, debug } from '../GameData';
import { guestPlayerCode } from '../pai-sho-common/PaiShoPlayerHelp';

export function UndergrowthTileManager(forActuating) {
	if (forActuating) {
		this.hostTiles = this.loadOneOfEach('H');
		this.guestTiles = this.loadOneOfEach('G');
	} else {
		this.hostTiles = this.loadTileSet('H');
		this.guestTiles = this.loadTileSet('G');
	}
}

UndergrowthTileManager.prototype.loadTileSet = function(ownerCode) {
	return this.loadPlayerTileSet(ownerCode, false, true);
};

UndergrowthTileManager.prototype.loadOneOfEach = function(ownerCode) {
	var tiles = [];

	var simplicity = gameOptionEnabled(UNDERGROWTH_SIMPLE);

	tiles.push(new UndergrowthTile("R3", ownerCode, simplicity));
	tiles.push(new UndergrowthTile("R4", ownerCode, simplicity));
	tiles.push(new UndergrowthTile("R5", ownerCode, simplicity));
	tiles.push(new UndergrowthTile("W3", ownerCode, simplicity));
	tiles.push(new UndergrowthTile("W4", ownerCode, simplicity));
	tiles.push(new UndergrowthTile("W5", ownerCode, simplicity));

	tiles.push(new UndergrowthTile('L', ownerCode, simplicity));
	tiles.push(new UndergrowthTile('O', ownerCode, simplicity));

	return tiles;
};

UndergrowthTileManager.prototype.loadPlayerTileSet = function(ownerCode) {
	var tiles = [];

	var simplicity = gameOptionEnabled(UNDERGROWTH_SIMPLE);
	// Basic flower tiles
	for (var i = 0; i < 3; i++) {
		tiles.push(new UndergrowthTile("R3", ownerCode, simplicity));
		tiles.push(new UndergrowthTile("R4", ownerCode, simplicity));
		tiles.push(new UndergrowthTile("R5", ownerCode, simplicity));
		tiles.push(new UndergrowthTile("W3", ownerCode, simplicity));
		tiles.push(new UndergrowthTile("W4", ownerCode, simplicity));
		tiles.push(new UndergrowthTile("W5", ownerCode, simplicity));
	}

	// Special flower tiles
	tiles.push(new UndergrowthTile('L', ownerCode, simplicity));
	tiles.push(new UndergrowthTile('O', ownerCode, simplicity));

	return tiles;
};

UndergrowthTileManager.prototype.noMoreTilesLeft = function() {
	return this.hostTiles.length === 0 && this.guestTiles.length === 0;
};

UndergrowthTileManager.prototype.aPlayerHasNoMoreTilesLeft = function() {
	return this.hostTiles.length === 0 || this.guestTiles.length === 0;
};

UndergrowthTileManager.prototype.playerIsOutOfTiles = function(playerName) {
	return this.getTilePile(playerName).length === 0;
};

UndergrowthTileManager.prototype.getCopy = function() {
	var copy = new UndergrowthTileManager();

	copy.hostTiles = copyArray(this.hostTiles);
	copy.guestTiles = copyArray(this.guestTiles);
	
	return copy;
};

UndergrowthTileManager.prototype.grabTile = function(playerName, tileCode) {
	var tilePile = this.getTilePile(playerName);

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
	}

	return tile;
};

UndergrowthTileManager.prototype.putTileBack = function(tile) {
	var player = tile.ownerName;
	var tilePile = this.getTilePile(player);
	tilePile.push(tile);
};

UndergrowthTileManager.prototype.removeSelectedTileFlags = function() {
	this.hostTiles.forEach(function(tile) {
		tile.selectedFromPile = false;
	});
	this.guestTiles.forEach(function(tile) {
		tile.selectedFromPile = false;
	});
};

UndergrowthTileManager.prototype.peekTile = function(playerCode, tileCode, tileId) {
	var tilePile = this.getTilePile(playerCode);

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

UndergrowthTileManager.prototype.getTilePile = function(playerNameOrCode) {
	var tilePile = this.hostTiles;
	if (playerNameOrCode === GUEST || playerNameOrCode === guestPlayerCode) {
		tilePile = this.guestTiles;
	}
	return tilePile;
};
