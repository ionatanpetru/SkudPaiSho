/**
 * TicTacToeBoard - Game state and logic for Tic Tac Toe
 */

export const MARK = {
	X: 'X',
	O: 'O',
	EMPTY: null
};

// Winning lines (indices into the 3x3 grid)
const WINNING_LINES = [
	// Rows
	[0, 1, 2],
	[3, 4, 5],
	[6, 7, 8],
	// Columns
	[0, 3, 6],
	[1, 4, 7],
	[2, 5, 8],
	// Diagonals
	[0, 4, 8],
	[2, 4, 6]
];

export class TicTacToeBoard {
	constructor() {
		// 3x3 grid stored as flat array
		this.cells = new Array(9).fill(MARK.EMPTY);
	}

	getCell(row, col) {
		return this.cells[row * 3 + col];
	}

	getCellByIndex(index) {
		return this.cells[index];
	}

	setCell(row, col, mark) {
		this.cells[row * 3 + col] = mark;
	}

	setCellByIndex(index, mark) {
		this.cells[index] = mark;
	}

	canPlace(row, col) {
		return this.getCell(row, col) === MARK.EMPTY;
	}

	canPlaceByIndex(index) {
		return index >= 0 && index < 9 && this.cells[index] === MARK.EMPTY;
	}

	placeMark(row, col, mark) {
		if (!this.canPlace(row, col)) {
			return false;
		}
		this.setCell(row, col, mark);
		return true;
	}

	placeMarkByIndex(index, mark) {
		if (!this.canPlaceByIndex(index)) {
			return false;
		}
		this.setCellByIndex(index, mark);
		return true;
	}

	/**
	 * Check for a winner
	 * @returns {{ winner: string, line: number[] } | null}
	 */
	checkWinner() {
		for (const line of WINNING_LINES) {
			const [a, b, c] = line;
			if (this.cells[a] !== MARK.EMPTY &&
				this.cells[a] === this.cells[b] &&
				this.cells[a] === this.cells[c]) {
				return {
					winner: this.cells[a],
					line: line
				};
			}
		}
		return null;
	}

	/**
	 * Check if the board is full (draw condition)
	 */
	isFull() {
		return this.cells.every(cell => cell !== MARK.EMPTY);
	}

	/**
	 * Check if the game has ended
	 */
	isGameOver() {
		return this.checkWinner() !== null || this.isFull();
	}

	/**
	 * Get all empty cell indices
	 */
	getEmptyCells() {
		const empty = [];
		for (let i = 0; i < 9; i++) {
			if (this.cells[i] === MARK.EMPTY) {
				empty.push(i);
			}
		}
		return empty;
	}

	/**
	 * Get possible moves as {row, col} objects
	 */
	getPossibleMoves() {
		const moves = [];
		for (let row = 0; row < 3; row++) {
			for (let col = 0; col < 3; col++) {
				if (this.canPlace(row, col)) {
					moves.push({ row, col, index: row * 3 + col });
				}
			}
		}
		return moves;
	}

	/**
	 * Create a copy of the board
	 */
	getCopy() {
		const copy = new TicTacToeBoard();
		copy.cells = [...this.cells];
		return copy;
	}

	/**
	 * Get opponent's mark
	 */
	static getOpponent(mark) {
		return mark === MARK.X ? MARK.O : MARK.X;
	}
}
