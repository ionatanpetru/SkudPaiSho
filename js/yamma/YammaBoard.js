/**
 * YammaBoard - Represents the 3D pyramid game board state
 *
 * Yamma is a 3D four-in-a-row game.
 * Cubes show 3 faces from 3 different viewing angles.
 * Each cube has 3 white sides and 3 blue sides.
 *
 * Pyramid structure:
 * - Level 0: 5x5 grid (25 positions)
 * - Level 1: 4x4 grid (16 positions) - cubes rest in valleys between level 0 cubes
 * - Level 2: 3x3 grid (9 positions)
 * - Level 3: 2x2 grid (4 positions)
 * - Level 4: 1x1 grid (1 position) - top of pyramid
 *
 * A cube at level z position (x,y) needs 4 cubes below at level z-1:
 * positions (x,y), (x+1,y), (x,y+1), (x+1,y+1)
 */

export const PLAYER = {
	WHITE: 'white',
	BLUE: 'blue',
	NEUTRAL: 'neutral'
};

// Cube face colors - opposite faces have same color
export const CubeFaceOrientation = {
	FRONT: 0,  // Facing the "front" view angle
	LEFT: 1,   // Facing the "left" view angle
	RIGHT: 2   // Facing the "right" view angle
};

export class YammaCube {
	constructor(owner, x, y, z = 0) {
		this.owner = owner;
		this.x = x;
		this.y = y;
		this.z = z; // Height level

		// Which color shows from each of 3 viewing directions
		this.frontFace = owner;
		this.leftFace = owner === PLAYER.WHITE ? PLAYER.BLUE : PLAYER.WHITE;
		this.rightFace = owner === PLAYER.WHITE ? PLAYER.BLUE : PLAYER.WHITE;
	}

	getFaceColor(viewAngle) {
		switch(viewAngle) {
			case 0: return this.frontFace;
			case 1: return this.leftFace;
			case 2: return this.rightFace;
			default: return this.frontFace;
		}
	}
}

export class YammaBoard {
	constructor() {
		// Base grid size
		this.baseGridSize = 5;
		// Maximum height (levels 0-4)
		this.maxHeight = 5;

		// levels[z][x][y] = cube or null
		// Each level has a grid of size (baseGridSize - z)
		this.levels = [];

		this.initializeBoard();
	}

	initializeBoard() {
		this.levels = [];
		for (let z = 0; z < this.maxHeight; z++) {
			const gridSize = this.getGridSizeAtLevel(z);
			this.levels[z] = [];
			for (let x = 0; x < gridSize; x++) {
				this.levels[z][x] = [];
				for (let y = 0; y < gridSize; y++) {
					this.levels[z][x][y] = null;
				}
			}
		}
	}

	getGridSizeAtLevel(z) {
		return this.baseGridSize - z;
	}

	isValidPosition(x, y, z) {
		if (z < 0 || z >= this.maxHeight) {
			return false;
		}
		const gridSize = this.getGridSizeAtLevel(z);
		return x >= 0 && x < gridSize && y >= 0 && y < gridSize;
	}

	getCubeAt(x, y, z) {
		if (!this.isValidPosition(x, y, z)) {
			return null;
		}
		return this.levels[z][x][y];
	}

	hasSupport(x, y, z) {
		if (z === 0) {
			return true; // Ground level always has support
		}

		// Need 4 cubes at level z-1 to form a valley
		// A cube at level z position (x,y) needs support from:
		// level z-1 positions: (x,y), (x+1,y), (x,y+1), (x+1,y+1)
		const supports = [
			this.getCubeAt(x, y, z - 1),
			this.getCubeAt(x + 1, y, z - 1),
			this.getCubeAt(x, y + 1, z - 1),
			this.getCubeAt(x + 1, y + 1, z - 1)
		];

		// All 4 must be present
		return supports.every(cube => cube !== null);
	}

	canPlaceCube(x, y, z) {
		if (!this.isValidPosition(x, y, z)) {
			return false;
		}

		// Position must be empty
		if (this.getCubeAt(x, y, z) !== null) {
			return false;
		}

		// Must have support
		return this.hasSupport(x, y, z);
	}

	placeCube(x, y, z, player) {
		if (!this.canPlaceCube(x, y, z)) {
			return null;
		}

		const cube = new YammaCube(player, x, y, z);
		this.levels[z][x][y] = cube;

		return cube;
	}

