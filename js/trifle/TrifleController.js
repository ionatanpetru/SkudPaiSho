/* Trifle specific UI interaction logic */

import {
  BRAND_NEW,
  GameType,
  READY_FOR_BONUS,
  WAITING_FOR_ENDPOINT,
  callSubmitMove,
  createGameIfThatIsOk,
  currentMoveIndex,
  finalizeMove,
  gameId,
  getCurrentPlayer,
  getGameOptionsMessageHtml,
  isInReplay,
  myTurn,
  onlinePlayEnabled,
  playingOnlineGame,
  refreshMessage,
  rerunAll,
  userIsLoggedIn,
} from '../PaiShoMain';
import {
  DEPLOY,
  DRAW_ACCEPT,
  GUEST,
  HOST,
  MOVE,
  NotationPoint,
  TEAM_SELECTION,
} from '../CommonNotationObjects';
import {
  OldTrifleGameNotation,
  OldTrifleNotationBuilder,
} from './OldTrifleGameNotation';
import { POSSIBLE_MOVE } from '../skud-pai-sho/SkudPaiShoBoardPoint';
import { TrifleActuator } from './TrifleActuator';
import { TrifleTileCodes, defineTrifleTiles } from './TrifleTiles';
import { TrifleTileInfo, TrifleTiles } from './TrifleTileInfo';
import { debug } from '../GameData';
import {
  setCurrentTileCodes,
  setCurrentTileMetadata
} from './PaiShoGamesTileMetadata';

export function TrifleController(gameContainer, isMobile) {
	this.actuator = new TrifleActuator(gameContainer, isMobile);

	TrifleTileInfo.initializeTrifleData();
	defineTrifleTiles();
	setCurrentTileMetadata(TrifleTiles);
	setCurrentTileCodes(TrifleTileCodes);
	this.resetGameManager();
	this.resetNotationBuilder();
	this.resetGameNotation();

	this.hostAccentTiles = [];
	this.guestAccentTiles = [];

	this.isInviteOnly = true;
	this.isPaiShoGame = true;
}

TrifleController.prototype.getGameTypeId = function() {
	return GameType.Trifle.id;
};

TrifleController.prototype.resetGameManager = function() {
	this.theGame = new TrifleGameManager(this.actuator);
};

TrifleController.prototype.resetNotationBuilder = function() {
	var offerDraw = false;
	if (this.notationBuilder) {
		offerDraw = this.notationBuilder.offerDraw;
	}
	this.notationBuilder = new OldTrifleNotationBuilder();
	if (offerDraw) {
		this.notationBuilder.offerDraw = true;
	}
	this.checkingOutOpponentTileOrNotMyTurn = false;
};

TrifleController.prototype.resetGameNotation = function() {
	this.gameNotation = this.getNewGameNotation();
};

TrifleController.prototype.getNewGameNotation = function() {
	return new OldTrifleGameNotation();
};

TrifleController.getHostTilesContainerDivs = function() {
	return '';
}

TrifleController.getGuestTilesContainerDivs = function() {
	return '';
};

TrifleController.prototype.callActuate = function() {
	this.theGame.actuate();
};

TrifleController.prototype.resetMove = function() {
	this.notationBuilder.offerDraw = false;
	if (this.notationBuilder.status === BRAND_NEW) {
		// Remove last move
		this.gameNotation.removeLastMove();
	} else if (this.notationBuilder.status === READY_FOR_BONUS) {
		// Just rerun
	}

	rerunAll();
};

TrifleController.prototype.getDefaultHelpMessageText = function() {
	return "<h4>Trifle</h4> <p> <p>Trifle is inspired by Vagabond Pai Sho, the Pai Sho variant seen in the fanfiction story <a href='https://skudpaisho.com/site/more/fanfiction-recommendations/' target='_blank'>Gambler and Trifle (download here)</a>.</p> <p><strong>You win</strong> if you capture your opponent's Banner tile.</p> <p><strong>On a turn</strong>, you may either deploy a tile or move a tile.</p> <p><strong>You can't capture Flower/Banner tiles</strong> until your Banner has been deployed.<br /> <strong>You can't capture Non-Flower/Banner tiles</strong> until both players' Banner tiles have been deployed.</p> <p><strong>Hover</strong> over any tile to see how it works.</p> </p> <p>Select tiles to learn more or <a href='https://skudpaisho.com/site/games/trifle-pai-sho/' target='_blank'>view the rules</a>.</p>";
};

