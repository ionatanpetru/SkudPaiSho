// Trifle Notation

// --------------------------------------------- // 

import { BRAND_NEW } from '../PaiShoMain';
import {
  DEPLOY,
  DRAW_ACCEPT,
  DRAW_OFFER,
  GUEST,
  HOST,
  MOVE,
  NotationPoint,
  TEAM_SELECTION,
} from '../CommonNotationObjects';
import { debug } from '../GameData';

export var OldTrifleNotationMove = function(text) {
	this.fullMoveText = text;
	this.analyzeMove();
}

OldTrifleNotationMove.prototype.analyzeMove = function() {
	this.valid = true;

	// Get move number
	var parts = this.fullMoveText.split(".");

	debug(parts);

	var moveNumAndPlayer = parts[0];

	this.moveNum = parseInt(moveNumAndPlayer.slice(0, -1));
    this.playerCode = moveNumAndPlayer.charAt(moveNumAndPlayer.length - 1);

    // Get player (Guest or Host)
	if (this.playerCode === 'G') {
		this.player = GUEST;
	} else if (this.playerCode === 'H') {
		this.player = HOST;
	}

	var moveText = parts[1];

	// If no move text, ignore and move on to next
	if (!moveText) {
		return;
	}

	// If starts with a ( then it's MOVE
	var char0 = moveText.charAt(0);
	if (char0 === '(') {
		this.moveType = MOVE;
	} else if (moveText.startsWith(DRAW_ACCEPT)) {	// If move is accepting a draw
		this.moveType = DRAW_ACCEPT;
	} else if (this.moveNum < 1) {
		this.moveType = TEAM_SELECTION;
		debug("they done selected a teeeem");
 	} else {
		this.moveType = DEPLOY;
	}

	if (this.moveType === TEAM_SELECTION) {
		this.teamTileCodes = moveText.split(',');
	} else if (this.moveType === DEPLOY) {
		var openParenIndex = moveText.indexOf('(');
		if (openParenIndex > 0) {
			// debug("parens checks out");
		} else {
			debug("Failure to plant");
			this.valid = false;
		}

		this.tileType = moveText.substring(0, openParenIndex);

		if (moveText.endsWith(')') || moveText.endsWith(')' + DRAW_OFFER)) {
			this.endPoint = new NotationPoint(moveText.substring(moveText.indexOf('(')+1, moveText.indexOf(')')));
		} else {
			this.valid = false;
		}
	} else if (this.moveType === MOVE) {
		// Get the two points from string like: (-8,0)-(-6,3)
		var parts = moveText.substring(moveText.indexOf('(')+1).split(')-(');
		this.startPoint = new NotationPoint(parts[0]);
		this.endPoint = new NotationPoint(parts[1].substring(0, parts[1].indexOf(')')));
	}

	this.offerDraw = moveText.endsWith(DRAW_OFFER);
};

OldTrifleNotationMove.prototype.isValidNotation = function() {
	return this.valid;
};

OldTrifleNotationMove.prototype.equals = function(otherMove) {
	return this.fullMoveText === otherMove.fullMoveText;
};



// --------------------------------------- //

export var OldTrifleNotationBuilder = function() {
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

OldTrifleNotationBuilder.prototype.getNotationMove = function(moveNum, player) {
	var notationLine = moveNum + player.charAt(0) + ".";
	if (this.moveType === TEAM_SELECTION) {
		notationLine += this.teamSelection;
	} else if (this.moveType === MOVE) {
		notationLine += "(" + this.startPoint.pointText + ")-(" + this.endPoint.pointText + ")";
	} else if (this.moveType === DEPLOY) {
		notationLine += this.tileType + "(" + this.endPoint.pointText + ")";
	} else if (this.moveType === DRAW_ACCEPT) {
		notationLine += DRAW_ACCEPT;
	}

	if (this.offerDraw) {
		notationLine += DRAW_OFFER;
	}
	
	return new OldTrifleNotationMove(notationLine);
};

// --------------------------------------- //



export var OldTrifleGameNotation = function() {
	this.notationText = "";
	this.moves = [];
}

OldTrifleGameNotation.prototype.setNotationText = function(text) {
	this.notationText = text;
	this.loadMoves();
};

OldTrifleGameNotation.prototype.addNotationLine = function(text) {
	this.notationText += ";" + text.trim();
	this.loadMoves();
};

OldTrifleGameNotation.prototype.addMove = function(move) {
	if (this.notationText) {
		this.notationText += ";" + move.fullMoveText;
	} else {
		this.notationText = move.fullMoveText;
	}
	this.loadMoves();
};

OldTrifleGameNotation.prototype.removeLastMove = function() {
	this.notationText = this.notationText.substring(0, this.notationText.lastIndexOf(";"));
	this.loadMoves();
};

OldTrifleGameNotation.prototype.getPlayerMoveNum = function() {
	var moveNum = 0;
	var lastMove = this.moves[this.moves.length-1];

	if (lastMove) {
		moveNum = lastMove.moveNum;
		if (lastMove.player === GUEST) {
			moveNum++;
		}
	}
	return moveNum;
};

OldTrifleGameNotation.prototype.getNotationMoveFromBuilder = function(builder) {
	var moveNum = 0;
	var player = HOST;

	var lastMove = this.moves[this.moves.length-1];

	if (lastMove) {
		moveNum = lastMove.moveNum;
		if (lastMove.player === GUEST) {
			moveNum++;
		} else {
			player = GUEST;
		}
	}

	return builder.getNotationMove(moveNum, player);
};

OldTrifleGameNotation.prototype.loadMoves = function() {
	this.moves = [];
	var lines = [];
	if (this.notationText) {
		if (this.notationText.includes(';')) {
			lines = this.notationText.split(";");
		} else {
			lines = [this.notationText];
		}
	}

	var self = this;
	var lastPlayer = GUEST;
	lines.forEach(function(line) {
		var move = new OldTrifleNotationMove(line);
		if (move.isValidNotation() && move.player !== lastPlayer) {
			self.moves.push(move);
			lastPlayer = move.player;
		} else {
			debug("the player check is broken?");
		}
	});
};

OldTrifleGameNotation.prototype.getNotationHtml = function() {
	var lines = [];
	if (this.notationText) {
		if (this.notationText.includes(';')) {
			lines = this.notationText.split(";");
		} else {
			lines = [this.notationText];
		}
	}

	var notationHtml = "";

	lines.forEach(function (line) {
		notationHtml += line + "<br />";
	});

	return notationHtml;
};

OldTrifleGameNotation.prototype.notationTextForUrl = function() {
	var str = this.notationText;
	return str;
};

OldTrifleGameNotation.prototype.getNotationForEmail = function() {
	var lines = [];
	if (this.notationText) {
		if (this.notationText.includes(';')) {
			lines = this.notationText.split(";");
		} else {
			lines = [this.notationText];
		}
	}

	var notationHtml = "";

	lines.forEach(function (line) {
		notationHtml += line + "[BR]";
	});

	return notationHtml;
};

OldTrifleGameNotation.prototype.getLastMoveText = function() {
	return this.moves[this.moves.length - 1].fullMoveText;
};

OldTrifleGameNotation.prototype.getLastMoveNumber = function() {
	return this.moves[this.moves.length - 1].moveNum;
};

OldTrifleGameNotation.prototype.lastMoveHasDrawOffer = function() {
	return this.moves[this.moves.length - 1] 
		&& this.moves[this.moves.length - 1].offerDraw;
};


