/**
 * HexGameNotation - Save/Load notation for Hex games
 *
 * Notation format: "H:row,col;G:row,col;H:row,col;..."
 * H = Host (Red), G = Guest (Blue)
 */

import { GUEST, HOST } from '../CommonNotationObjects';

/**
 * Represents a single move in Hex
 */
export class HexNotationMove {
	constructor(notation) {
		this.fullNotation = notation;
		this.player = null;
		this.row = -1;
		this.col = -1;

		if (notation) {
			this.parse(notation);
		}
	}

	parse(notation) {
		// Format: "H:row,col" or "G:row,col"
		const parts = notation.split(':');
		if (parts.length !== 2) return;

		// Player
		if (parts[0] === 'H') {
			this.player = HOST;
		} else if (parts[0] === 'G') {
			this.player = GUEST;
		} else {
			return;
		}

		// Coordinates
		const coords = parts[1].split(',');
		if (coords.length !== 2) return;

		this.row = parseInt(coords[0], 10);
		this.col = parseInt(coords[1], 10);
	}

	isValid() {
		return this.player !== null && this.row >= 0 && this.col >= 0;
	}

	toString() {
		const playerCode = this.player === HOST ? 'H' : 'G';
		return `${playerCode}:${this.row},${this.col}`;
	}
}

/**
 * Builds a move from user input
 */
export class HexNotationBuilder {
	constructor() {
		this.row = -1;
		this.col = -1;
	}

	setCell(row, col) {
		this.row = row;
		this.col = col;
	}

	isReady() {
		return this.row >= 0 && this.col >= 0;
	}

	getMove(player) {
		if (!this.isReady()) return null;

		const move = new HexNotationMove();
		move.player = player;
		move.row = this.row;
		move.col = this.col;
		move.fullNotation = move.toString();

		return move;
	}

	reset() {
		this.row = -1;
		this.col = -1;
	}
}

/**
 * Manages the full game notation
 */
export class HexGameNotation {
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

	setNotationText(text) {
		this.notationText = text;
		this.moves = [];

		if (!text || text.trim() === '') return;

		const moveStrings = text.split(';');
		for (const moveStr of moveStrings) {
			if (moveStr.trim()) {
				const move = new HexNotationMove(moveStr.trim());
				if (move.isValid()) {
					this.moves.push(move);
				}
			}
		}
	}

	getNotationText() {
		return this.notationText;
	}

	getNotationHtml() {
		if (this.moves.length === 0) {
			return '<em>No moves yet</em>';
		}

		let html = '';
		for (let i = 0; i < this.moves.length; i += 2) {
			const moveNum = Math.floor(i / 2) + 1;
			const redMove = this.moves[i];
			const blueMove = this.moves[i + 1];

			html += `<strong>${moveNum}.</strong> `;
			html += `<span style="color:#dc2626">${this.formatMove(redMove)}</span>`;
			if (blueMove) {
				html += ` <span style="color:#2563eb">${this.formatMove(blueMove)}</span>`;
			}
			html += '<br>';
		}
		return html;
	}

	formatMove(move) {
		// Convert to chess-like notation: column letter + row number
		const colLetter = String.fromCharCode(65 + move.col); // A, B, C, ...
		const rowNum = move.row + 1;
		return `${colLetter}${rowNum}`;
	}

	getNotationForEmail() {
		return this.notationText;
	}

	getLastMove() {
		return this.moves.length > 0 ? this.moves[this.moves.length - 1] : null;
	}

	getLastMoveText() {
		const lastMove = this.getLastMove();
		return lastMove ? lastMove.toString() : '';
	}

	getLastMoveNumber() {
		return this.moves.length;
	}

	/**
	 * Create a move from the builder for a given player
	 */
	getNotationMoveFromBuilder(builder, player) {
		return builder.getMove(player);
	}
}
