/**
 * Skud Pai Sho Game Test
 * Tests game notation replay and board state validation
 */

import { describe, it, expect, vi, beforeAll } from 'vitest';

// Mock PaiShoMain before any imports that depend on it
vi.mock('../js/PaiShoMain', () => {
	return {
		// Mock functions that try to access DOM
		setGameLogText: vi.fn(),
		showBadMoveModal: vi.fn(),
		closeModal: vi.fn(),
		showModal: vi.fn(),
		// Mock constants
		BRAND_NEW: 'Brand New',
		MOVE_DONE: 'Move Done',
		WAITING_FOR_ENDPOINT: 'Waiting for endpoint',
		WAITING_FOR_BONUS_ENDPOINT: 'Waiting for bonus endpoint',
		READY_FOR_BONUS: 'Ready for bonus',
		WAITING_FOR_BOAT_BONUS_POINT: 'Waiting for boat bonus point',
		HOST: 'Host',
		GUEST: 'Guest',
		gameId: -1,
		currentMoveIndex: 0,
		// Mock game type
		GameType: {
			SkudPaiSho: { id: 1, name: 'Skud Pai Sho' }
		},
		// Mock game options
		ggOptions: [],
		// Mock QueryString for GameData.js debug function
		QueryString: { appType: '' }
	};
});

// Import after mocking
import { SkudPaiShoNotationMove } from '../js/skud-pai-sho/SkudPaiShoGameNotation';
import { SkudPaiShoGameManager } from '../js/skud-pai-sho/SkudPaiShoGameManager';

describe('Skud Pai Sho Game - Notation Parsing', () => {
	it('should parse move 0 (accent tile selection) correctly', () => {
		const move = new SkudPaiShoNotationMove('0H.R,W,K,B');

		expect(move.valid).toBe(true);
		expect(move.moveNum).toBe(0);
		expect(move.playerCode).toBe('H');
		expect(move.accentTiles).toEqual(['R', 'W', 'K', 'B']);
	});

	it('should parse Guest accent tile selection correctly', () => {
		const move = new SkudPaiShoNotationMove('0G.R,W,K,B');

		expect(move.valid).toBe(true);
		expect(move.moveNum).toBe(0);
		expect(move.playerCode).toBe('G');
		expect(move.accentTiles).toEqual(['R', 'W', 'K', 'B']);
	});

	it('should parse planting moves correctly', () => {
		const move = new SkudPaiShoNotationMove('1G.R4(0,-8)');

		expect(move.valid).toBe(true);
		expect(move.moveNum).toBe(1);
		expect(move.playerCode).toBe('G');
		expect(move.moveType).toBe('Planting');
		expect(move.plantedFlowerType).toBe('R4');
		expect(move.endPoint).toBeDefined();
		expect(move.endPoint.x).toBe(0);
		expect(move.endPoint.y).toBe(-8);
	});

	it('should parse Host planting move correctly', () => {
		const move = new SkudPaiShoNotationMove('1H.R4(0,8)');

		expect(move.valid).toBe(true);
		expect(move.moveNum).toBe(1);
		expect(move.playerCode).toBe('H');
		expect(move.moveType).toBe('Planting');
		expect(move.plantedFlowerType).toBe('R4');
		expect(move.endPoint).toBeDefined();
		expect(move.endPoint.x).toBe(0);
		expect(move.endPoint.y).toBe(8);
	});

	it('should parse arranging moves correctly', () => {
		const move = new SkudPaiShoNotationMove('3G.(8,0)-(3,0)');

		expect(move.valid).toBe(true);
		expect(move.moveNum).toBe(3);
		expect(move.playerCode).toBe('G');
		expect(move.moveType).toBe('Arranging');
		expect(move.startPoint).toBeDefined();
		expect(move.startPoint.x).toBe(8);
		expect(move.startPoint.y).toBe(0);
		expect(move.endPoint).toBeDefined();
		expect(move.endPoint.x).toBe(3);
		expect(move.endPoint.y).toBe(0);
	});

	it('should parse arranging moves with harmony bonus correctly', () => {
		const move = new SkudPaiShoNotationMove('4H.(-8,0)-(-7,4)+R4(-8,0)');

		expect(move.valid).toBe(true);
		expect(move.moveNum).toBe(4);
		expect(move.playerCode).toBe('H');
		expect(move.moveType).toBe('Arranging');
		expect(move.startPoint).toBeDefined();
		expect(move.startPoint.x).toBe(-8);
		expect(move.startPoint.y).toBe(0);
		expect(move.endPoint).toBeDefined();
		expect(move.endPoint.x).toBe(-7);
		expect(move.endPoint.y).toBe(4);
		expect(move.bonusTileCode).toBeDefined();
		expect(move.bonusEndPoint).toBeDefined();
		expect(move.bonusEndPoint.x).toBe(-8);
		expect(move.bonusEndPoint.y).toBe(0);
	});

	it('should parse complex arranging move with bonus (move 5G)', () => {
		const move = new SkudPaiShoNotationMove('5G.(3,0)-(3,-4)+R3(0,-8)');

		expect(move.valid).toBe(true);
		expect(move.moveNum).toBe(5);
		expect(move.playerCode).toBe('G');
		expect(move.moveType).toBe('Arranging');
		expect(move.bonusTileCode).toBeDefined();
	});
});

