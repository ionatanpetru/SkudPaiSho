// Tile Manager

var STANDARD = "Standard";
var RESTRICTED_BY_OPPONENT_TILE_ZONE = "Restricted by opponent tile zone";

Nick.TileManager = function() {
	this.hostTiles = this.loadTileSet('H');
	this.guestTiles = this.loadTileSet('G');
	this.capturedTiles = [];
	this.customPiles = {};
};

Nick.TileManager.prototype.loadTileSet = function(ownerCode) {
	var tiles = [];

	tiles.push(new Trifle.Tile(Nick.TileCodes.WhiteLotus, ownerCode));
	tiles.push(new Trifle.Tile(Nick.TileCodes.Avatar, ownerCode));
	
	for (var i = 0; i < 3; i++) {
		tiles.push(new Trifle.Tile(Nick.TileCodes.Air, ownerCode));
		tiles.push(new Trifle.Tile(Nick.TileCodes.Water, ownerCode));
		tiles.push(new Trifle.Tile(Nick.TileCodes.Earth, ownerCode));
		tiles.push(new Trifle.Tile(Nick.TileCodes.Fire, ownerCode));
	}

	return tiles;
};

Nick.TileManager.prototype.grabTile = function(player, tileCode) {
	var tilePile = this.hostTiles;
	if (player === GUEST) {
		tilePile = this.guestTiles;
	}

	var tile;
	for (var i = 0; i < tilePile.length; i++) {
		if (tilePile[i].code === tileCode) {
			newTileArr = tilePile.splice(i, 1);
			tile = newTileArr[0];
			break;
		}
	}

	if (!tile) {
		debug("NONE OF THAT TILE FOUND");
	}

	return tile;
};

Nick.TileManager.prototype.grabCapturedTile = function(player, tileCode) {
	var tile;
	for (var i = 0; i < this.capturedTiles.length; i++) {
		if (this.capturedTiles[i].ownerName === player 
				&& this.capturedTiles[i].code === tileCode) {
			newTileArr = this.capturedTiles.splice(i, 1);
			tile = newTileArr[0];
			break;
		}
	}

	if (!tile) {
		debug("NONE OF THAT TILE FOUND");
	}

	return tile;
};

Nick.TileManager.prototype.peekTile = function(player, tileCode, tileId) {
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

Nick.TileManager.prototype.removeSelectedTileFlags = function() {
	this.hostTiles.forEach(function(tile) {
		tile.selectedFromPile = false;
	});
	this.guestTiles.forEach(function(tile) {
		tile.selectedFromPile = false;
	});
};

Nick.TileManager.prototype.unselectTiles = function(player) {
	var tilePile = this.getPlayerTilePile(player);

	tilePile.forEach(function(tile) {
		tile.selectedFromPile = false;
	});
}

Nick.TileManager.prototype.putTileBack = function(tile) {
	var player = tile.ownerName;
	var tilePile = this.getPlayerTilePile(player);

	tilePile.push(tile);
};

Nick.TileManager.prototype.addToCapturedTiles = function(tiles) {
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

Nick.TileManager.prototype.addToPile = function(tile, pileName) {
	if (!this.customPiles[pileName]) {
		this.customPiles[pileName] = [];
	}
	this.customPiles[pileName].push(tile);
};

Nick.TileManager.prototype.getTeamSize = function() {
	return 11;
};

Nick.TileManager.prototype.hostTeamIsFull = function() {
	return this.playerTeamIsFull(HOST);
};

Nick.TileManager.prototype.guestTeamIsFull = function() {
	return this.playerTeamIsFull(GUEST);
};

Nick.TileManager.prototype.playerTeamIsFull = function(player) {
	return this.getPlayerTeam(player).length >= this.getTeamSize();
};

Nick.TileManager.prototype.playersAreSelectingTeams = function() {
	return !this.hostTeamIsFull() || !this.guestTeamIsFull();
};

Nick.TileManager.prototype.getPlayerTeam = function(player) {
	var playerTeam = this.hostTeam;
	if (player === GUEST) {
		playerTeam = this.guestTeam;
	}
	return playerTeam;
};

Nick.TileManager.prototype.getPlayerTilePile = function(player) {
	var tilePile = this.hostTiles;
	if (player === GUEST) {
		tilePile = this.guestTiles;
	}
	return tilePile;
};

Nick.TileManager.prototype.getAllTiles = function() {
	return this.hostTiles.concat(this.guestTiles);
};

Nick.TileManager.prototype.getCopy = function() {
	var copy = new Nick.TileManager();

	// copy this.hostTiles and this.guestTiles

	return copy;
};