TrifleController.prototype.getAdditionalMessage = function() {
	var msg = "";
	
	if (this.gameNotation.moves.length === 0) {
		if (onlinePlayEnabled && gameId < 0 && userIsLoggedIn()) {
			msg += "Click <em>Join Game</em> above to join another player's game. Or, you can start a game that other players can join by choosing your team. <br />";
		} else {
			msg += "Sign in to enable online gameplay. Or, start playing a local game by choosing your team.";
		}

		msg += getGameOptionsMessageHtml(GameType.Trifle.gameOptions);
	} else if (!this.theGame.hasEnded() && myTurn()) {
		if (this.gameNotation.lastMoveHasDrawOffer() && this.promptToAcceptDraw) {
			msg += "<br />Are you sure you want to accept the draw offer and end the game?<br />";
			msg += "<span class='skipBonus' onclick='gameController.confirmAcceptDraw();'>Yes, accept draw and end the game</span>";
			msg += "<br /><br />";
		} else if (this.gameNotation.lastMoveHasDrawOffer()) {
			msg += "<br />Your opponent is offering a draw. You may <span class='skipBonus' onclick='gameController.acceptDraw();'>Accept Draw</span> or make a move to refuse the draw offer.<br />";
		} else if (this.notationBuilder.offerDraw) {
			msg += "<br />Your opponent will be able to accept or reject your draw offer once you make your move. Or, you may <span class='skipBonus' onclick='gameController.removeDrawOffer();'>remove your draw offer</span> from this move.";
		} else {
			msg += "<br /><span class='skipBonus' onclick='gameController.offerDraw();'>Offer Draw</span><br />";
		}
	} else if (!myTurn()) {
		if (this.gameNotation.lastMoveHasDrawOffer()) {
			msg += "<br />A draw has been offered.<br />";
		}
	}

	return msg;
};

TrifleController.prototype.gameHasEndedInDraw = function() {
	return this.theGame.gameHasEndedInDraw;
};

TrifleController.prototype.acceptDraw = function() {
	if (myTurn()) {
		this.promptToAcceptDraw = true;
		refreshMessage();
	}
};

TrifleController.prototype.confirmAcceptDraw = function() {
	if (myTurn()) {
		this.resetNotationBuilder();
		this.notationBuilder.moveType = DRAW_ACCEPT;

		var move = this.gameNotation.getNotationMoveFromBuilder(this.notationBuilder);
		this.theGame.runNotationMove(move);
		// Move all set. Add it to the notation!
		this.gameNotation.addMove(move);

		if (playingOnlineGame()) {
			callSubmitMove();
		} else {
			finalizeMove();
		}
	}
};

TrifleController.prototype.offerDraw = function() {
	if (myTurn()) {
		this.notationBuilder.offerDraw = true;
		refreshMessage();
	}
};

TrifleController.prototype.removeDrawOffer = function() {
	if (myTurn()) {
		this.notationBuilder.offerDraw = false;
		refreshMessage();
	}
};

TrifleController.prototype.unplayedTileClicked = function(tileDiv) {
	this.theGame.markingManager.clearMarkings();
	this.callActuate();

	this.promptToAcceptDraw = false;

	if (this.theGame.hasEnded() && this.notationBuilder.status !== READY_FOR_BONUS) {
		return;
	}

	var divName = tileDiv.getAttribute("name");	// Like: GW5 or HL
	var tileId = parseInt(tileDiv.getAttribute("id"));
	var playerCode = divName.charAt(0);
	var tileCode = divName.substring(1);

	var player = GUEST;
	if (playerCode === 'H') {
		player = HOST;
	}

	var tile = this.theGame.tileManager.peekTile(player, tileCode, tileId);

	if ((tile && tile.ownerName !== getCurrentPlayer()) || !myTurn()) {
		this.checkingOutOpponentTileOrNotMyTurn = true;
	}

	if (this.theGame.playersAreSelectingTeams()) {
		var selectedTile = new TrifleTile(tileCode, playerCode);
		if (tileDiv.classList.contains("selectedFromPile")) {
			var teamIsNowFull = this.theGame.addTileToTeam(selectedTile);
			if (teamIsNowFull) {
				this.notationBuilder.moveType = TEAM_SELECTION;
				this.notationBuilder.teamSelection = this.theGame.getPlayerTeamSelectionTileCodeList(player);
				this.completeMove();
			}
		} else if (!this.theGame.tileManager.playerTeamIsFull(selectedTile.ownerName)) {
			// Need to remove from team instead
			this.theGame.removeTileFromTeam(selectedTile);
		}
	} else if (this.notationBuilder.status === BRAND_NEW) {
		// new Deploy turn
		tile.selectedFromPile = true;

		this.notationBuilder.moveType = DEPLOY;
		this.notationBuilder.tileType = tileCode;
		this.notationBuilder.status = WAITING_FOR_ENDPOINT;

		this.theGame.revealDeployPoints(tile);
	} else {
		this.theGame.hidePossibleMovePoints();
		this.resetNotationBuilder();
	}
}

TrifleController.prototype.RmbDown = function(htmlPoint) {
	var npText = htmlPoint.getAttribute("name");

	var notationPoint = new NotationPoint(npText);
	var rowCol = notationPoint.rowAndColumn;
	this.mouseStartPoint = this.theGame.board.cells[rowCol.row][rowCol.col];
}

