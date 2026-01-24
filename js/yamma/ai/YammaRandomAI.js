/* Yamma Random AI */

import { removeRandomFromArray } from '../../GameData';
import { YammaNotationBuilder } from '../YammaGameNotation';

export function YammaRandomAI() {
}

YammaRandomAI.prototype.getName = function() {
	return "Yamma Random AI";
};

YammaRandomAI.prototype.getMessage = function() {
	return "This AI makes moves completely randomly. It places cubes without any strategy.";
};

YammaRandomAI.prototype.setPlayer = function(playerName) {
	this.player = playerName;
};

YammaRandomAI.prototype.getMove = function(game, moveNum) {
	var moves = [];
	var possiblePositions = game.board.getPossibleMoves();

	for (var i = 0; i < possiblePositions.length; i++) {
		var pos = possiblePositions[i];
		var notationBuilder = new YammaNotationBuilder();
		notationBuilder.setPoint(pos.row, pos.col, pos.level);

		var move = notationBuilder.getMove(this.player);
		if (move) {
			moves.push(move);
		}
	}

	return removeRandomFromArray(moves);
};
