/**
 * HexBoard - Game state for Hex
 *
 * Hex is played on an 11x11 rhombus-shaped board of hexagons.
 * - Red (Host) tries to connect top to bottom
 * - Blue (Guest) tries to connect left to right
 * - Players alternate placing stones
 * - First to connect their two sides wins
 * - No draws are possible in Hex
 */

export const CELL = {
	EMPTY: null,
	RED: 'red',    // Host - connects top to bottom
	BLUE: 'blue'   // Guest - connects left to right
};

export class HexBoard {
	constructor(size = 11) {
		this.size = size;
		this.cells = [];

		// Initialize empty board
		for (let row = 0; row < size; row++) {
			this.cells[row] = [];
			for (let col = 0; col < size; col++) {
				this.cells[row][col] = CELL.EMPTY;
			}
		}
	}

	getCell(row, col) {
		if (row < 0 || row >= this.size || col < 0 || col >= this.size) {
			return undefined;
		}
		return this.cells[row][col];
	}

	setCell(row, col, value) {
		if (row >= 0 && row < this.size && col >= 0 && col < this.size) {
			this.cells[row][col] = value;
			return true;
		}
		return false;
	}

	canPlace(row, col) {
		return this.getCell(row, col) === CELL.EMPTY;
	}

	placeStone(row, col, color) {
		if (this.canPlace(row, col)) {
			this.setCell(row, col, color);
			return true;
		}
		return false;
	}

	/**
	 * Get all empty cells as possible moves
	 */
	getPossibleMoves() {
		const moves = [];
		for (let row = 0; row < this.size; row++) {
			for (let col = 0; col < this.size; col++) {
				if (this.cells[row][col] === CELL.EMPTY) {
					moves.push({ row, col });
				}
			}
		}
		return moves;
	}

	/**
	 * Get neighbors of a hex cell
	 * In a hex grid, each cell has up to 6 neighbors
	 */
	getNeighbors(row, col) {
		const neighbors = [];
		// Hex grid neighbor offsets (axial coordinates)
		const offsets = [
			[-1, 0],  // top-left
			[-1, 1],  // top-right
			[0, -1],  // left
			[0, 1],   // right
			[1, -1],  // bottom-left
			[1, 0]    // bottom-right
		];

		for (const [dr, dc] of offsets) {
			const nr = row + dr;
			const nc = col + dc;
			if (nr >= 0 && nr < this.size && nc >= 0 && nc < this.size) {
				neighbors.push({ row: nr, col: nc });
			}
		}
		return neighbors;
	}

	/**
	 * Check if a player has won using flood fill
	 * Red wins by connecting top (row 0) to bottom (row size-1)
	 * Blue wins by connecting left (col 0) to right (col size-1)
	 */
	checkWinner() {
		// Check if Red won (top to bottom connection)
		if (this.hasConnection(CELL.RED, 'top-bottom')) {
			return CELL.RED;
		}

		// Check if Blue won (left to right connection)
		if (this.hasConnection(CELL.BLUE, 'left-right')) {
			return CELL.BLUE;
		}

		return null;
	}

	/**
	 * Use BFS to check if a player has a winning connection
	 */
	hasConnection(color, direction) {
		const visited = new Set();
		const queue = [];

		// Initialize starting edge
		if (direction === 'top-bottom') {
			// Red starts from top row
			for (let col = 0; col < this.size; col++) {
				if (this.cells[0][col] === color) {
					queue.push({ row: 0, col });
					visited.add(`0,${col}`);
				}
			}
		} else {
			// Blue starts from left column
			for (let row = 0; row < this.size; row++) {
				if (this.cells[row][0] === color) {
					queue.push({ row, col: 0 });
					visited.add(`${row},0`);
				}
			}
		}

		// BFS to find if we can reach the opposite edge
		while (queue.length > 0) {
			const { row, col } = queue.shift();

			// Check if we've reached the goal edge
			if (direction === 'top-bottom' && row === this.size - 1) {
				return true;
			}
			if (direction === 'left-right' && col === this.size - 1) {
				return true;
			}

			// Explore neighbors
			for (const neighbor of this.getNeighbors(row, col)) {
				const key = `${neighbor.row},${neighbor.col}`;
				if (!visited.has(key) && this.cells[neighbor.row][neighbor.col] === color) {
					visited.add(key);
					queue.push(neighbor);
				}
			}
		}

		return false;
	}

	/**
	 * Get the winning path for display
	 */
	getWinningPath(color) {
		const direction = color === CELL.RED ? 'top-bottom' : 'left-right';
		const visited = new Set();
		const parent = new Map();
		const queue = [];

		// Initialize starting edge
		if (direction === 'top-bottom') {
			for (let col = 0; col < this.size; col++) {
				if (this.cells[0][col] === color) {
					queue.push({ row: 0, col });
					visited.add(`0,${col}`);
					parent.set(`0,${col}`, null);
				}
			}
		} else {
			for (let row = 0; row < this.size; row++) {
				if (this.cells[row][0] === color) {
					queue.push({ row, col: 0 });
					visited.add(`${row},0`);
					parent.set(`${row},0`, null);
				}
			}
		}

		// BFS
		let endKey = null;
		while (queue.length > 0) {
			const { row, col } = queue.shift();
			const key = `${row},${col}`;

			if (direction === 'top-bottom' && row === this.size - 1) {
				endKey = key;
				break;
			}
			if (direction === 'left-right' && col === this.size - 1) {
				endKey = key;
				break;
			}

			for (const neighbor of this.getNeighbors(row, col)) {
				const nkey = `${neighbor.row},${neighbor.col}`;
				if (!visited.has(nkey) && this.cells[neighbor.row][neighbor.col] === color) {
					visited.add(nkey);
					parent.set(nkey, key);
					queue.push(neighbor);
				}
			}
		}

		// Reconstruct path
		if (!endKey) return [];

		const path = [];
		let current = endKey;
		while (current !== null) {
			const [r, c] = current.split(',').map(Number);
			path.unshift({ row: r, col: c });
			current = parent.get(current);
		}
		return path;
	}

	isBoardFull() {
		for (let row = 0; row < this.size; row++) {
			for (let col = 0; col < this.size; col++) {
				if (this.cells[row][col] === CELL.EMPTY) {
					return false;
				}
			}
		}
		return true;
	}

	getCopy() {
		const copy = new HexBoard(this.size);
		for (let row = 0; row < this.size; row++) {
			for (let col = 0; col < this.size; col++) {
				copy.cells[row][col] = this.cells[row][col];
			}
		}
		return copy;
	}

	/**
	 * Count stones of a given color
	 */
	countStones(color) {
		let count = 0;
		for (let row = 0; row < this.size; row++) {
			for (let col = 0; col < this.size; col++) {
				if (this.cells[row][col] === color) {
					count++;
				}
			}
		}
		return count;
	}
}
