/**
 * TicTacToeGameNotation - Handles move notation for saving/loading games
 */

import { GUEST, HOST } from '../CommonNotationObjects';

export class TicTacToeNotationMove {
	constructor(notation) {
		this.fullNotation = notation;
		this.player = null;
		this.row = 0;
		this.col = 0;
		this.index = 0;

		if (notation) {
			this.parse(notation);
		}
	}

	parse(notation) {
		// Format: "H:row,col" or "G:row,col" (e.g., "H:1,1" for center)
		const parts = notation.split(':');
		if (parts.length !== 2) return;

		this.player = parts[0] === 'H' ? HOST : GUEST;

		const coords = parts[1].split(',');
		if (coords.length === 2) {
			this.row = parseInt(coords[0], 10);
			this.col = parseInt(coords[1], 10);
			this.index = this.row * 3 + this.col;
		}
	}

	toString() {
		const playerCode = this.player === HOST ? 'H' : 'G';
		return `${playerCode}:${this.row},${this.col}`;
	}
}

export class TicTacToeNotationBuilder {
	constructor() {
		this.status = 'BRAND_NEW';
		this.row = null;
		this.col = null;
	}

	setCell(row, col) {
		this.row = row;
		this.col = col;
		this.status = 'READY';
	}

	isReady() {
		return this.status === 'READY' && this.row !== null && this.col !== null;
	}

	getMove(player) {
		if (!this.isReady()) return null;

		const move = new TicTacToeNotationMove();
		move.player = player;
		move.row = this.row;
		move.col = this.col;
		move.index = this.row * 3 + this.col;
		move.fullNotation = move.toString();
		return move;
	}

	reset() {
		this.status = 'BRAND_NEW';
		this.row = null;
		this.col = null;
	}
}

export class TicTacToeGameNotation {
	constructor() {
		this.notationText = '';
		this.moves = [];
	}

	addMove(move) {
		this.moves.push(move);
		this.updateNotationText();
	}

	removeLastMove() {
		if (this.moves.length > 0) {
			this.moves.pop();
			this.updateNotationText();
		}
	}

	updateNotationText() {
		this.notationText = this.moves.map(m => m.toString()).join(';');
	}

	getPlayerMoveNum() {
		return Math.floor(this.moves.length / 2) + 1;
	}

	getNotationMoveFromBuilder(builder, player) {
		return builder.getMove(player);
	}

	setNotationText(text) {
		this.notationText = text || '';
		this.moves = [];

		if (!text || text.trim() === '') {
			return;
		}

		const moveStrings = text.split(';').filter(s => s.trim().length > 0);
		for (const moveStr of moveStrings) {
			const move = new TicTacToeNotationMove(moveStr.trim());
			if (move.player !== null) {
				this.moves.push(move);
			}
		}
	}

	getNotationText() {
		return this.notationText;
	}

	notationTextForUrl() {
		return this.notationText;
	}

	getNotationHtml() {
		if (!this.notationText) {
			return '';
		}

		const lines = this.notationText.includes(';')
			? this.notationText.split(';')
			: [this.notationText];

		return lines.join('<br />');
	}

	getNotationForEmail() {
		if (!this.notationText) {
			return '';
		}

		const lines = this.notationText.includes(';')
			? this.notationText.split(';')
			: [this.notationText];

		return lines.join('[BR]');
	}

	getLastMove() {
		if (this.moves.length === 0) return null;
		return this.moves[this.moves.length - 1];
	}

	getLastMoveText() {
		const lastMove = this.getLastMove();
		return lastMove ? lastMove.toString() : '';
	}

	getLastMoveNumber() {
		return Math.floor((this.moves.length + 1) / 2);
	}
}
