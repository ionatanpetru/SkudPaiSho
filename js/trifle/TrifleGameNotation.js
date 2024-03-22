// Trifle Notation

// --------------------------------------------- // 

import { BRAND_NEW, gameController } from '../PaiShoMain';
import { DEPLOY, MOVE, SETUP, TEAM_SELECTION } from '../CommonNotationObjects';
import { debug } from '../GameData';
import {
  getOpponentName,
  getPlayerCodeFromName,
} from '../pai-sho-common/PaiShoPlayerHelp';

export const TrifleNotationBuilderStatus = {
	PROMPTING_FOR_TARGET: "PROMPTING_FOR_TARGET"
};

/* Because it's just json, the NotationMove object here might not be used */
export function TrifleNotationMove(text, promptTargetData) {
	this.fullMoveText = text;
	this.analyzeMove();
	this.promptTargetData = promptTargetData;
}

TrifleNotationMove.prototype.analyzeMove = function() {
	this.valid = true;

	this.moveData = JSON.parse(this.fullMoveText);
};

TrifleNotationMove.prototype.isValidNotation = function() {
	return this.valid;
};

TrifleNotationMove.prototype.equals = function(otherMove) {
	return this.fullMoveText === otherMove.fullMoveText;
};



// --------------------------------------- //

export function TrifleNotationBuilder() {
	// this.moveNum;	// Let's try making this magic
	// this.player;		// Magic
	this.moveType;

	// DEPLOY
	this.tileType;
	this.endPoint;

	// MOVE
	this.startPoint;
	//this.endPoint; // Also used in DEPLOY

	this.status = BRAND_NEW;
}

TrifleNotationBuilder.prototype.getNotationMove = function(moveNum, player) {
	var move = {
		moveNum: moveNum,
		player: player,
		moveType: this.moveType
	};

	if (this.moveType === SETUP) {
		move.setupNum = this.boardSetupNum;
	} if (this.moveType === TEAM_SELECTION) {
		move.teamSelection = this.teamSelection;
	} else if (this.moveType === MOVE) {
		move.startPoint = this.startPoint.pointText;
		move.endPoint = this.endPoint.pointText;
	} else if (this.moveType === DEPLOY) {
		move.tileType = this.tileType;
		move.endPoint = this.endPoint.pointText;
	}

	// if (this.promptTargetData && Object.keys(this.promptTargetData).length > 0) {
	if (this.promptTargetData) {
		move.promptTargetData = this.promptTargetData;
	}

	if (this.offerDraw) {
		move.offerDraw = true;
	}

	// TODO notation cleanup
	if (this.endPointMovementPath) {
		var movementPathNotationPoints = [];
		this.endPointMovementPath.forEach(boardPoint => {
			movementPathNotationPoints.push(boardPoint.getNotationPointString());
		});
		move.endPointMovementPath = movementPathNotationPoints;
	}

	/* Catch all generic move data */
	if (this.moveData) {
		move.moveData = this.moveData;
	}

	return move;
};

// --------------------------------------- //



export function TrifleGameNotation(firstPlayer) {
	this.notationText = "";
	this.moves = [];
	this.firstPlayer = firstPlayer;
	this.secondPlayer = getOpponentName(firstPlayer);
}

TrifleGameNotation.prototype.setNotationText = function(text) {
	this.notationText = text;
	this.loadMoves();
};

TrifleGameNotation.prototype.addMove = function(move) {
	this.moves.push(move);
};

TrifleGameNotation.prototype.removeLastMove = function() {
	var removedMove = this.moves.pop();
	
	debug("Removed Move:");
	debug(removedMove);
};

/* TrifleGameNotation.prototype.getPlayerMoveNum = function() {
	var moveNum = 0;
	var lastMove = this.moves[this.moves.length-1];

	if (lastMove) {
		moveNum = lastMove.moveNum;
		if (lastMove.player === GUEST) {
			moveNum++;
		}
	}
	return moveNum;
}; */	// Can get rid of this?

TrifleGameNotation.prototype.getNotationMoveFromBuilder = function(builder) {
	var moveNum = 0;

	var lastMove = this.moves[this.moves.length-1];

	if (lastMove) {
		moveNum = lastMove.moveNum;
		if (lastMove.player === this.secondPlayer) {
			moveNum++;
		}
	}

	return builder.getNotationMove(moveNum, builder.currentPlayer);
};

TrifleGameNotation.prototype.loadMoves = function() {
	this.moves = [];
	if (this.notationText) {
		this.moves = JSON.parse(this.notationText);

		// this.moves.forEach(move => {
		// 	if (!move.moveType) {
		// 		move.moveType = MOVE;
		// 	}
		// });
	}
};

TrifleGameNotation.prototype.buildSimplifiedNotationString = function(move) {
	if (gameController.buildNotationString) {
		return gameController.buildNotationString(move);
	}

	var playerCode = getPlayerCodeFromName(move.player);
	var moveNum = move.moveNum;

	return moveNum + playerCode + ".¯\\_(ツ)_/¯";
};

TrifleGameNotation.prototype.getNotationHtml = function() {
	var notationHtml = "";

	this.moves.forEach(function(move) {
		notationHtml += this.buildSimplifiedNotationString(move) + "<br />";
	});

	return notationHtml;
};

TrifleGameNotation.prototype.notationTextForUrl = function() {
	// TODO Could remove the 'moveType' field if it is equal to 'MOVE'
	var str = JSON.stringify(this.moves);
	return str;
};

TrifleGameNotation.prototype.getNotationForEmail = function() {
	var notationHtml = "";

	this.moves.forEach((move) => {
		notationHtml += this.buildSimplifiedNotationString(move) + "[BR]";
	});

	return notationHtml;
};

TrifleGameNotation.prototype.getLastMoveText = function() {
	return this.moves[this.moves.length - 1].fullMoveText;
};

TrifleGameNotation.prototype.getLastMoveNumber = function() {
	return this.moves[this.moves.length - 1].moveNum;
};

TrifleGameNotation.prototype.lastMoveHasDrawOffer = function() {
	return this.moves[this.moves.length - 1] 
		&& this.moves[this.moves.length - 1].offerDraw;
};



