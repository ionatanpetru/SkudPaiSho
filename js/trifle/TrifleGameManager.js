// Trifle Game Manager

export function TrifleGameManager(actuator, ignoreActuate, isCopy) {
	this.gameLogText = '';
	this.isCopy = isCopy;

	this.actuator = actuator;

	this.tileManager = new TrifleTileManager();
	this.markingManager = new PaiShoMarkingManager();

	this.setup(ignoreActuate);
}

// Set up the game
TrifleGameManager.prototype.setup = function (ignoreActuate) {

	this.board = new PaiShoGames.Board(this.tileManager);
	this.board.useTrifleTempleRules = true;
	this.board.useBannerCaptureSystem = true;
	this.winners = [];
	this.hostBannerPlayed = false;
	this.guestBannerPlayed = false;

	// Update the actuator
	if (!ignoreActuate) {
		this.actuate();
	}
};

// Sends the updated board to the actuator
TrifleGameManager.prototype.actuate = function () {
	if (this.isCopy) {
		return;
	}
	this.actuator.actuate(this.board, this.tileManager, this.markingManager);
	setGameLogText(this.gameLogText);
};

TrifleGameManager.prototype.runNotationMove = function(move, withActuate) {
	debug("Running Move: " + move.fullMoveText);

	this.board.tickDurationAbilities();

	if (move.moveType === TEAM_SELECTION) {
		var self = this;
		move.teamTileCodes.forEach(function(tileCode){
			var tile = new TrifleTile(tileCode, move.playerCode);
			self.tileManager.addToTeamIfOk(tile);
		});
		this.buildTeamSelectionGameLogText(move);
	} else if (move.moveType === DEPLOY) {
		var tile = this.tileManager.grabTile(move.player, move.tileType);
		this.board.placeTile(tile, move.endPoint);
		this.buildDeployGameLogText(move, tile);

		/* Banner played? Could use this in future, currently in Board. */
		if (TrifleTileInfo.tileIsBanner(PaiShoGames.currentTileMetadata[tile.code])) {
			if (tile.ownerName === HOST) {
				this.hostBannerPlayed = true;
			} else {
				this.guestBannerPlayed = true;
			}
		}
	} else if (move.moveType === MOVE) {
		var moveDetails = this.board.moveTile(move.player, move.startPoint, move.endPoint);
		this.buildMoveGameLogText(move, moveDetails);

		// If tile is capturing a Banner tile, there's a winner
		if (moveDetails.capturedTiles && moveDetails.capturedTiles.length) {
			var self = this;
			moveDetails.capturedTiles.forEach(function(capturedTile) {
				if (capturedTile && TrifleTileInfo.tileIsBanner(PaiShoGames.currentTileMetadata[capturedTile.code])) {
					self.winners.push(getOpponentName(capturedTile.ownerName));
				}
			});
		}
	} else if (move.moveType === DRAW_ACCEPT) {
		this.gameHasEndedInDraw = true;
	}

	if (withActuate) {
		this.actuate();
	}
};

TrifleGameManager.prototype.buildTeamSelectionGameLogText = function(move) {
	this.gameLogText = move.player + " selected their team";
};
TrifleGameManager.prototype.buildDeployGameLogText = function(move, tile) {
	this.gameLogText = move.player + ' placed ' + TrifleTile.getTileName(tile.code) + ' at ' + move.endPoint.pointText;
};
TrifleGameManager.prototype.buildMoveGameLogText = function(move, moveDetails) {
	this.gameLogText = move.player + ' moved ' + TrifleTile.getTileName(moveDetails.movedTile.code) + ' from ' + move.startPoint.pointText + ' to ' + move.endPoint.pointText;
	if (moveDetails.capturedTiles && moveDetails.capturedTiles.length > 0) {
		this.gameLogText += ' and captured ' + getOpponentName(move.player) + '\'s ';// + TrifleTile.getTileName(moveDetails.capturedTile.code);
		var first = true;
		moveDetails.capturedTiles.forEach(function(capturedTile) {
			if (!first) {
				this.gameLogText += ',';
			} else {
				first = false;
			}
			this.gameLogText += TrifleTile.getTileName(capturedTile.code);
		});
	}
};

TrifleGameManager.prototype.playersAreSelectingTeams = function() {
	return this.tileManager.playersAreSelectingTeams();
};

TrifleGameManager.prototype.getPlayerTeamSelectionTileCodeList = function(player) {
	var team = this.tileManager.getPlayerTeam(player);
	var codeList = [];
	team.forEach(function(tile){
		codeList.push(tile.code);
	});
	return codeList.toString();
};

TrifleGameManager.prototype.addTileToTeam = function(tile) {
	var addedOk = this.tileManager.addToTeamIfOk(tile);
	if (addedOk) {
		this.actuate();
	}
	return this.tileManager.playerTeamIsFull(tile.ownerName);
};

TrifleGameManager.prototype.removeTileFromTeam = function(tile) {
	this.tileManager.removeTileFromTeam(tile);
	this.actuate();
};

TrifleGameManager.prototype.hasEnded = function() {
	return this.getWinResultTypeCode() > 0;
};

TrifleGameManager.prototype.revealPossibleMovePoints = function(boardPoint, ignoreActuate) {
	if (!boardPoint.hasTile()) {
		return;
	}
	this.board.setPossibleMovePoints(boardPoint);
	
	if (!ignoreActuate) {
		this.actuate();
	}
};

TrifleGameManager.prototype.hidePossibleMovePoints = function(ignoreActuate) {
	this.board.removePossibleMovePoints();
	this.tileManager.removeSelectedTileFlags();
	if (!ignoreActuate) {
		this.actuate();
	}
};

TrifleGameManager.prototype.revealDeployPoints = function(tile, ignoreActuate) {
	this.board.setDeployPointsPossibleMoves(tile);
	
	if (!ignoreActuate) {
		this.actuate();
	}
};

TrifleGameManager.prototype.getWinner = function() {
	if (this.winners.length === 1) {
		return this.winners[0];
	}
};

TrifleGameManager.prototype.getWinReason = function() {
	return " has captured the opponent's Banner Tile and won the game!";
};

TrifleGameManager.prototype.getWinResultTypeCode = function() {
	if (this.winners.length === 1) {
		return 1;	// Standard win is 1
	} else if (this.gameHasEndedInDraw) {
		return 4;	// Tie/Draw is 4
	}
};

TrifleGameManager.prototype.getCopy = function() {
	var copyGame = new TrifleGameManager(this.actuator, true, true);
	copyGame.board = this.board.getCopy();
	copyGame.tileManager = this.tileManager.getCopy();
	return copyGame;
};
