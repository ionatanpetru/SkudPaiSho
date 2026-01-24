
export const NotationBgIoGame = {
	setup: ({ ctx, ...plugins }, setupData) => {
		return {
			gameId: setupData.gameId,
			notation: ""
		};
	},

	turn: {
		minMoves: 1,
		maxMoves: 1
	},

	moves: {
		addMoveNotation: ({ G, playerID }, moveNotation) => {
			G.notation = G.notation + moveNotation + ";";
		}
	},

	endIf: ({ G, ctx }) => {
		// Check for end of game
		
	},

	ai: {
		enumerate: (G, ctx) => {
			// return all possible moves
		}
	}
};
