/* Tumbleweed Random AI */

import { TumbleweedNotationBuilder } from '../TumbleweedGameNotation';
import { removeRandomFromArray } from '../../PaiShoMain';

export class TumbleweedRandomAIv1 {
	constructor() {
	}

	getName() {
		return "Tumbleweed Random AI";
	}

	getMessage() {
		return "This AI makes moves completely randomly, so you should be able to beat it easily. ";
	}

	setPlayer(playerName) {
		this.player = playerName;
	}

	getMove(game, moveNum) {
		var moves = [];

		game.revealPossibleSettlePoints(this.player, true);
		var endPoints = game.board.getAllPossiblePoints();

		var notationBuilder = new TumbleweedNotationBuilder();
		notationBuilder.passTurn = true;
		var passMove = notationBuilder.getNotationMove(moveNum, this.player);
		moves.push(passMove);

		for (var j = 0; j < endPoints.length; j++) {
			notationBuilder = new TumbleweedNotationBuilder();
			notationBuilder.setDeployPoint(endPoints[j].getNotationPointString());

			var move = notationBuilder.getNotationMove(moveNum, this.player);

			game.hidePossibleSettlePoints(true);

			moves.push(move);
		}

		return removeRandomFromArray(moves);
	}
}
