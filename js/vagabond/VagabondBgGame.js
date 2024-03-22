import { INVALID_MOVE } from 'boardgame.io/core';

import { GUEST, HOST } from '../CommonNotationObjects';
import { VagabondAiHelp } from './ai/VagabondAiHelp';
import { VagabondBoard } from './VagabondBoard';
import { VagabondGameManager } from './VagabondGameManager';
import { VagabondGameNotation } from './VagabondGameNotation';
import { VagabondTileManager } from './VagabondTileManager';

export const TicTacToe = {
	setup: () => ({ cells: Array(9).fill(null) }),

	/*
	Note, setup takes object as parameter like move functions:
	setup: ({ G, playerID }) => ({ cells: Array(9).fill(null) }), ???
	 */

	turn: {
		minMoves: 1,
		maxMoves: 1,
	},

	moves: {
		clickCell: ({ G, playerID }, id) => {
			if (G.cells[id] !== null) {
				return INVALID_MOVE;
			}
			G.cells[id] = playerID;
		},
	},

	endIf: ({ G, ctx }) => {
		if (IsVictory(G.cells)) {
			return { winner: ctx.currentPlayer };
		}
		if (IsDraw(G.cells)) {
			return { draw: true };
		}
	},

	ai: {
		enumerate: (G, ctx) => {
			let moves = [];
			for (let i = 0; i < 9; i++) {
				if (G.cells[i] === null) {
					moves.push({ move: 'clickCell', args: [i] });
				}
			}
			return moves;
		},
	},
};


/* Helper methods */

// Return true if `cells` is in a winning configuration.
function IsVictory(cells) {
	const positions = [
		[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6],
		[1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]
	];

	const isRowComplete = row => {
		const symbols = row.map(i => cells[i]);
		return symbols.every(i => i !== null && i === symbols[0]);
	};

	return positions.map(isRowComplete).some(i => i === true);
}

// Return true if all `cells` are occupied.
function IsDraw(cells) {
	return cells.filter(c => c === null).length === 0;
}




// -------------------- 

export const VagabondBgIoGame = {
	setup: () => {
		var newBoard = new VagabondBoard();
		var boardState = newBoard.getBgIoState();

		var newTileManager = new VagabondTileManager();
		var tileManagerState = newTileManager.getBgIoState();

		return {
			boardState,
			tileManagerState
		}
	},

	turn: {
		minMoves: 1,
		maxMoves: 1
	},

	moves: {
		makeMove: ({ G, playerID }, moveNotation) => {
			//
		},
	},

	endIf: ({ G, ctx }) => {
		//
	},

	ai: {
		enumerate: (G, ctx) => {
			// return all possible moves
		}
	}
};




