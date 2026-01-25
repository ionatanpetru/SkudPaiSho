/**
 * Yamma Game Test
 * Tests game notation replay and projected view validation
 */

import { describe, it, expect, vi, beforeAll } from 'vitest';

// Mock PaiShoMain before any imports that depend on it
vi.mock('../js/PaiShoMain', () => {
	return {
		setGameLogText: vi.fn(),
		showBadMoveModal: vi.fn(),
		closeModal: vi.fn(),
		showModal: vi.fn(),
		BRAND_NEW: 'Brand New',
		MOVE_DONE: 'Move Done',
		HOST: 'Host',
		GUEST: 'Guest',
		gameId: -1,
		currentMoveIndex: 0,
		GameType: {
			Yamma: { id: 100, name: 'Yamma' }
		},
		ggOptions: []
	};
});

// Import after mocking
import { YammaNotationMove } from '../js/yamma/YammaGameNotation';
import { YammaGameManager } from '../js/yamma/YammaGameManager';
import { YammaBoard, PLAYER } from '../js/yamma/YammaBoard';

describe('Yamma Game - Notation Parsing', () => {
	it('should parse Host move notation correctly', () => {
		const move = new YammaNotationMove('H:5,0,0,0');

		expect(move.player).toBe('HOST');
		expect(move.row).toBe(5);
		expect(move.col).toBe(0);
		expect(move.level).toBe(0);
		expect(move.rotation).toBe(0);
	});

	it('should parse Guest move notation correctly', () => {
		const move = new YammaNotationMove('G:5,5,0,0');

		expect(move.player).toBe('GUEST');
		expect(move.row).toBe(5);
		expect(move.col).toBe(5);
		expect(move.level).toBe(0);
		expect(move.rotation).toBe(0);
	});

	it('should parse move with level correctly', () => {
		const move = new YammaNotationMove('H:4,2,1,0');

		expect(move.player).toBe('HOST');
		expect(move.row).toBe(4);
		expect(move.col).toBe(2);
		expect(move.level).toBe(1);
		expect(move.rotation).toBe(0);
	});
});

describe('Yamma Game - Projected Views', () => {
	let gameManager;
	let board;

	beforeAll(() => {
		// Create a mock actuator
		const mockActuator = {
			actuate: vi.fn()
		};

		// Initialize game manager
		gameManager = new YammaGameManager(mockActuator);

		// Run the test game notation
		const gameNotation = [
			'H:5,0,0,0',
			'G:5,5,0,0',
			'H:0,0,0,0',
			'G:5,2,0,0',
			'H:4,2,0,0',
			'G:5,3,0,0',
			'H:4,2,1,0'
		];

		gameNotation.forEach((notationText) => {
			const move = new YammaNotationMove(notationText);
			gameManager.runNotationMove(move, false);
		});

		board = gameManager.board;
	});

	/**
	 * Helper function to convert a projected view to a string representation
	 * W = White, B = Blue, x = empty
	 */
	function viewToString(view) {
		const lines = [];
		for (let row = 0; row < view.length; row++) {
			let line = '';
			for (let col = 0; col <= row; col++) {
				const color = view[row][col];
				if (color === PLAYER.WHITE) {
					line += 'W';
				} else if (color === PLAYER.BLUE) {
					line += 'B';
				} else {
					line += 'x';
				}
			}
			lines.push(line);
		}
		return lines.join('\n');
	}

	/**
	 * Helper function to parse expected view string into comparable format
	 */
	function parseExpectedView(viewString) {
		return viewString.trim().split('\n').map(line => line.trim());
	}

	it('should produce correct Front view after game moves', () => {
		const frontView = board.buildProjectedView(0); // Front = angle 0
		const viewString = viewToString(frontView);

		const expectedFront = `
B
xx
xxx
xxxx
xxBxx
BxWWxW
		`;

		const expected = parseExpectedView(expectedFront);
		const actual = viewString.split('\n');

		console.log('Front View (actual):');
		console.log(viewString);
		console.log('\nFront View (expected):');
		console.log(expected.join('\n'));

		expect(actual).toEqual(expected);
	});

	it('should produce correct Left view after game moves', () => {
		const leftView = board.buildProjectedView(1); // Left = angle 1
		const viewString = viewToString(leftView);

		const expectedLeft = `
B
xx
xxW
xxWB
xxxxx
WxxxxW
		`;

		const expected = parseExpectedView(expectedLeft);
		const actual = viewString.split('\n');

		console.log('Left View (actual):');
		console.log(viewString);
		console.log('\nLeft View (expected):');
		console.log(expected.join('\n'));

		expect(actual).toEqual(expected);
	});

	it('should produce correct Right view after game moves', () => {
		const rightView = board.buildProjectedView(2); // Right = angle 2
		const viewString = viewToString(rightView);

		const expectedRight = `
W
xx
Wxx
BWxx
xxxxx
BxxxxW
		`;

		const expected = parseExpectedView(expectedRight);
		const actual = viewString.split('\n');

		console.log('Right View (actual):');
		console.log(viewString);
		console.log('\nRight View (expected):');
		console.log(expected.join('\n'));

		expect(actual).toEqual(expected);
	});
});

describe('Yamma Game - Board State', () => {
	it('should correctly place cubes and track their positions', () => {
		const board = new YammaBoard();

		// Place a cube at level 0
		const cube1 = board.placeCube(5, 0, 0, PLAYER.WHITE, 0);
		expect(cube1).not.toBeNull();
		expect(cube1.owner).toBe(PLAYER.WHITE);
		expect(cube1.row).toBe(5);
		expect(cube1.col).toBe(0);
		expect(cube1.level).toBe(0);

		// Verify we can retrieve it
		const retrieved = board.getCubeAt(5, 0, 0);
		expect(retrieved).toBe(cube1);
	});

	it('should require support for cubes at higher levels', () => {
		const board = new YammaBoard();

		// Cannot place at level 1 without support
		expect(board.canPlaceCube(0, 0, 1)).toBe(false);

		// Place 3 supporting cubes at level 0
		board.placeCube(0, 0, 0, PLAYER.WHITE, 0);
		board.placeCube(1, 0, 0, PLAYER.WHITE, 0);
		board.placeCube(1, 1, 0, PLAYER.WHITE, 0);

		// Now we can place at level 1
		expect(board.canPlaceCube(0, 0, 1)).toBe(true);
	});
});
