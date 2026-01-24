import { GUEST, HOST } from '../CommonNotationObjects';
import { VagabondAiHelp } from './ai/VagabondAiHelp';
import { VagabondGameManager } from './VagabondGameManager';
import { VagabondGameNotation } from './VagabondGameNotation';

export const VagabondNotationBgIoGame = {
	setup: () => {
		return {
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
		var gameManager = buildGame(G);
		if (gameManager.hasEnded()) {
			if (gameManager.gameHasEndedInDraw) {
				return { draw: true };
			} else {
				return { winner: ctx.currentPlayer };
			}
		}
	},

	ai: {
		enumerate: (G, ctx) => {
			var gameManager = buildGame(G);
			var aiHelp = new VagabondAiHelp();
			var moveObjects = aiHelp.getAllPossibleMoves(gameManager, ctx.currentPlayer === '0' ? HOST : GUEST);
			var moves = [];
			moveObjects.forEach(moveObject => {
				moves.push({ move: 'addMoveNotation', args: [moveObject.fullMoveText] });
			});
			return moves;
		}
	}
};

function buildGame(G) {
	var gameManager = new VagabondGameManager(null, true, true);
	var gameNotation = new VagabondGameNotation();
	gameNotation.setNotationText(G.notation);
	gameNotation.moves.forEach(move => {
		gameManager.runNotationMove(move, false);
	});
	return gameManager;
}


/* --- */




export class VagabondMctsGame {

    constructor(playerName){
        this.state = {
			gameManager: new VagabondGameManager(null, true, true),
			playerName: playerName
		};
    }

    // getState(){/*returns a single object representing game state*/}
	getState() {
		return this.state;
	}

    // setState(state){/* set game internal state */}
	setState(state) {
		this.state = state;
	}

    // cloneState(){/* returns a DEEP copy of game state */}
	cloneState() {
		return {
			gameManager: this.state.gameManager.getCopy(),
			playerName: this.state.playerName
		}
	}

    // moves(){/* returns list of valid moves given current game state*/}
	moves() {
		var aiHelp = new VagabondAiHelp();
		// aiHelp.moveNum = 
		return aiHelp.getAllPossibleMoves(this.state.gameManager.getCopy(), this.state.gameManager.getNextPlayerName());
	}

    // playMove(move){/* play a move, move being an element from .moves() list */}
	playMove(move) {
		this.state.gameManager.runNotationMove(move);
	}

    // gameOver(){/* true if game is over, false otherwise */}
	gameOver() {
		return this.state.gameManager.hasEnded();
	}

    // winner(){/* number of winning player, -1 if draw" */}
	winner() {
		if (this.state.gameManager.hasEnded()) {
			if (this.state.gameManager.gameHasEndedInDraw) {
				return -1;
			} else {
				return this.state.gameManager.getWinner();
			}
		}
	}
}


