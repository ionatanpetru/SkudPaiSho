/**
 * HexGameManager - Manages game state and turns for Hex
 */

import { HexBoard, CELL } from './HexBoard';
import { GUEST, HOST } from '../CommonNotationObjects';

export class HexGameManager {
	constructor(actuator) {
		this.actuator = actuator;
		this.board = new HexBoard(11); // Standard 11x11 board
		this.winner = null;
		this.winningPath = [];
		this.moveCount = 0;
		this.lastMove = null;
		this.isCopy = false;
	}

	actuate() {
		if (this.isCopy) return;
		if (this.actuator) {
			this.actuator.actuate(this.board, this.winner, this.winningPath, this.lastMove);
		}
	}

	getPlayerColor(player) {
		return player === HOST ? CELL.RED : CELL.BLUE;
	}

	runNotationMove(move, withActuate = true) {
		if (this.winner) {
			return; // Game is over
		}

		const color = this.getPlayerColor(move.player);
		const success = this.board.placeStone(move.row, move.col, color);

		if (success) {
			this.lastMove = { row: move.row, col: move.col };
			this.moveCount++;

			// Check for winner
			const winner = this.board.checkWinner();
			if (winner) {
				this.winner = winner === CELL.RED ? HOST : GUEST;
				this.winningPath = this.board.getWinningPath(winner);
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
		if (!this.winner) return '';

		if (this.winner === HOST) {
			return ' connected top to bottom';
		} else {
			return ' connected left to right';
		}
	}

	hasEnded() {
		return this.winner !== null;
		// Note: Hex cannot end in a draw - one player always wins
	}

	getPossibleMoves() {
		return this.board.getPossibleMoves();
	}

	getCopy() {
		const copy = new HexGameManager();
		copy.board = this.board.getCopy();
		copy.winner = this.winner;
		copy.winningPath = [...this.winningPath];
		copy.moveCount = this.moveCount;
		copy.lastMove = this.lastMove ? { ...this.lastMove } : null;
		copy.isCopy = true;
		return copy;
	}
}
