/* Nick specific UI interaction logic */

function Nick() {}

Nick.Constants = {
	preferencesKey: "NickPreferencesKey"
};

Nick.Controller = function(gameContainer, isMobile) {
	new Nick.Options();	// Initialize
	Nick.Controller.loadPreferences();
	this.gameContainer = gameContainer;
	this.isMobile = isMobile;
	this.createActuator();

	Nick.TileInfo.initializeTrifleData();
	PaiShoGames.currentTileMetadata = Nick.NickTiles;
	PaiShoGames.currentTileCodes = Nick.TileCodes;
	this.resetGameManager();
	this.resetGameNotation();
	this.resetNotationBuilder();

	this.hostAccentTiles = [];
	this.guestAccentTiles = [];

	this.isPaiShoGame = true;

	this.showDebugInfo = false;
}

Nick.Controller.loadPreferences = function() {
	const preferences = localStorage.getItem(Nick.Constants.preferencesKey);
	if (preferences && preferences.length > 0) {
		try {
			Nick.Preferences = JSON.parse(preferences);
			return
		} catch(error) {
			debug("Error loading Nick preferences");
		}
	}
	Nick.Preferences = {
		customTilesUrl: ""
	};
};

Nick.Controller.prototype.createActuator = function() {
	this.actuator = new Nick.Actuator(this.gameContainer, this.isMobile, isAnimationsOn());
	if (this.theGame) {
		this.theGame.updateActuator(this.actuator);
	}
};

Nick.Controller.prototype.getGameTypeId = function() {
	return GameType.Nick.id;
};

Nick.Controller.prototype.resetGameManager = function() {
	this.theGame = new Nick.GameManager(this.actuator);
};

Nick.Controller.prototype.resetNotationBuilder = function() {
	var offerDraw = false;
	if (this.notationBuilder) {
		offerDraw = this.notationBuilder.offerDraw;
	}
	this.notationBuilder = new Trifle.NotationBuilder();
	this.notationBuilder.promptTargetData = {};
	if (offerDraw) {
		this.notationBuilder.offerDraw = true;
	}
	this.checkingOutOpponentTileOrNotMyTurn = false;

	this.notationBuilder.currentPlayer = this.getCurrentPlayer();
};

Nick.Controller.prototype.undoMoveAllowed = function() {
    return !this.theGame.getWinner()
        && !this.theGame.disableUndo;
};

Nick.Controller.prototype.automaticallySubmitMoveRequired = function() {
    return !this.undoMoveAllowed();
};

Nick.Controller.prototype.resetGameNotation = function() {
	this.gameNotation = this.getNewGameNotation();
};

Nick.Controller.prototype.getNewGameNotation = function() {
	return new Trifle.GameNotation(GUEST);
};

Nick.Controller.getHostTilesContainerDivs = function() {
	return '';
}

Nick.Controller.getGuestTilesContainerDivs = function() {
	return '';
};

Nick.Controller.prototype.callActuate = function() {
	this.theGame.actuate();
};

Nick.Controller.prototype.resetMove = function(skipAnimation) {
	this.notationBuilder.offerDraw = false;
	if (this.notationBuilder.status === BRAND_NEW) {
		// Remove last move
		this.gameNotation.removeLastMove();
	} else if (this.notationBuilder.status === READY_FOR_BONUS) {
		// Just rerun
	}

	rerunAll(null, null, skipAnimation);
};

Nick.Controller.prototype.getDefaultHelpMessageText = function() {
		return '<h4>Nick Pai Sho</h4>'
			+ '<p><strong>Objective</strong></p>'
			+ '<ul>'
			+ '<li>Be the first player to move your White Lotus to the center of the board.</li>'
			+ '</ul>'
			+ '<p><strong>Capturing and movement</strong></p>'
			+ '<ul>'
			+ this.getNickCycleImageTag() + '<li>Capturing follows the Avatar cycle.</li>'
			+ '<li> Each tile can move to any empty surrounding space, and non-Lotus tiles can also jump over friendly tiles. Can be chained.</li>'
			+ '</ul>'
			+ '<p><strong>Important rules</strong></p>'
			+ '<p>White Lotus</p>'
			+ '<ul>'
			+ '<li>The White Lotus is your King. It cannot capture, and when it would be captured, it is instead put in check and must exit check on your turn or you lose.</li>'
			+ '<li>Can move one space in any direction, and cannot jump over other tiles.</li>'
			+ '</ul>'
			+ '<p>The Avatar</p>'
			+ '<ul>'
			+ '<li>The Avatar can capture any tile but can be captured by any tile.</li>'
			+ '<li>If your Avatar is captured, it returns to its starting point if you capture the enemy Avatar.</li>'
			+ '</ul>'
			+ '<p>For additional info, view the rule book <a href="https://skudpaisho.com/site/games/nick-pai-sho/" target="_blank">here</a>.</p>';
};

