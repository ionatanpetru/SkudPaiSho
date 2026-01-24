/**
 * YammaGameNotation - Handles move notation for saving/loading games
 */

import { GUEST, HOST } from '../CommonNotationObjects';

export class YammaNotationMove {
	constructor(notation) {
		this.fullNotation = notation;
		this.player = null;
		this.x = 0;
		this.y = 0;
		this.z = 0;

		if (notation) {
			this.parse(notation);
		}
	}

	parse(notation) {
		// Format: "H:x,y,z" or "G:x,y,z" (e.g., "H:2,3,0")
		const parts = notation.split(':');
		if (parts.length !== 2) return;

		this.player = parts[0] === 'H' ? HOST : GUEST;

		const coords = parts[1].split(',');
		if (coords.length >= 2) {
			this.x = parseInt(coords[0], 10);
			this.y = parseInt(coords[1], 10);
			this.z = coords.length >= 3 ? parseInt(coords[2], 10) : 0;
		}
	}

	toString() {
		const playerCode = this.player === HOST ? 'H' : 'G';
		return `${playerCode}:${this.x},${this.y},${this.z}`;
	}
}

export class YammaNotationBuilder {
	constructor() {
		this.status = 'BRAND_NEW';
		this.x = null;
		this.y = null;
		this.z = null;
	}

	setPoint(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.status = 'READY';
	}

	isReady() {
		return this.status === 'READY' && this.x !== null && this.y !== null && this.z !== null;
	}

	getMove(player) {
		if (!this.isReady()) return null;

		const move = new YammaNotationMove();
		move.player = player;
		move.x = this.x;
		move.y = this.y;
		move.z = this.z;
		move.fullNotation = move.toString();
		return move;
	}

	reset() {
		this.status = 'BRAND_NEW';
		this.x = null;
		this.y = null;
		this.z = null;
	}
}

export class YammaGameNotation {
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
			const move = new YammaNotationMove(moveStr.trim());
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

		return lines.map(line => line).join('<br />');
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
