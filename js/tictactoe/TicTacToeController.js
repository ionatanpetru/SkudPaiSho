/**
 * TicTacToeController - Main controller for Tic Tac Toe game
 */

import { GUEST, HOST } from '../CommonNotationObjects';
import {
	activeAi,
	activeAi2,
	callSubmitMove,
	createGameIfThatIsOk,
	currentMoveIndex,
	finalizeMove,
	GameType,
	getCurrentPlayer,
	myTurn,
	onlinePlayEnabled,
	playingOnlineGame,
	rerunAll,
	WAITING_FOR_ENDPOINT
} from '../PaiShoMain';
import { TicTacToeActuator } from './TicTacToeActuator';
import { TicTacToeGameManager } from './TicTacToeGameManager';
import {
	TicTacToeGameNotation,
	TicTacToeNotationBuilder
} from './TicTacToeGameNotation';
import { TicTacToeSmartAI } from './ai/TicTacToeSmartAI';

export class TicTacToeController {
	constructor(gameContainer, isMobile) {
		this.isMobile = isMobile;

		// Create actuator with cell click callback
		this.actuator = new TicTacToeActuator(
			gameContainer,
			isMobile,
			(row, col) => this.cellClicked(row, col),
			this.getHostTilesContainerDivs(),
			this.getGuestTilesContainerDivs()
		);

		this.resetGameManager();
		this.resetNotationBuilder();
		this.resetGameNotation();

		// Initial render
		this.theGame.actuate();
	}

	getGameTypeId() {
		return GameType.TicTacToe.id;
	}

	completeSetup() {
		// Nothing special needed
	}

	resetGameManager() {
		this.theGame = new TicTacToeGameManager(this.actuator);
	}

	resetNotationBuilder() {
		this.notationBuilder = new TicTacToeNotationBuilder();
	}

	resetGameNotation() {
		this.gameNotation = this.getNewGameNotation();
	}

	getNewGameNotation() {
		return new TicTacToeGameNotation();
	}

	getHostTilesContainerDivs() {
		return "<div class='tictactoeTileContainer'>" +
			"<div class='tictactoePlayerIndicator tictactoeX'>X (Host)</div>" +
			"</div>";
	}

	getGuestTilesContainerDivs() {
		return "<div class='tictactoeTileContainer'>" +
			"<div class='tictactoePlayerIndicator tictactoeO'>O (Guest)</div>" +
			"</div>";
	}

	callActuate() {
		this.theGame.actuate();
	}

	resetMove() {
		if (this.notationBuilder.status !== WAITING_FOR_ENDPOINT) {
			this.gameNotation.removeLastMove();
		}

		this.actuator.clearPossibleMoves();
		rerunAll();
	}

	getDefaultHelpMessageText() {
		return "<h4>Tic Tac Toe</h4>" +
			"<p>The classic game of Xs and Os!</p>" +
			"<p><strong>Objective:</strong> Get three of your marks in a row " +
			"(horizontally, vertically, or diagonally).</p>" +
			"<p><strong>How to Play:</strong></p>" +
			"<ul>" +
			"<li>Players take turns placing their mark (X or O)</li>" +
			"<li>X always goes first</li>" +
			"<li>Click an empty cell to place your mark</li>" +
			"<li>First to get three in a row wins!</li>" +
			"</ul>";
	}

	getAdditionalMessage() {
		const container = document.createElement('span');

		if (this.theGame.getWinner()) {
			const winnerText = this.theGame.getWinner() === HOST ? 'X (Host)' : 'O (Guest)';
			container.textContent = `${winnerText} wins!`;
		} else if (this.theGame.isDraw()) {
			container.textContent = "It's a draw!";
		} else if (this.gameNotation.moves.length === 0) {
			container.textContent = 'X goes first. Click a cell to play.';
		}

		return container;
	}

	cellClicked(row, col) {
		if (this.theGame.hasEnded()) {
			return;
		}
		if (!myTurn()) {
			return;
		}
		if (currentMoveIndex !== this.gameNotation.moves.length) {
			return;
		}

		// Check if this is a valid move
		if (!this.theGame.board.canPlace(row, col)) {
			return;
		}

		// Build the move
		this.notationBuilder.setCell(row, col);
		this.completeMove();
	}

	// Required for compatibility with Main's pointClicked
	pointClicked(htmlPoint) {
		// Not used for TicTacToe - we handle clicks in cellClicked
	}

	getTileMessage(tileDiv) {
		return '';
	}

	getPointMessage(htmlPoint) {
		return '';
	}

	playAiTurn(finalizeCallback) {
		if (this.theGame.getWinner() || this.theGame.isDraw()) {
			return;
		}

		var theAi = activeAi;
		if (activeAi2) {
			if (activeAi2.player === getCurrentPlayer()) {
				theAi = activeAi2;
			}
		}

		var playerMoveNum = this.gameNotation.getPlayerMoveNum();

		var self = this;
		setTimeout(function() {
			var move = theAi.getMove(self.theGame.getCopy(), playerMoveNum);
			if (!move) {
				return;
			}
			self.theGame.runNotationMove(move);
			self.gameNotation.addMove(move);
			finalizeCallback();
		}, 300);
	}

	startAiGame(finalizeCallback) {
		this.playAiTurn(finalizeCallback);
	}

	getAiList() {
		return [new TicTacToeSmartAI()];
	}

	getCurrentPlayer() {
		return this.gameNotation.moves.length % 2 === 0 ? HOST : GUEST;
	}

	cleanup() {
		if (this.actuator) {
			this.actuator.cleanup();
		}
	}

	isSolitaire() {
		return false;
	}

	setGameNotation(newGameNotation) {
		this.gameNotation.setNotationText(newGameNotation);
	}

	completeMove() {
		const player = this.getCurrentPlayer();
		const move = this.gameNotation.getNotationMoveFromBuilder(this.notationBuilder, player);

		if (!move) {
			return;
		}

		this.theGame.runNotationMove(move);
		this.gameNotation.addMove(move);
		this.notationBuilder.reset();

		if (onlinePlayEnabled && this.gameNotation.moves.length === 1) {
			createGameIfThatIsOk(this.getGameTypeId());
		} else {
			if (playingOnlineGame()) {
				callSubmitMove();
			} else {
				finalizeMove();
			}
		}
	}
}