describe('Skud Pai Sho Game - Game Logic', () => {
	let gameManager;

	beforeAll(() => {
		// Create a mock actuator
		const mockActuator = {
			actuate: vi.fn()
		};

		// Initialize game manager with no actuate
		gameManager = new SkudPaiShoGameManager(mockActuator, true, true);
	});

	it('should initialize a game board correctly', () => {
		expect(gameManager).toBeDefined();
		expect(gameManager.board).toBeDefined();
		expect(gameManager.board.cells).toBeDefined();
		expect(gameManager.board.cells.length).toBe(17); // Board should be 17x17
		expect(gameManager.tileManager).toBeDefined();
	});

	it('should replay a complete game from notation', () => {
		const gameNotation = [
			'0H.R,W,K,B',
			'0G.R,W,K,B',
			'1G.R4(0,-8)',
			'1H.R4(0,8)',
			'2G.R5(8,0)',
			'2H.R5(-8,0)',
			'3G.(8,0)-(3,0)',
			'3H.(0,8)-(0,4)',
			'4G.(0,-8)-(0,-4)',
			'4H.(-8,0)-(-7,4)+R4(-8,0)',
			'5G.(3,0)-(3,-4)+R3(0,-8)',
			'5H.(-8,0)-(-7,-1)+R5(8,0)',
			'6G.(0,-8)-(0,-5)+R4(0,-8)',
			'6H.(8,0)-(7,-1)+R4(8,0)',
			'7G.(0,-8)-(0,-6)+K(1,4)',
			'7H.(8,0)-(7,3)+W(-8,4)'
		];

		// Run each move through the game
		gameNotation.forEach((notationText, index) => {
			const move = new SkudPaiShoNotationMove(notationText);

			// Verify the move was parsed correctly
			expect(move.valid).toBe(true);

			// Run the move (without UI actuate to avoid DOM dependencies)
			try {
				const result = gameManager.runNotationMove(move, false);
				console.log(`✓ Move ${move.moveNum}${move.playerCode}: ${notationText}`);
			} catch (error) {
				console.error(`✗ Move ${move.moveNum}${move.playerCode} failed: ${notationText}`, error.message);
				throw error;
			}
		});

		// Verify the game state after all moves
		const board = gameManager.board;
		expect(board).toBeDefined();
		expect(board.cells).toBeDefined();

		// Check that tiles were actually placed on the board
		let tilesOnBoard = 0;
		for (let row = 0; row < board.cells.length; row++) {
			if (board.cells[row]) {
				for (let col = 0; col < board.cells[row].length; col++) {
					const point = board.cells[row][col];
					if (point && point.hasTile()) {
						tilesOnBoard++;
						console.log(`Tile at [${row},${col}]: ${point.tile?.code}`);
					}
				}
			}
		}

		// We should have multiple tiles on the board after all those moves
		expect(tilesOnBoard).toBeGreaterThan(0);
		console.log(`\nTotal tiles on board: ${tilesOnBoard}`);
	});
});
