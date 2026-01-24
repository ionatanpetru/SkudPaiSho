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

	checkWinFromAngle(viewAngle) {
		const cubes = this.getAllCubes();

		const colorPositions = { [PLAYER.WHITE]: [], [PLAYER.BLUE]: [] };

		for (const cube of cubes) {
			const color = cube.getFaceColor(viewAngle);
			if (colorPositions[color]) {
				colorPositions[color].push(cube);
			}
		}

		for (const color of [PLAYER.WHITE, PLAYER.BLUE]) {
			const positions = colorPositions[color];
			if (positions.length >= 4 && this.hasFourInARow(positions)) {
				return color;
			}
		}

		return null;
	}

	hasFourInARow(cubes) {
		const posSet = new Set();
		for (const cube of cubes) {
			posSet.add(`${cube.row},${cube.col},${cube.level}`);
		}

		// Direction vectors for triangular grid
		const directions = [
			// Within same level:
			{ dRow: 0, dCol: 1, dLevel: 0 },   // Along row
			{ dRow: 1, dCol: 0, dLevel: 0 },   // Down-left
			{ dRow: 1, dCol: 1, dLevel: 0 },   // Down-right
			// Across levels (edges of tetrahedron):
			{ dRow: 0, dCol: 0, dLevel: 1 },   // Straight up
			{ dRow: -1, dCol: 0, dLevel: 1 },  // Up-left edge
			{ dRow: -1, dCol: -1, dLevel: 1 }, // Up-right edge
		];

		for (const cube of cubes) {
			for (const dir of directions) {
				let count = 1;
				let r = cube.row + dir.dRow;
				let c = cube.col + dir.dCol;
				let l = cube.level + dir.dLevel;

				while (posSet.has(`${r},${c},${l}`)) {
					count++;
					if (count >= 4) {
						return true;
					}
					r += dir.dRow;
					c += dir.dCol;
					l += dir.dLevel;
				}
			}
		}

		return false;
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
