/* Yamma Strategic AI */

import { YammaNotationBuilder } from '../YammaGameNotation';
import { PLAYER } from '../YammaBoard';
import { HOST, GUEST } from '../../CommonNotationObjects';

export function YammaStrategicAI() {
}

YammaStrategicAI.prototype.getName = function() {
	return "Yamma Strategic AI";
};

YammaStrategicAI.prototype.getMessage = function() {
	return "This AI evaluates positions strategically, looking for winning moves, blocking opponent threats, and creating its own threats across all three viewing angles.";
};

YammaStrategicAI.prototype.setPlayer = function(playerName) {
	this.player = playerName;
};

YammaStrategicAI.prototype.getMove = function(game, moveNum) {
	const possiblePositions = game.board.getPossibleMoves();
	if (possiblePositions.length === 0) return null;

	const myColor = this.player === HOST ? PLAYER.WHITE : PLAYER.BLUE;
	const oppColor = this.player === HOST ? PLAYER.BLUE : PLAYER.WHITE;

	let bestMove = null;
	let bestScore = -Infinity;

	// Evaluate each possible move (position + rotation)
	for (const pos of possiblePositions) {
		for (let rotation = 0; rotation < 3; rotation++) {
			// Simulate the move
			const boardCopy = game.board.getCopy();
			boardCopy.placeCube(pos.row, pos.col, pos.level, myColor, rotation);

			// Check for immediate win
			const winResult = boardCopy.checkWinner();
			if (winResult && this.colorIsOurs(winResult.winner, myColor)) {
				// Winning move - take it!
				return this.createMove(pos, rotation);
			}

			// Score the position
			const score = this.evaluateBoard(boardCopy, myColor, oppColor, pos, rotation, game.board);

			if (score > bestScore) {
				bestScore = score;
				bestMove = { pos, rotation };
			}
		}
	}

	// Check if we need to block opponent's winning move
	const blockingMove = this.findBlockingMove(game.board, possiblePositions, myColor, oppColor);
	if (blockingMove) {
		return blockingMove;
	}

	if (bestMove) {
		return this.createMove(bestMove.pos, bestMove.rotation);
	}

	// Fallback to first available move
	const notationBuilder = new YammaNotationBuilder();
	notationBuilder.setPoint(possiblePositions[0].row, possiblePositions[0].col, possiblePositions[0].level, 0);
	return notationBuilder.getMove(this.player);
};

YammaStrategicAI.prototype.colorIsOurs = function(color, myColor) {
	return color === myColor;
};

YammaStrategicAI.prototype.createMove = function(pos, rotation) {
	const notationBuilder = new YammaNotationBuilder();
	notationBuilder.setPoint(pos.row, pos.col, pos.level, rotation);
	return notationBuilder.getMove(this.player);
};

YammaStrategicAI.prototype.findBlockingMove = function(board, possiblePositions, myColor, oppColor) {
	// Check if opponent could win with their next move
	for (const pos of possiblePositions) {
		for (let rotation = 0; rotation < 3; rotation++) {
			const boardCopy = board.getCopy();
			boardCopy.placeCube(pos.row, pos.col, pos.level, oppColor, rotation);

			const winResult = boardCopy.checkWinner();
			if (winResult && !this.colorIsOurs(winResult.winner, myColor)) {
				// Opponent could win here - we should consider blocking
				// Find a move at this position that blocks (any rotation)
				for (let myRotation = 0; myRotation < 3; myRotation++) {
					const blockBoard = board.getCopy();
					blockBoard.placeCube(pos.row, pos.col, pos.level, myColor, myRotation);
					const afterBlock = blockBoard.checkWinner();
					// If blocking doesn't let opponent win elsewhere, this is good
					if (!afterBlock || this.colorIsOurs(afterBlock.winner, myColor)) {
						return this.createMove(pos, myRotation);
					}
				}
				// Even if we can't perfectly block, taking the position is better than nothing
				return this.createMove(pos, 0);
			}
		}
	}
	return null;
};

YammaStrategicAI.prototype.evaluateBoard = function(board, myColor, oppColor, placedPos, rotation, originalBoard) {
	let score = 0;

	// Evaluate all three viewing angles
	for (let angle = 0; angle < 3; angle++) {
		const view = board.buildProjectedView(angle);
		score += this.evaluateView(view, board.baseRows, myColor, oppColor);
	}

	// Bonus for central positions (more connectivity)
	score += this.positionBonus(placedPos, board.baseRows);

	// Bonus for lower levels (foundation building)
	score += (5 - placedPos.level) * 2;

	return score;
};

YammaStrategicAI.prototype.evaluateView = function(view, baseRows, myColor, oppColor) {
	let score = 0;

	// Direction vectors for triangular grid
	const directions = [
		{ dRow: 0, dCol: 1 },   // Horizontal
		{ dRow: 1, dCol: 0 },   // Down-left
		{ dRow: 1, dCol: 1 },   // Down-right
	];

	// Count lines of different lengths for both colors
	const myLines = { 2: 0, 3: 0 };
	const oppLines = { 2: 0, 3: 0 };

	for (let row = 0; row < baseRows; row++) {
		for (let col = 0; col <= row; col++) {
			const color = view[row]?.[col];
			if (!color) continue;

			for (const dir of directions) {
				const lineLength = this.countLine(view, row, col, dir, color, baseRows);

				if (lineLength >= 2) {
					if (color === myColor) {
						myLines[Math.min(lineLength, 3)]++;
					} else {
						oppLines[Math.min(lineLength, 3)]++;
					}
				}
			}
		}
	}

	// Score based on line counts
	// Our lines are good, opponent lines are bad
	score += myLines[3] * 100;  // 3-in-a-row is very valuable
	score += myLines[2] * 10;   // 2-in-a-row is somewhat valuable
	score -= oppLines[3] * 80;  // Opponent 3-in-a-row is dangerous
	score -= oppLines[2] * 5;   // Opponent 2-in-a-row is slightly bad

	return score;
};

YammaStrategicAI.prototype.countLine = function(view, startRow, startCol, dir, color, baseRows) {
	let count = 0;
	let r = startRow;
	let c = startCol;

	while (r >= 0 && r < baseRows && c >= 0 && c <= r && view[r]?.[c] === color) {
		count++;
		r += dir.dRow;
		c += dir.dCol;
	}

	return count;
};

YammaStrategicAI.prototype.positionBonus = function(pos, baseRows) {
	// Central positions have more connectivity potential
	const rowCenter = pos.row / 2;
	const distFromCenter = Math.abs(pos.col - rowCenter);
	const centralityBonus = (pos.row / 2 - distFromCenter) * 3;

	return Math.max(0, centralityBonus);
};
