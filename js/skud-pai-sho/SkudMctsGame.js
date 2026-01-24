import { SkudAiHelp } from "../ai/SkudAiHelp.";
import { SkudPaiShoGameManager } from "./SkudPaiShoGameManager";

export class SkudMctsGame {

    constructor(playerName){
        this.state = {
			gameManager: new SkudPaiShoGameManager(null, true, true),
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
		var aiHelp = new SkudAiHelp();
		// aiHelp.moveNum = 
		return aiHelp.getAllPossibleMoves(this.state.gameManager.getCopy(), this.state.gameManager.getNextPlayerName(), this.state.gameManager.lastMoveNum);
	}

    // playMove(move){/* play a move, move being an element from .moves() list */}
	playMove(move) {
		this.state.gameManager.runNotationMove(move);
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
		} else if (winResultCode === 1 || winResultCode === 3) {
			return this.state.gameManager.getWinner();
		}
	}
}
