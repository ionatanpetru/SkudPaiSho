/**
 * HexStrategicAI - Strategic AI for Hex
 *
 * Uses a combination of:
 * - Shortest path heuristic (minimize virtual distance to connect edges)
 * - Blocking opponent's best paths
 * - Center control preference
 * - Monte Carlo sampling for move evaluation
 */

import { HexNotationBuilder } from '../HexGameNotation';
import { CELL } from '../HexBoard';
import { HOST, GUEST } from '../../CommonNotationObjects';

export function HexStrategicAI() {
	this.player = null;
}

HexStrategicAI.prototype.getName = function() {
	return "Hex Strategic AI";
};

HexStrategicAI.prototype.getMessage = function() {
	return "This AI uses shortest-path analysis and Monte Carlo sampling to find strong moves. It prioritizes connecting paths while blocking opponent threats.";
};

HexStrategicAI.prototype.setPlayer = function(playerName) {
	this.player = playerName;
};

HexStrategicAI.prototype.getMove = function(game, moveNum) {
	const board = game.board;
	const possibleMoves = board.getPossibleMoves();

	if (possibleMoves.length === 0) return null;

	const myColor = this.player === HOST ? CELL.RED : CELL.BLUE;
	const oppColor = this.player === HOST ? CELL.BLUE : CELL.RED;

	// First move: take center or near-center
	if (moveNum === 1) {
		const center = Math.floor(board.size / 2);
		if (board.canPlace(center, center)) {
			return this.createMove(center, center);
		}
		// Near center
		if (board.canPlace(center, center - 1)) {
			return this.createMove(center, center - 1);
		}
	}

	let bestMove = null;
	let bestScore = -Infinity;

	// Evaluate each possible move
	for (const move of possibleMoves) {
		const score = this.evaluateMove(board, move.row, move.col, myColor, oppColor);

		if (score > bestScore) {
			bestScore = score;
			bestMove = move;
		}
	}

	if (bestMove) {
		return this.createMove(bestMove.row, bestMove.col);
	}

	// Fallback: random move
	const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
	return this.createMove(randomMove.row, randomMove.col);
};

HexStrategicAI.prototype.createMove = function(row, col) {
	const builder = new HexNotationBuilder();
	builder.setCell(row, col);
	return builder.getMove(this.player);
};

HexStrategicAI.prototype.evaluateMove = function(board, row, col, myColor, oppColor) {
	// Simulate the move
	const boardCopy = board.getCopy();
	boardCopy.placeStone(row, col, myColor);

	// Check for immediate win
	if (boardCopy.checkWinner() === myColor) {
		return 100000;
	}

	let score = 0;

	// 1. Evaluate our shortest path improvement
	const myPathBefore = this.calculateShortestPath(board, myColor);
	const myPathAfter = this.calculateShortestPath(boardCopy, myColor);
	score += (myPathBefore - myPathAfter) * 100;

	// 2. Evaluate blocking opponent
	const oppPathBefore = this.calculateShortestPath(board, oppColor);
	const boardWithOpp = board.getCopy();
	boardWithOpp.placeStone(row, col, oppColor);
	const oppPathIfTheyTook = this.calculateShortestPath(boardWithOpp, oppColor);

	// If opponent would benefit a lot from this cell, we should take it
	const blockingValue = oppPathBefore - oppPathIfTheyTook;
	score += blockingValue * 80;

	// 3. Center control bonus
	const center = board.size / 2;
	const distFromCenter = Math.sqrt((row - center) ** 2 + (col - center) ** 2);
	score += (center - distFromCenter) * 5;

	// 4. Connectivity bonus - prefer moves adjacent to our existing stones
	const adjacentOwn = this.countAdjacentStones(board, row, col, myColor);
	score += adjacentOwn * 20;

	// 5. Bridge pattern bonus
	if (this.createsBridge(board, row, col, myColor)) {
		score += 50;
	}

	// 6. Monte Carlo sampling for tie-breaking
	score += this.monteCarloScore(boardCopy, myColor, oppColor, 20) * 10;

	return score;
};

/**
 * Calculate the minimum number of empty cells needed to connect edges
 * Uses Dijkstra-like algorithm with virtual connections
 */