TrifleController.prototype.RmbUp = function(htmlPoint) {
	var npText = htmlPoint.getAttribute("name");

	var notationPoint = new NotationPoint(npText);
	var rowCol = notationPoint.rowAndColumn;
	var mouseEndPoint = this.theGame.board.cells[rowCol.row][rowCol.col];

	if (mouseEndPoint == this.mouseStartPoint) {
		this.theGame.markingManager.toggleMarkedPoint(mouseEndPoint);
	}
	else if (this.mouseStartPoint) {
		this.theGame.markingManager.toggleMarkedArrow(this.mouseStartPoint, mouseEndPoint);
	}
	this.mouseStartPoint = null;

	this.callActuate();
}

TrifleController.prototype.pointClicked = function(htmlPoint) {
	this.theGame.markingManager.clearMarkings();
	this.callActuate();

	this.promptToAcceptDraw = false;

	if (this.theGame.hasEnded()) {
		return;
	}

	var npText = htmlPoint.getAttribute("name");

	var notationPoint = new NotationPoint(npText);
	var rowCol = notationPoint.rowAndColumn;
	var boardPoint = this.theGame.board.cells[rowCol.row][rowCol.col];

	if (this.notationBuilder.status === BRAND_NEW) {
		if (boardPoint.hasTile()) {
			if (boardPoint.tile.ownerName !== getCurrentPlayer() || !myTurn()) {
				debug("That's not your tile!");
				this.checkingOutOpponentTileOrNotMyTurn = true;
			}

			this.notationBuilder.status = WAITING_FOR_ENDPOINT;
			this.notationBuilder.moveType = MOVE;
			this.notationBuilder.startPoint = new NotationPoint(htmlPoint.getAttribute("name"));

			this.theGame.revealPossibleMovePoints(boardPoint);
		}
	} else if (this.notationBuilder.status === WAITING_FOR_ENDPOINT) {
		if (boardPoint.isType(POSSIBLE_MOVE)) {
			// They're trying to move there! And they can! Exciting!
			// Need the notation!
			this.theGame.hidePossibleMovePoints();

			if (!this.checkingOutOpponentTileOrNotMyTurn && !isInReplay) {
				this.notationBuilder.endPoint = new NotationPoint(htmlPoint.getAttribute("name"));
				this.completeMove();
			} else {
				this.resetNotationBuilder();
			}
		} else {
			this.theGame.hidePossibleMovePoints();
			this.resetNotationBuilder();
		}
	}
};

TrifleController.prototype.completeMove = function() {
	var move = this.gameNotation.getNotationMoveFromBuilder(this.notationBuilder);
	this.theGame.runNotationMove(move);
	this.gameNotation.addMove(move);
	if (onlinePlayEnabled && this.gameNotation.moves.length === 1) {
		createGameIfThatIsOk(this.getGameTypeId());
	} else {
		if (playingOnlineGame()) {
			callSubmitMove();
		} else {
			finalizeMove();
		}
	}
};

TrifleController.prototype.skipHarmonyBonus = function() {
	var move = this.gameNotation.getNotationMoveFromBuilder(this.notationBuilder);
	this.gameNotation.addMove(move);
	if (playingOnlineGame()) {
		callSubmitMove();
	} else {
		finalizeMove();
	}
}

TrifleController.prototype.getTheMessage = function(tile, ownerName) {
	var message = [];

	var tileCode = tile.code;

	var heading = TrifleTile.getTileName(tileCode);

	message.push(TrifleTileInfo.getReadableDescription(tileCode));

	return {
		heading: heading,
		message: message
	}
}

TrifleController.prototype.getTileMessage = function(tileDiv) {
	var divName = tileDiv.getAttribute("name");	// Like: GW5 or HL
	var tileId = parseInt(tileDiv.getAttribute("id"));

	var tile = new TrifleTile(divName.substring(1), divName.charAt(0));

	var ownerName = HOST;
	if (divName.startsWith('G')) {
		ownerName = GUEST;
	}

	return this.getTheMessage(tile, ownerName);
}

TrifleController.prototype.getPointMessage = function(htmlPoint) {
	var npText = htmlPoint.getAttribute("name");

	var notationPoint = new NotationPoint(npText);
	var rowCol = notationPoint.rowAndColumn;
	var boardPoint = this.theGame.board.cells[rowCol.row][rowCol.col];

	if (boardPoint.hasTile()) {
		return this.getTheMessage(boardPoint.tile, boardPoint.tile.ownerName);
	} else {
		return null;
	}
}

TrifleController.prototype.playAiTurn = function(finalizeMove) {
	// 
};

TrifleController.prototype.startAiGame = function(finalizeMove) {
	// 
};

TrifleController.prototype.getAiList = function() {
	return [];
}

TrifleController.prototype.getCurrentPlayer = function() {
	if (currentMoveIndex % 2 === 0) {	// To get right player during replay...
		return HOST;
	} else {
		return GUEST;
	}
};

TrifleController.prototype.cleanup = function() {
	// document.querySelector(".svgContainer").classList.remove("TrifleBoardRotate");
};

TrifleController.prototype.isSolitaire = function() {
	return false;
};

TrifleController.prototype.setGameNotation = function(newGameNotation) {
	this.gameNotation.setNotationText(newGameNotation);
};

