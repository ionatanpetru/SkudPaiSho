// Tile Manager

import { GUEST, HOST } from '../CommonNotationObjects';
import { GinsengTileCodes } from './GinsengTiles';
import { debug } from '../GameData';
import { TrifleTile } from '../trifle/TrifleTile';

var STANDARD = "Standard";
var RESTRICTED_BY_OPPONENT_TILE_ZONE = "Restricted by opponent tile zone";

export var GinsengTileManager = function() {
	this.hostTiles = this.loadTileSet('H');
	this.guestTiles = this.loadTileSet('G');
	this.capturedTiles = [];
	this.customPiles = {};
};

GinsengTileManager.prototype.loadTileSet = function(ownerCode) {
	var tiles = [];

	tiles.push(new TrifleTile(GinsengTileCodes.WhiteLotus, ownerCode));
	tiles.push(new TrifleTile(GinsengTileCodes.Koi, ownerCode));
	tiles.push(new TrifleTile(GinsengTileCodes.Dragon, ownerCode));
	tiles.push(new TrifleTile(GinsengTileCodes.Badgermole, ownerCode));
	tiles.push(new TrifleTile(GinsengTileCodes.Bison, ownerCode));
	tiles.push(new TrifleTile(GinsengTileCodes.LionTurtle, ownerCode));
	for (var i = 0; i < 2; i++) {
		tiles.push(new TrifleTile(GinsengTileCodes.Wheel, ownerCode));
		tiles.push(new TrifleTile(GinsengTileCodes.Ginseng, ownerCode));
		tiles.push(new TrifleTile(GinsengTileCodes.Orchid, ownerCode));
	}

	return tiles;
};

GinsengTileManager.prototype.grabTile = function(player, tileCode) {
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
	}

	return tile;
};

GinsengTileManager.prototype.grabCapturedTile = function(player, tileCode) {
	var tile;
	for (var i = 0; i < this.capturedTiles.length; i++) {
		if (this.capturedTiles[i].ownerName === player 
				&& this.capturedTiles[i].code === tileCode) {
			var newTileArr = this.capturedTiles.splice(i, 1);
			tile = newTileArr[0];
			break;
		}
	}

	if (!tile) {
		debug("NONE OF THAT TILE FOUND");
	}

	return tile;
};

GinsengTileManager.prototype.peekTile = function(player, tileCode, tileId) {
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
		this.capturedTiles.forEach((capturedTile) => {
			if (capturedTile.id === tileId) {
				tile = capturedTile;
				debug("Found in captured tiles.. that ok?")
			}
		});
	}

	return tile;
};

GinsengTileManager.prototype.removeSelectedTileFlags = function() {
	this.hostTiles.forEach(function(tile) {
		tile.selectedFromPile = false;
	});
	this.guestTiles.forEach(function(tile) {
		tile.selectedFromPile = false;
	});
};

GinsengTileManager.prototype.unselectTiles = function(player) {
	var tilePile = this.getPlayerTilePile(player);

	tilePile.forEach(function(tile) {
		tile.selectedFromPile = false;
	});
}

GinsengTileManager.prototype.putTileBack = function(tile) {
	var player = tile.ownerName;
	var tilePile = this.getPlayerTilePile(player);

	tilePile.push(tile);
};

GinsengTileManager.prototype.addToCapturedTiles = function(tiles) {
	tiles.forEach((tile) => {
		if (tile.moveToPile) {
			this.addToPile(tile, tile.moveToPile);
		} else if ((tile.beingCaptured || tile.beingCapturedByAbility) && !tile.moveToPile) {
			this.capturedTiles.push(tile);
		}
		tile.beingCaptured = null;
		tile.beingCapturedByAbility = null;
		tile.moveToPile = null;
	});
};

GinsengTileManager.prototype.addToPile = function(tile, pileName) {
	if (!this.customPiles[pileName]) {
		this.customPiles[pileName] = [];
	}
	this.customPiles[pileName].push(tile);
};

GinsengTileManager.prototype.getTeamSize = function() {
	return 11;
};

GinsengTileManager.prototype.hostTeamIsFull = function() {
	return this.playerTeamIsFull(HOST);
};

GinsengTileManager.prototype.guestTeamIsFull = function() {
	return this.playerTeamIsFull(GUEST);
};

GinsengTileManager.prototype.playerTeamIsFull = function(player) {
	return this.getPlayerTeam(player).length >= this.getTeamSize();
};

GinsengTileManager.prototype.playersAreSelectingTeams = function() {
	return !this.hostTeamIsFull() || !this.guestTeamIsFull();
};

GinsengTileManager.prototype.getPlayerTeam = function(player) {
	var playerTeam = this.hostTeam;
	if (player === GUEST) {
		playerTeam = this.guestTeam;
	}
	return playerTeam;
};

GinsengTileManager.prototype.getPlayerTilePile = function(player) {
	var tilePile = this.hostTiles;
	if (player === GUEST) {
		tilePile = this.guestTiles;
	}
	return tilePile;
};

GinsengTileManager.prototype.getAllTiles = function() {
	return this.hostTiles.concat(this.guestTiles);
};

GinsengTileManager.prototype.getCopy = function() {
	var copy = new GinsengTileManager();

	// copy this.hostTiles and this.guestTiles

	return copy;
};
