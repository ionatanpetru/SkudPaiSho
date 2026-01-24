/**
 * YammaBoard - Represents the 3D triangular pyramid game board state
 *
 * Yamma is a 3D four-in-a-row game played on a triangular pyramid (tetrahedron).
 * Cubes show 3 faces from 3 different viewing angles.
 * Each cube has 3 white sides and 3 blue sides.
 *
 * Triangular Pyramid structure:
 * - Level 0 (base): Triangle with 5 rows (15 positions: 1+2+3+4+5)
 * - Level 1: Triangle with 4 rows (10 positions)
 * - Level 2: Triangle with 3 rows (6 positions)
 * - Level 3: Triangle with 2 rows (3 positions)
 * - Level 4: Triangle with 1 row (1 position - apex)
 *
 * Coordinates: (row, col, level) where:
 * - row: 0 to (baseRows - level - 1)
 * - col: 0 to row
 * - level: 0 to (baseRows - 1)
 *
 * A cube at level z position (row, col) needs 3 cubes below at level z-1:
 * - (row, col), (row+1, col), (row+1, col+1)
 */

export const PLAYER = {
	WHITE: 'white',
	BLUE: 'blue',
	NEUTRAL: 'neutral'
};

export const CubeFaceOrientation = {
	FRONT: 0,
	LEFT: 1,
	RIGHT: 2
};

export class YammaCube {
	constructor(owner, row, col, level = 0) {
		this.owner = owner;
		this.row = row;
		this.col = col;
		this.level = level;

		// For compatibility with old code that uses x, y, z
		this.x = row;
		this.y = col;
		this.z = level;

		// Which color shows from each of 3 viewing directions
		this.frontFace = owner;
		this.leftFace = owner === PLAYER.WHITE ? PLAYER.BLUE : PLAYER.WHITE;
		this.rightFace = owner === PLAYER.WHITE ? PLAYER.BLUE : PLAYER.WHITE;
	}

	getFaceColor(viewAngle) {
		switch (viewAngle) {
			case 0: return this.frontFace;
			case 1: return this.leftFace;
			case 2: return this.rightFace;
			default: return this.frontFace;
		}
	}
}

export class YammaBoard {
	constructor() {
		// Base triangle has 5 rows
		this.baseRows = 5;
		// Maximum levels (0 to 4)
		this.maxLevels = 5;

		// levels[z][row][col] = cube or null
		this.levels = [];

		this.initializeBoard();
	}

	initializeBoard() {
		this.levels = [];
		for (let level = 0; level < this.maxLevels; level++) {
			const rows = this.getRowsAtLevel(level);
			this.levels[level] = [];
			for (let row = 0; row < rows; row++) {
				this.levels[level][row] = [];
				for (let col = 0; col <= row; col++) {
					this.levels[level][row][col] = null;
				}
			}
		}
	}

	getRowsAtLevel(level) {
		return this.baseRows - level;
	}

	getPositionCountAtLevel(level) {
		const rows = this.getRowsAtLevel(level);
		return (rows * (rows + 1)) / 2;
	}

	isValidPosition(row, col, level) {
		if (level < 0 || level >= this.maxLevels) {
			return false;
		}
		const rows = this.getRowsAtLevel(level);
		if (row < 0 || row >= rows) {
			return false;
		}
		if (col < 0 || col > row) {
			return false;
		}
		return true;
	}

	getCubeAt(row, col, level) {
		if (!this.isValidPosition(row, col, level)) {
			return null;
		}
		return this.levels[level][row][col];
	}

	hasSupport(row, col, level) {
		if (level === 0) {
			return true;
		}

		// A cube at level z, position (row, col) needs 3 cubes at level z-1:
		// (row, col), (row+1, col), (row+1, col+1)
		const supports = [
			this.getCubeAt(row, col, level - 1),
			this.getCubeAt(row + 1, col, level - 1),
			this.getCubeAt(row + 1, col + 1, level - 1)
		];

		return supports.every(cube => cube !== null);
	}

	canPlaceCube(row, col, level) {
		if (!this.isValidPosition(row, col, level)) {
			return false;
		}

		if (this.getCubeAt(row, col, level) !== null) {
			return false;
		}

		return this.hasSupport(row, col, level);
	}

	placeCube(row, col, level, player) {
		if (!this.canPlaceCube(row, col, level)) {
			return null;
		}

		const cube = new YammaCube(player, row, col, level);
		this.levels[level][row][col] = cube;

		return cube;
	}

	getAllCubes() {
		const cubes = [];
		for (let level = 0; level < this.maxLevels; level++) {
			const rows = this.getRowsAtLevel(level);
			for (let row = 0; row < rows; row++) {
				for (let col = 0; col <= row; col++) {
					const cube = this.levels[level][row][col];
					if (cube) {
						cubes.push(cube);
					}
				}
			}
		}
		return cubes;
	}

	getPossibleMoves() {
		const moves = [];

		for (let level = 0; level < this.maxLevels; level++) {
			const rows = this.getRowsAtLevel(level);
			for (let row = 0; row < rows; row++) {
				for (let col = 0; col <= row; col++) {
					if (this.canPlaceCube(row, col, level)) {
						moves.push({ row, col, level, x: row, y: col, z: level });
					}
				}
			}
		}

		return moves;
	}

