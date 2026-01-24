/**
 * YammaController - Main controller for Yamma game
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
	BRAND_NEW,
	WAITING_FOR_ENDPOINT
} from '../PaiShoMain';
import { YammaActuator } from './YammaActuator';
import { YammaGameManager } from './YammaGameManager';
import {
	YammaGameNotation,
	YammaNotationBuilder
} from './YammaGameNotation';
import { YammaRandomAI } from './ai/YammaRandomAI';

export class YammaController {
	constructor(gameContainer, isMobile) {
		this.isMobile = isMobile;

		// Create actuator with slot click callback
		this.actuator = new YammaActuator(
			gameContainer,
			isMobile,
			(row, col, level) => this.slotClicked(row, col, level),
			this.getHostTilesContainerDivs(),
			this.getGuestTilesContainerDivs()
		);

		this.resetGameManager();
		this.resetNotationBuilder();
		this.resetGameNotation();

		// Initial render to show available slots
		this.theGame.actuate();
	}

	getGameTypeId() {
		return GameType.Yamma.id;
	}

	completeSetup() {
		// Nothing special needed
	}

	resetGameManager() {
		this.theGame = new YammaGameManager(this.actuator);
	}

	resetNotationBuilder() {
		this.notationBuilder = new YammaNotationBuilder();
	}

	resetGameNotation() {
		this.gameNotation = this.getNewGameNotation();
	}

	getNewGameNotation() {
		return new YammaGameNotation();
	}

	getHostTilesContainerDivs() {
		return "<div class='yammaTileContainer'>" +
			"<div class='yammaPlayerIndicator yammaWhite'>White (Host)</div>" +
			"</div>";
	}

	getGuestTilesContainerDivs() {
		return "<div class='yammaTileContainer'>" +
			"<div class='yammaPlayerIndicator yammaBlue'>Blue (Guest)</div>" +
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
		return "<h4>Yamma</h4>" +
			"<p>Inspired by Khanat Sadomwattana's Yamma, this is a 3D four-in-a-row game " +
			"played on a triangular pyramid (tetrahedron).</p>" +
			"<p><strong>Objective:</strong> Be the first to get 4-in-a-row of your color " +
			"when viewed from any of the three perspectives.</p>" +
			"<p><strong>How to Play:</strong></p>" +
			"<ul>" +
			"<li>Players take turns placing cubes on available slots</li>" +
			"<li>Cubes stack in a triangular pyramid - when 3 cubes form a triangle, a new slot appears above</li>" +
			"<li>Each cube shows your color from the front and opponent's from other angles</li>" +
			"<li>The board can be rotated to view from different angles</li>" +
			"<li>Win by aligning 4 cubes of your color in a row</li>" +
			"</ul>" +
			"<p><strong>Controls:</strong></p>" +
			"<ul>" +
			"<li>Click a slot marker to place a cube</li>" +
			"<li>Drag to rotate the view</li>" +
			"<li>Scroll to zoom in/out</li>" +
			"</ul>";
	}

	getAdditionalMessage() {
		const container = document.createElement('span');

		if (this.theGame.getWinner()) {
			const winnerText = this.theGame.getWinner() === HOST ? 'White (Host)' : 'Blue (Guest)';
			const angleNames = ['Front', 'Left', 'Right'];
			const angleName = angleNames[this.theGame.winningAngle] || '';
			container.textContent = `${winnerText} wins! (4-in-a-row from ${angleName} view)`;
		} else if (this.gameNotation.moves.length === 0) {
			container.textContent = 'Click a slot on the board to place your first cube.';
		}

		return container;
	}

	slotClicked(row, col, level) {
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
		if (!this.theGame.board.canPlaceCube(row, col, level)) {
			return;
		}

		// Build the move
		this.notationBuilder.setPoint(row, col, level);
		this.completeMove();
	}

	// Required for compatibility with Main's pointClicked
	pointClicked(htmlPoint) {
		// Not used for Yamma - we handle clicks in slotClicked
	}

	getTileMessage(tileDiv) {
		return '';
	}

	getPointMessage(htmlPoint) {
		return '';
	}

	playAiTurn(finalizeCallback) {
		if (this.theGame.getWinner()) {
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
		}, 500);
	}

	startAiGame(finalizeCallback) {
		this.playAiTurn(finalizeCallback);
	}

	getAiList() {
		return [new YammaRandomAI()];
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
