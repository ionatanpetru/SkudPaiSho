/**
 * TicTacToeGameManager - Manages game state and turns
 */

import { TicTacToeBoard, MARK } from './TicTacToeBoard';
import { GUEST, HOST } from '../CommonNotationObjects';

export class TicTacToeGameManager {
	constructor(actuator) {
		this.actuator = actuator;
		this.board = new TicTacToeBoard();

		this.currentPlayer = HOST; // HOST plays X, GUEST plays O
		this.winner = null;
		this.winningLine = null;
		this.moveCount = 0;
		this.lastMove = null;
		this.isCopy = false;
	}

	actuate() {
		if (this.isCopy) {
			return;
		}
		if (this.actuator) {
			this.actuator.actuate(this.board, this.winner, this.winningLine, this.lastMove);
		}
	}

	getPlayerMark(player) {
		return player === HOST ? MARK.X : MARK.O;
	}

	runNotationMove(move, withActuate) {
		if (this.winner) {
			return; // Game is over
		}

		const mark = this.getPlayerMark(move.player);
		const success = this.board.placeMarkByIndex(move.index, mark);

		if (success) {
			this.lastMove = { index: move.index, row: move.row, col: move.col };
			this.moveCount++;

			// Check for winner
			const result = this.board.checkWinner();
			if (result) {
				this.winner = result.winner === MARK.X ? HOST : GUEST;
				this.winningLine = result.line;
			}
		}

		if (withActuate) {
			this.actuate();
		}
	}

	getWinner() {
		return this.winner;
	}

	getWinReason() {
		if (!this.winner) {
			return "";
		}
		return " got three in a row";
	}

	hasEnded() {
		return this.winner !== null || this.board.isFull();
	}

	isDraw() {
		return this.winner === null && this.board.isFull();
	}

	getPossibleMoves() {
		return this.board.getPossibleMoves();
	}

	getCopy() {
		const copy = new TicTacToeGameManager();
		copy.board = this.board.getCopy();
		copy.currentPlayer = this.currentPlayer;
		copy.winner = this.winner;
		copy.winningLine = this.winningLine ? [...this.winningLine] : null;
		copy.moveCount = this.moveCount;
		copy.lastMove = this.lastMove ? { ...this.lastMove } : null;
		copy.isCopy = true;
		return copy;
	}
}