	/**
	 * Convert triangular coordinates to world position for 3D rendering
	 */
	getWorldPosition(row, col, level, spacing = 1.2) {
		// For triangular grid:
		// - x position depends on col, offset by row to center triangle
		// - z position (depth) depends on row
		// - y position (height) depends on level

		const rowOffset = row * spacing * 0.5;
		const levelOffset = level * spacing * 0.33;

		const x = col * spacing - rowOffset + levelOffset;
		const z = row * spacing * 0.866 + levelOffset; // 0.866 = sqrt(3)/2
		const y = level * spacing * 0.8;

		return { x, y, z };
	}

	/**
	 * Check for a winner from a specific viewing angle.
	 *
	 * This works by:
	 * 1. Building a 2D projected view (triangular grid) for this angle
	 * 2. Each cell shows the first visible cube's face color from that direction
	 * 3. Checking the 2D view for 4-in-a-row
	 */
	checkWinFromAngle(viewAngle) {
		// Build the 2D projected view for this angle
		const view = this.buildProjectedView(viewAngle);

		// Check for 4-in-a-row in the 2D triangular grid
		const result = this.checkFourInARowInView(view);
		return result;
	}

	/**
	 * Build a 2D projected view of the pyramid from a viewing angle.
	 *
	 * Returns a triangular grid (5 rows) where each cell contains the
	 * face color ('white', 'blue', or null) visible from that angle.
	 */
	buildProjectedView(viewAngle) {
		const view = [];

		for (let row = 0; row < this.baseRows; row++) {
			view[row] = [];
			for (let col = 0; col <= row; col++) {
				view[row][col] = this.getVisibleColorAt(row, col, viewAngle);
			}
		}

		return view;
	}

	/**
	 * Get the color visible at a projected (row, col) position from a viewing angle.
	 *
	 * Traces through the pyramid from the viewing direction and returns
	 * the face color of the first cube encountered.
	 */
	getVisibleColorAt(projRow, projCol, viewAngle) {
		// Check from front (highest level) to back (level 0)
		// The exact mapping depends on the viewing angle

		for (let level = this.maxLevels - 1; level >= 0; level--) {
			const maxRowAtLevel = this.baseRows - level - 1;

			// Transform projected coordinates to board coordinates based on view angle
			let checkRow, checkCol;

			if (viewAngle === 0) {
				// Front view: direct mapping
				checkRow = projRow;
				checkCol = projCol;
			} else if (viewAngle === 1) {
				// Left view: rotate 120° counterclockwise
				// In triangular coordinates, this swaps axes
				checkRow = projCol;
				checkCol = projRow - projCol;
			} else {
				// Right view: rotate 120° clockwise
				checkRow = projRow - projCol;
				checkCol = projCol;
			}

			// Check if this position exists at this level and has a cube
			if (checkRow >= 0 && checkRow <= maxRowAtLevel &&
				checkCol >= 0 && checkCol <= checkRow) {
				const cube = this.getCubeAt(checkRow, checkCol, level);
				if (cube) {
					return cube.getFaceColor(viewAngle);
				}
			}
		}

		return null; // No cube visible at this position
	}

	/**
	 * Check a 2D projected view for 4-in-a-row.
	 *
	 * In a triangular grid, there are 3 line directions:
	 * - Horizontal (along row): (row, col) -> (row, col+1)
	 * - Down-left diagonal: (row, col) -> (row+1, col)
	 * - Down-right diagonal: (row, col) -> (row+1, col+1)
	 */
	checkFourInARowInView(view) {
		// Direction vectors for triangular grid lines
		const directions = [
			{ dRow: 0, dCol: 1 },   // Horizontal (along row)
			{ dRow: 1, dCol: 0 },   // Down-left diagonal
			{ dRow: 1, dCol: 1 },   // Down-right diagonal
		];

		for (let row = 0; row < this.baseRows; row++) {
			for (let col = 0; col <= row; col++) {
				const color = view[row][col];
				if (!color) continue; // Empty cell

				// Check each direction from this cell
				for (const dir of directions) {
					let count = 1;
					let r = row + dir.dRow;
					let c = col + dir.dCol;

					// Count consecutive same-color cells
					while (r < this.baseRows && c >= 0 && c <= r &&
						   view[r] && view[r][c] === color) {
						count++;
						if (count >= 4) {
							return color; // Found 4-in-a-row!
						}
						r += dir.dRow;
						c += dir.dCol;
					}
				}
			}
		}

		return null; // No 4-in-a-row found
	}

	checkWinner() {
		for (let angle = 0; angle < 3; angle++) {
			const winner = this.checkWinFromAngle(angle);
			if (winner) {
				return { winner, angle };
			}
		}
		return null;
	}

	isBoardFull() {
		return this.getPossibleMoves().length === 0;
	}

	getCopy() {
		const copy = new YammaBoard();

		for (let level = 0; level < this.maxLevels; level++) {
			const rows = this.getRowsAtLevel(level);
			for (let row = 0; row < rows; row++) {
				for (let col = 0; col <= row; col++) {
					const cube = this.levels[level][row][col];
					if (cube) {
						const cubeCopy = new YammaCube(cube.owner, cube.row, cube.col, cube.level);
						cubeCopy.frontFace = cube.frontFace;
						cubeCopy.leftFace = cube.leftFace;
						cubeCopy.rightFace = cube.rightFace;
						copy.levels[level][row][col] = cubeCopy;
					}
				}
			}
		}

		return copy;
	}
}
