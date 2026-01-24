/**
 * TicTacToeSmartAI - Uses minimax algorithm for optimal play
 *
 * This AI plays perfectly - it will never lose.
 * Against another perfect player, the game always ends in a draw.
 */

import { TicTacToeBoard, MARK } from '../TicTacToeBoard';
import { TicTacToeNotationBuilder } from '../TicTacToeGameNotation';
import { HOST, GUEST } from '../../CommonNotationObjects';

export function TicTacToeSmartAI() {
	this.player = null;
}

TicTacToeSmartAI.prototype.getName = function() {
	return "Tic Tac Toe Smart AI";
};

TicTacToeSmartAI.prototype.getMessage = function() {
	return "This AI uses the minimax algorithm to play perfectly. It will never lose - the best you can do is a draw!";
};

TicTacToeSmartAI.prototype.setPlayer = function(playerName) {
	this.player = playerName;
};

TicTacToeSmartAI.prototype.getMove = function(game, moveNum) {
	const board = game.board;
	const myMark = this.player === HOST ? MARK.X : MARK.O;

	// Find the best move using minimax
	const bestMove = this.findBestMove(board, myMark);

	if (bestMove === null) {
		return null;
	}

	const row = Math.floor(bestMove / 3);
	const col = bestMove % 3;

	const notationBuilder = new TicTacToeNotationBuilder();
	notationBuilder.setCell(row, col);

	return notationBuilder.getMove(this.player);
};

/**
 * Find the best move using minimax algorithm
 */
TicTacToeSmartAI.prototype.findBestMove = function(board, myMark) {
	let bestScore = -Infinity;
	let bestMove = null;

	const emptyCells = board.getEmptyCells();

	for (const index of emptyCells) {
		// Try this move
		const boardCopy = board.getCopy();
		boardCopy.setCellByIndex(index, myMark);

		// Get the score for this move
		const score = this.minimax(boardCopy, 0, false, myMark, -Infinity, Infinity);

		if (score > bestScore) {
			bestScore = score;
			bestMove = index;
		}
	}

	return bestMove;
};

/**
 * Minimax algorithm with alpha-beta pruning
 *
 * @param {TicTacToeBoard} board - Current board state
 * @param {number} depth - Current depth in the search tree
 * @param {boolean} isMaximizing - True if maximizing player's turn
 * @param {string} myMark - The AI's mark (X or O)
 * @param {number} alpha - Alpha value for pruning
 * @param {number} beta - Beta value for pruning
 * @returns {number} - Score for this board state
 */
TicTacToeSmartAI.prototype.minimax = function(board, depth, isMaximizing, myMark, alpha, beta) {
	const opponentMark = TicTacToeBoard.getOpponent(myMark);

	// Check terminal states
	const result = board.checkWinner();

	if (result) {
		if (result.winner === myMark) {
			return 10 - depth; // Win - prefer faster wins
		} else {
			return depth - 10; // Loss - prefer slower losses
		}
	}

	if (board.isFull()) {
		return 0; // Draw
	}

	const emptyCells = board.getEmptyCells();

	if (isMaximizing) {
		// AI's turn - maximize score
		let maxScore = -Infinity;

		for (const index of emptyCells) {
			const boardCopy = board.getCopy();
			boardCopy.setCellByIndex(index, myMark);

			const score = this.minimax(boardCopy, depth + 1, false, myMark, alpha, beta);
			maxScore = Math.max(maxScore, score);

			// Alpha-beta pruning
			alpha = Math.max(alpha, score);
			if (beta <= alpha) {
				break;
			}
		}

		return maxScore;
	} else {
		// Opponent's turn - minimize score
		let minScore = Infinity;

		for (const index of emptyCells) {
			const boardCopy = board.getCopy();
			boardCopy.setCellByIndex(index, opponentMark);

			const score = this.minimax(boardCopy, depth + 1, true, myMark, alpha, beta);
			minScore = Math.min(minScore, score);

			// Alpha-beta pruning
			beta = Math.min(beta, score);
			if (beta <= alpha) {
				break;
			}
		}

		return minScore;
	}
};