Nick.Controller.prototype.getNickCycleImageTag = function() {
	return "<img src='images/Nick/" + localStorage.getItem(Nick.Options.tileDesignTypeKey) + ".png' style='width:60%;' />";
};

Nick.Controller.prototype.gameNotBegun = function() {
	return this.gameNotation.moves.length === 0 
		|| (this.gameNotation.moves.length === 1 && this.gameNotation.moves[0].moveType === SETUP);
};

Nick.Controller.prototype.getAdditionalMessage = function() {
	var msg = "";
	
	if (this.gameNotBegun() && !playingOnlineGame()) {
		if (onlinePlayEnabled && gameId < 0 && userIsLoggedIn()) {
			msg += "Click <em>Join Game</em> above to join another player's game. Or, you can start a game that other players can join by clicking <strong>Start Online Game<strong> below.";
		} else {
			msg += "Sign in to enable online gameplay. Or, start playing a local game.";
		}

		msg += getGameOptionsMessageHtml(GameType.Nick.gameOptions);
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

	if (!playingOnlineGame()) {
		// msg += getGameOptionsMessageHtml(GameType.Nick.gameOptions);	// For when there are game options
		if (onlinePlayEnabled && this.gameNotBegun()) {
			msg += "<br /><span class='skipBonus' onClick='gameController.startOnlineGame()'>Start Online Game</span><br />";
		}
	}

	return msg;
};

Nick.Controller.prototype.toggleDebug = function() {
	this.showDebugInfo = !this.showDebugInfo;
	clearMessage();
};

Nick.Controller.prototype.completeSetup = function() {
	// Create initial board setup
	this.addSetupMove();

	// Finish with actuate
	rerunAll();
	this.callActuate();

	setGameTitleText("Nick Pai Sho");
};

Nick.Controller.prototype.addSetupMove = function() {
	this.notationBuilder.moveType = SETUP;
	this.notationBuilder.boardSetupNum = 1;
	var move = this.gameNotation.getNotationMoveFromBuilder(this.notationBuilder);
	this.theGame.runNotationMove(move);
	// Move all set. Add it to the notation!
	this.gameNotation.addMove(move);
};

Nick.Controller.prototype.startOnlineGame = function() {
	this.resetNotationBuilder();
	this.notationBuilder.currentPlayer = HOST;
	this.notationBuilder.moveType = PASS_TURN;

	var move = this.gameNotation.getNotationMoveFromBuilder(this.notationBuilder);
	this.theGame.runNotationMove(move);
	// Move all set. Add it to the notation!
	this.gameNotation.addMove(move);

	createGameIfThatIsOk(GameType.Nick.id);
};

Nick.Controller.prototype.getAdditionalHelpTabDiv = function() {
	var settingsDiv = document.createElement("div");

	var heading = document.createElement("h4");
	heading.innerText = "Nick Preferences:";

	settingsDiv.appendChild(heading);
	settingsDiv.appendChild(Nick.Options.buildTileDesignDropdownDiv("Tile Designs"));

	if (!playingOnlineGame() || !iAmPlayerInCurrentOnlineGame() || getOnlineGameOpponentUsername() === getUsername()) {
		settingsDiv.appendChild(document.createElement("br"));
		settingsDiv.appendChild(Nick.Options.buildToggleViewAsGuestDiv());
	}

	settingsDiv.appendChild(document.createElement("br"));

	if (usernameIsOneOf(["SkudPaiSho"]) || debugOn) {
		var toggleDebugText = "Enable debug Help display";
		if (this.showDebugInfo) {
			toggleDebugText = "Disable debug Help display";
		}
		var toggleDebugSpan = document.createElement("span");
		toggleDebugSpan.classList.add("skipBonus");
		toggleDebugSpan.setAttribute("onclick", "gameController.toggleDebug();");
		toggleDebugSpan.innerText = toggleDebugText;

		settingsDiv.appendChild(toggleDebugSpan);

		settingsDiv.appendChild(document.createElement("br"));
	}

	settingsDiv.appendChild(document.createElement("br"));

	return settingsDiv;
};

Nick.Controller.prototype.toggleViewAsGuest = function() {
	Nick.Options.viewAsGuest = !Nick.Options.viewAsGuest;
	this.createActuator();
	this.callActuate();
	clearMessage();
};

Nick.Controller.prototype.gameHasEndedInDraw = function() {
	return this.theGame.gameHasEndedInDraw;
};

Nick.Controller.prototype.acceptDraw = function() {
	if (myTurn()) {
		this.promptToAcceptDraw = true;
		refreshMessage();
	}
};

Nick.Controller.prototype.confirmAcceptDraw = function() {
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

Nick.Controller.prototype.offerDraw = function() {
	if (myTurn()) {
		this.notationBuilder.offerDraw = true;
		refreshMessage();
	}
};

Nick.Controller.prototype.removeDrawOffer = function() {
	if (myTurn()) {
		this.notationBuilder.offerDraw = false;
		refreshMessage();
	}
};

Nick.Controller.prototype.unplayedTileClicked = function(tileDiv) {
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

	/* if (this.theGame.playersAreSelectingTeams()) {
		var selectedTile = new Nick.Tile(tileCode, playerCode);
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
	} else  */
	if (this.notationBuilder.status === BRAND_NEW) {
		// new Deploy turn
		tile.selectedFromPile = true;

		this.notationBuilder.moveType = DEPLOY;
		this.notationBuilder.tileType = tileCode;
		this.notationBuilder.status = WAITING_FOR_ENDPOINT;

		this.theGame.revealDeployPoints(tile);
	} else if (this.notationBuilder.status === Trifle.NotationBuilderStatus.PROMPTING_FOR_TARGET) {
		if (tile.tileIsSelectable) {
			if (!this.checkingOutOpponentTileOrNotMyTurn && !isInReplay) {
				var sourceTileKey = JSON.stringify(this.notationBuilder.neededPromptTargetInfo.sourceTileKey);
				if (!this.notationBuilder.promptTargetData[sourceTileKey]) {
					this.notationBuilder.promptTargetData[sourceTileKey] = {};
				}
				this.notationBuilder.promptTargetData[sourceTileKey][this.notationBuilder.neededPromptTargetInfo.currentPromptTargetId] = tile.getOwnerCodeIdObject();
				// TODO - Does move require user to choose targets?... 
				var notationBuilderSave = this.notationBuilder;
				this.resetMove(true);
				this.notationBuilder = notationBuilderSave;
				this.completeMove();
			} else {
				this.resetNotationBuilder();
			}
		}
	} else {
		this.theGame.hidePossibleMovePoints();
		this.resetNotationBuilder();
	}
}

Nick.Controller.prototype.pointClicked = function(htmlPoint) {
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
	var currentMovePath = boardPoint.buildMovementPath();

	if (this.notationBuilder.status === BRAND_NEW) {
    	if (boardPoint.hasTile()) {
        	// Prevent non-current player from starting a move (and seeing possible moves)
        	if (boardPoint.tile.ownerName !== getCurrentPlayer() || !myTurn()) {
            	debug("That's not your tile!");
            	this.checkingOutOpponentTileOrNotMyTurn = true;
            	return;
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
				this.notationBuilder.endPointMovementPath = currentMovePath;
				this.completeMove();
			} else {
				this.resetNotationBuilder();
			}
		} else {
			this.theGame.hidePossibleMovePoints();
			this.resetNotationBuilder();
		}
	} else if (this.notationBuilder.status === Trifle.NotationBuilderStatus.PROMPTING_FOR_TARGET) {
		if (boardPoint.isType(POSSIBLE_MOVE)) {
			this.theGame.hidePossibleMovePoints();

			if (!this.checkingOutOpponentTileOrNotMyTurn && !isInReplay) {
				var sourceTileKey = JSON.stringify(this.notationBuilder.neededPromptTargetInfo.sourceTileKey);
				if (!this.notationBuilder.promptTargetData[sourceTileKey]) {
					this.notationBuilder.promptTargetData[sourceTileKey] = {};
				}
				this.notationBuilder.promptTargetData[sourceTileKey][this.notationBuilder.neededPromptTargetInfo.currentPromptTargetId] = new NotationPoint(htmlPoint.getAttribute("name"));
				// TODO - Does move require user to choose targets?... 
				var notationBuilderSave = this.notationBuilder;
				this.resetMove(true);
				this.notationBuilder = notationBuilderSave;
				this.completeMove();
			} else {
				this.resetNotationBuilder();
			}
		} else {
			// this.theGame.hidePossibleMovePoints();
			// this.notationBuilder.status = ?
		}
	}
};

Nick.Controller.prototype.completeMove = function() {
	var move = this.gameNotation.getNotationMoveFromBuilder(this.notationBuilder);
	var skipAnimation = this.notationBuilder.status === Trifle.NotationBuilderStatus.PROMPTING_FOR_TARGET;
	var neededPromptTargetInfo = this.theGame.runNotationMove(move, true, null, skipAnimation);

	if (neededPromptTargetInfo) {
		debug("Prompting user for the rest of the move!");
		this.notationBuilder.status = Trifle.NotationBuilderStatus.PROMPTING_FOR_TARGET;
		this.notationBuilder.neededPromptTargetInfo = neededPromptTargetInfo;
		
		if (neededPromptTargetInfo.sourceAbility.abilityInfo.optional) {
			refreshMessage();
			var abilityTitle = neededPromptTargetInfo.sourceAbility.abilityInfo.title;
			if (!abilityTitle) {
				abilityTitle = neededPromptTargetInfo.sourceAbility.abilityInfo.type;
			}
			showSkipButtonMessage("Skip ability: " + abilityTitle);
		}

		showResetMoveMessage();
	} else {
		this.gameNotation.addMove(move);
		if (playingOnlineGame()) {
			callSubmitMove();
		} else {
			// finalizeMove();
			quickFinalizeMove();
		}
	}
};

Nick.Controller.prototype.skipHarmonyBonus = function() {
	var move = this.gameNotation.getNotationMoveFromBuilder(this.notationBuilder);
	this.gameNotation.addMove(move);
	if (playingOnlineGame()) {
		callSubmitMove();
	} else {
		finalizeMove();
	}
}

Nick.Controller.prototype.getTheMessage = function(tile, ownerName) {
	var message = [];

	var tileCode = tile.code;

	var heading = Trifle.Tile.getTileName(tileCode);

	message.push(Trifle.TileInfo.getReadableDescription(tileCode));

	return {
		heading: heading,
		message: message
	}
}

Nick.Controller.prototype.getTileMessage = function(tileDiv) {
	var divName = tileDiv.getAttribute("name");	// Like: GW5 or HL
	var tileId = parseInt(tileDiv.getAttribute("id"));
	var playerCode = divName.charAt(0);
	var tileCode = divName.substring(1);
	var tile = new Trifle.Tile(tileCode, playerCode);

	var ownerName = HOST;
	if (divName.startsWith('G')) {
		ownerName = GUEST;
	}

	return this.getTheMessage(tile, ownerName);
}

Nick.Controller.prototype.getPointMessage = function(htmlPoint) {
	var npText = htmlPoint.getAttribute("name");

	var notationPoint = new NotationPoint(npText);
	var rowCol = notationPoint.rowAndColumn;
	var boardPoint = this.theGame.board.cells[rowCol.row][rowCol.col];

	if (boardPoint.hasTile()) {
		return this.getTheMessage(boardPoint.tile, boardPoint.tile.ownerName);
	} else if (this.showDebugInfo) {
		var messageLines = this.theGame.buildAbilitySummaryLines();
		return {
			heading: "Active Abilities",
			message: messageLines
		};
	}
}

Nick.Controller.prototype.playAiTurn = function(finalizeMove) {
	// 
};

Nick.Controller.prototype.startAiGame = function(finalizeMove) {
	// 
};

Nick.Controller.prototype.getAiList = function() {
	return [];
}

Nick.Controller.prototype.getCurrentPlayer = function() {
	if (this.gameNotBegun()) {
		return GUEST;
	} /* else if (this.gameNotation.moves.length > 0
			&& this.gameNotation.moves[0].moveType === PASS_TURN) {
		if (currentMoveIndex % 2 === 0) {
			return HOST;
		} else {
			return GUEST;
		}
	}  */
	else {
		var lastPlayer = this.gameNotation.moves[this.gameNotation.moves.length - 1].player;

		if (lastPlayer === HOST) {
			return GUEST;
		} else if (lastPlayer === GUEST) {
			return HOST;
		}
	}
};

Nick.Controller.prototype.cleanup = function() {
	// Nothing to do
};

Nick.Controller.prototype.isSolitaire = function() {
	return false;
};

Nick.Controller.prototype.setGameNotation = function(newGameNotation) {
	this.gameNotation.setNotationText(newGameNotation);
	if (playingOnlineGame() && iAmPlayerInCurrentOnlineGame() && getOnlineGameOpponentUsername() != getUsername()) {
		new Nick.Options();	// To set perspective...
		this.createActuator();
		clearMessage();
	}
};

Nick.Controller.prototype.skipClicked = function() {
	var sourceTileKey = JSON.stringify(this.notationBuilder.neededPromptTargetInfo.sourceTileKey);
	if (!this.notationBuilder.promptTargetData[sourceTileKey]) {
		this.notationBuilder.promptTargetData[sourceTileKey] = {};
	}
	this.notationBuilder.promptTargetData[sourceTileKey].skipped = true;
	var notationBuilderSave = this.notationBuilder;
	this.resetMove();
	this.notationBuilder = notationBuilderSave;
	this.completeMove();
};

/* TODO Find more global way of doing RmbDown,etc methods? */

Nick.Controller.prototype.RmbDown = function(htmlPoint) {
	var npText = htmlPoint.getAttribute("name");

	var notationPoint = new NotationPoint(npText);
	var rowCol = notationPoint.rowAndColumn;
	this.mouseStartPoint = this.theGame.board.cells[rowCol.row][rowCol.col];
}

Nick.Controller.prototype.RmbUp = function(htmlPoint) {
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

Nick.Controller.prototype.buildNotationString = function(move) {
	var playerCode = getPlayerCodeFromName(move.player);
	var moveNum = move.moveNum;

	var moveNotation = moveNum + playerCode + ".";

	if (move.moveType === MOVE) {
		var startRowAndCol = new NotationPoint(move.startPoint).rowAndColumn;
		var endRowAndCol = new NotationPoint(move.endPoint).rowAndColumn;
		moveNotation += "(" + Nick.NotationAdjustmentFunction(startRowAndCol.row, startRowAndCol.col) + ")-";
		moveNotation += "(" + Nick.NotationAdjustmentFunction(endRowAndCol.row, endRowAndCol.col) + ")";

		if (move.promptTargetData) {
			Object.keys(move.promptTargetData).forEach((key, index) => {
				var promptDataEntry = move.promptTargetData[key];
				var keyObject = JSON.parse(key);
				if (promptDataEntry.movedTilePoint && promptDataEntry.movedTileDestinationPoint) {
					var movedTilePointRowAndCol = promptDataEntry.movedTilePoint.rowAndColumn;
					var movedTileDestinationRowAndCol = promptDataEntry.movedTileDestinationPoint.rowAndColumn;
					moveNotation += "+";
					moveNotation += "(" + Nick.NotationAdjustmentFunction(movedTilePointRowAndCol.row, movedTilePointRowAndCol.col) + ")-";
					moveNotation += "(" + Nick.NotationAdjustmentFunction(movedTileDestinationRowAndCol.row, movedTileDestinationRowAndCol.col) + ")";
				} else if (promptDataEntry.chosenCapturedTile) {
					moveNotation += "+" + promptDataEntry.chosenCapturedTile.code;
				} else {
					moveNotation += " Ability?";
				}
			});
		}
	}

	moveNotation = moveNotation;

	return moveNotation;
};

Nick.Controller.prototype.setCustomTileDesignUrl = function(url) {
	Nick.Preferences.customTilesUrl = url;
	localStorage.setItem(Nick.Constants.preferencesKey, JSON.stringify(Nick.Preferences));
	localStorage.setItem(Nick.Options.tileDesignTypeKey, 'custom');
	if (gameController && gameController.callActuate) {
		gameController.callActuate();
	}
};

Nick.Controller.isUsingCustomTileDesigns = function() {
	return localStorage.getItem(Nick.Options.tileDesignTypeKey) === "custom";
};

Nick.Controller.getCustomTileDesignsUrl = function() {
	return Nick.Preferences.customTilesUrl;
};