	getAllCubes() {
		const cubes = [];
		for (let z = 0; z < this.maxHeight; z++) {
			const gridSize = this.getGridSizeAtLevel(z);
			for (let x = 0; x < gridSize; x++) {
				for (let y = 0; y < gridSize; y++) {
					const cube = this.levels[z][x][y];
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

		for (let z = 0; z < this.maxHeight; z++) {
			const gridSize = this.getGridSizeAtLevel(z);
			for (let x = 0; x < gridSize; x++) {
				for (let y = 0; y < gridSize; y++) {
					if (this.canPlaceCube(x, y, z)) {
						moves.push({ x, y, z });
					}
				}
			}
		}

		return moves;
	}

	/**
	 * Get the world position for a cube at grid position (x, y, z)
	 * Upper levels are offset to sit in the valleys between lower cubes
	 */
	getWorldPosition(x, y, z, slotSpacing = 1.2) {
		// Each level is offset by 0.5 grid units in both x and y
		const worldX = (x + 0.5 * z) * slotSpacing;
		const worldY = (y + 0.5 * z) * slotSpacing;
		return { worldX, worldY };
	}

	/**
	 * Check for 4-in-a-row from a specific viewing angle
	 * For pyramid stacking, we need to check the visible faces from each angle
	 */
	checkWinFromAngle(viewAngle) {
		const projection = this.getProjection(viewAngle);
		return this.checkWinIn2D(projection);
	}

	/**
	 * Project the 3D pyramid to 2D from a viewing angle
	 * Each position shows the topmost visible face color
	 */
	getProjection(viewAngle) {
		// For the base grid, check what's visible at each position
		// Higher cubes obscure lower ones
		const projection = [];

		for (let x = 0; x < this.baseGridSize; x++) {
			projection[x] = [];
			for (let y = 0; y < this.baseGridSize; y++) {
				projection[x][y] = null;
			}
		}

		// Go through all cubes and project them onto the base grid
		// Higher z values will overwrite lower ones at the same projected position
		for (let z = 0; z < this.maxHeight; z++) {
			const gridSize = this.getGridSizeAtLevel(z);
			for (let x = 0; x < gridSize; x++) {
				for (let y = 0; y < gridSize; y++) {
					const cube = this.getCubeAt(x, y, z);
					if (cube) {
						// Project this cube onto the base grid
						// For simplicity, we'll use the cube's own grid position
						// In a full implementation, the projection would depend on view angle
						const projX = x;
						const projY = y;

						if (projX < this.baseGridSize && projY < this.baseGridSize) {
							projection[projX][projY] = cube.getFaceColor(viewAngle);
						}
					}
				}
			}
		}

		return projection;
	}

	/**
	 * Check for 4-in-a-row in a 2D projection
	 */
	checkWinIn2D(projection) {
		const size = this.baseGridSize;
		const directions = [
			{ dx: 1, dy: 0 },  // Horizontal
			{ dx: 0, dy: 1 },  // Vertical
			{ dx: 1, dy: 1 },  // Diagonal down-right
			{ dx: 1, dy: -1 }  // Diagonal up-right
		];

		for (let x = 0; x < size; x++) {
			for (let y = 0; y < size; y++) {
				const startColor = projection[x][y];
				if (!startColor) continue;

				for (const dir of directions) {
					if (this.checkLine(projection, x, y, dir.dx, dir.dy, startColor)) {
						return startColor;
					}
				}
			}
		}

		return null;
	}

	checkLine(projection, startX, startY, dx, dy, color) {
		let count = 0;
		let x = startX;
		let y = startY;

		while (x >= 0 && x < this.baseGridSize && y >= 0 && y < this.baseGridSize) {
			if (projection[x][y] === color) {
				count++;
				if (count >= 4) {
					return true;
				}
			} else {
				break;
			}
			x += dx;
			y += dy;
		}

		return false;
	}

	/**
	 * Check for winner from all 3 viewing angles
	 */
	checkWinner() {
		for (let angle = 0; angle < 3; angle++) {
			const winner = this.checkWinFromAngle(angle);
			if (winner) {
				return { winner, angle };
			}
		}
		return null;
	}

	/**
	 * Check if the game is a draw (no moves possible with no winner)
	 */
	isBoardFull() {
		return this.getPossibleMoves().length === 0;
	}

	getCopy() {
		const copy = new YammaBoard();

		for (let z = 0; z < this.maxHeight; z++) {
			const gridSize = this.getGridSizeAtLevel(z);
			for (let x = 0; x < gridSize; x++) {
				for (let y = 0; y < gridSize; y++) {
					const cube = this.levels[z][x][y];
					if (cube) {
						const cubeCopy = new YammaCube(cube.owner, cube.x, cube.y, cube.z);
						cubeCopy.frontFace = cube.frontFace;
						cubeCopy.leftFace = cube.leftFace;
						cubeCopy.rightFace = cube.rightFace;
						copy.levels[z][x][y] = cubeCopy;
					}
				}
			}
		}

		return copy;
	}
}