HexStrategicAI.prototype.calculateShortestPath = function(board, color) {
	const size = board.size;
	const isRed = color === CELL.RED;

	// Distance array
	const dist = [];
	for (let r = 0; r < size; r++) {
		dist[r] = [];
		for (let c = 0; c < size; c++) {
			dist[r][c] = Infinity;
		}
	}

	// Priority queue (simple array, sorted by distance)
	const pq = [];

	// Initialize starting edge
	if (isRed) {
		// Red starts from top row
		for (let c = 0; c < size; c++) {
			const cell = board.getCell(0, c);
			if (cell === color) {
				dist[0][c] = 0;
				pq.push({ row: 0, col: c, d: 0 });
			} else if (cell === CELL.EMPTY) {
				dist[0][c] = 1;
				pq.push({ row: 0, col: c, d: 1 });
			}
		}
	} else {
		// Blue starts from left column
		for (let r = 0; r < size; r++) {
			const cell = board.getCell(r, 0);
			if (cell === color) {
				dist[r][0] = 0;
				pq.push({ row: r, col: 0, d: 0 });
			} else if (cell === CELL.EMPTY) {
				dist[r][0] = 1;
				pq.push({ row: r, col: 0, d: 1 });
			}
		}
	}

	// Sort by distance
	pq.sort((a, b) => a.d - b.d);

	// Dijkstra
	while (pq.length > 0) {
		const { row, col, d } = pq.shift();

		if (d > dist[row][col]) continue;

		// Check if reached goal
		if (isRed && row === size - 1) {
			return d;
		}
		if (!isRed && col === size - 1) {
			return d;
		}

		// Explore neighbors
		for (const neighbor of board.getNeighbors(row, col)) {
			const nr = neighbor.row;
			const nc = neighbor.col;
			const cell = board.getCell(nr, nc);

			if (cell === (isRed ? CELL.BLUE : CELL.RED)) continue; // Blocked by opponent

			const cost = cell === color ? 0 : 1;
			const newDist = d + cost;

			if (newDist < dist[nr][nc]) {
				dist[nr][nc] = newDist;
				// Insert in sorted order
				let inserted = false;
				for (let i = 0; i < pq.length; i++) {
					if (pq[i].d > newDist) {
						pq.splice(i, 0, { row: nr, col: nc, d: newDist });
						inserted = true;
						break;
					}
				}
				if (!inserted) {
					pq.push({ row: nr, col: nc, d: newDist });
				}
			}
		}
	}

	return Infinity; // No path possible (shouldn't happen in Hex)
};

HexStrategicAI.prototype.countAdjacentStones = function(board, row, col, color) {
	let count = 0;
	for (const neighbor of board.getNeighbors(row, col)) {
		if (board.getCell(neighbor.row, neighbor.col) === color) {
			count++;
		}
	}
	return count;
};

/**
 * Check if placing a stone creates a "bridge" connection
 * A bridge is two stones that share two empty common neighbors
 */
HexStrategicAI.prototype.createsBridge = function(board, row, col, color) {
	const neighbors = board.getNeighbors(row, col);

	for (const n1 of neighbors) {
		if (board.getCell(n1.row, n1.col) !== color) continue;

		// Check if there's another path to this neighbor through empty cells
		const n1Neighbors = board.getNeighbors(n1.row, n1.col);
		const myNeighbors = neighbors.filter(n =>
			board.getCell(n.row, n.col) === CELL.EMPTY &&
			n1Neighbors.some(nn => nn.row === n.row && nn.col === n.col)
		);

		if (myNeighbors.length >= 1) {
			return true;
		}
	}
	return false;
};

/**
 * Monte Carlo sampling to evaluate a position
 * Plays random games and returns win rate
 */
HexStrategicAI.prototype.monteCarloScore = function(board, myColor, oppColor, numSamples) {
	let wins = 0;

	for (let i = 0; i < numSamples; i++) {
		const boardCopy = board.getCopy();
		let currentColor = oppColor; // Opponent moves next

		// Random playout
		while (!boardCopy.checkWinner()) {
			const moves = boardCopy.getPossibleMoves();
			if (moves.length === 0) break;

			const randomMove = moves[Math.floor(Math.random() * moves.length)];
			boardCopy.placeStone(randomMove.row, randomMove.col, currentColor);

			currentColor = currentColor === myColor ? oppColor : myColor;
		}

		const winner = boardCopy.checkWinner();
		if (winner === myColor) {
			wins++;
		}
	}

	return wins / numSamples;
};
