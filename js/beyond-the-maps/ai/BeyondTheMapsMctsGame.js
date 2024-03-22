import { BeyondTheMapsAiHelp } from './BeyondTheMapsAiHelp';
import { BeyondTheMapsGameManager } from '../BeyondTheMapsGameManager';
import { debug } from '../../GameData';
import { Action, Game } from '../../ai/jsmcts';
import { HOST } from '../../CommonNotationObjects';


export class BeyondTheMapsMctsGame {

    constructor(playerName){
        this.state = {
			gameManager: new BeyondTheMapsGameManager(null, true, true),
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
		var aiHelp = new BeyondTheMapsAiHelp();
		return aiHelp.getAllPossibleMoves(this.state.gameManager.getCopy(), this.state.gameManager.getNextPlayerName());
	}

    // playMove(move){/* play a move, move being an element from .moves() list */}
	playMove(move) {
		if (!move || !move.moveData) {
			this.state.gameManager.debugPrintBoard();
			debug("No moveData");
		}
		for (var i = 0; i < move.moveData.phases.length; i++) {
			this.state.gameManager.runNotationMove(move, i, false, true, false, false);
		}
	}

    // gameOver(){/* true if game is over, false otherwise */}
	gameOver() {
		return this.state.gameManager.getWinResultTypeCode() > 0;
	}

    // winner(){/* number of winning player, -1 if draw" */}
	winner() {
		var winResultCode = this.state.gameManager.getWinResultTypeCode();
		if (winResultCode === 4) {
			return -1;
		} else if (winResultCode === 1) {
			return this.state.gameManager.getWinner();
		}
	}

}



/* --- */




export class BtmAction extends Action {
	constructor(move) {
		super();
		this.move = move;
	}

	toString() {
		return "" + JSON.stringify(this.move);
	}
}

export class BtmGame extends Game {
	constructor(o) {
		if (o instanceof Game) {
			super(o);
			this.state = {
				gameManager: o.state.gameManager.getCopy()
			};
		} else {
			super({ nPlayers: 2 });
			this.state = {
				gameManager: new BeyondTheMapsGameManager(null, true, true)
			}
		}
	}

	copyGame() {
		return new BtmGame(this);
	}

	toString() {
		return this.state.gameManager.getDebugPrintBoardStr();
	}

	allActions() {
		var aiHelp = new BeyondTheMapsAiHelp();
		var moves = aiHelp.getAllPossibleMoves(this.state.gameManager.getCopy(), this.state.gameManager.getNextPlayerName());
		var actions = [];
		moves.forEach(move => {
			actions.push(new BtmAction(move));
		});
		return actions;
	}

	doAction(a) {
		super.doAction(a);

		if (!a.move || !a.move.moveData) {
			this.state.gameManager.debugPrintBoard();
			debug("No moveData");
		}
		for (var i = 0; i < a.move.moveData.phases.length; i++) {
			this.state.gameManager.runNotationMove(a.move, i, false, true, false, false);
		}

		var winResultCode = this.state.gameManager.getWinResultTypeCode();
		if (winResultCode === 4) {
			this.winner = 0;
		} else if (winResultCode === 1) {
			this.winner = this.state.gameManager.getWinner() === HOST ? 1 : 2;
		}

		if (!this.isGameOver()) {
			this.currentTurn++;
			this.currentPlayer = (this.currentPlayer % 2) + 1;
		}
	}
}
