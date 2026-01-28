/**
 * HexController - Main controller for Hex game
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
	rerunAll
} from '../PaiShoMain';
import { HexActuator } from './HexActuator';
import { HexGameManager } from './HexGameManager';
import {
	HexGameNotation,
	HexNotationBuilder
} from './HexGameNotation';
import { HexStrategicAI } from './ai/HexStrategicAI';

export class HexController {
	constructor(gameContainer, isMobile) {
		this.isMobile = isMobile;

		// Create actuator with cell click callback
		this.actuator = new HexActuator(
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
		return GameType.Hex.id;
	}

	completeSetup() {
		// Nothing special needed
	}

	resetGameManager() {
		this.theGame = new HexGameManager(this.actuator);
	}

	resetNotationBuilder() {
		this.notationBuilder = new HexNotationBuilder();
	}

	resetGameNotation() {
		this.gameNotation = this.getNewGameNotation();
	}

	getNewGameNotation() {
		return new HexGameNotation();
	}

	getHostTilesContainerDivs() {
		return "<div class='hexPlayerContainer'>" +
			"<div class='hexPlayerIndicator' style='background: linear-gradient(135deg, #ff6b6b, #dc2626); color: white; padding: 8px 16px; border-radius: 8px; font-weight: bold;'>Red (Host)</div>" +
			"<div style='color: #9ca3af; font-size: 12px; margin-top: 4px;'>Connect top to bottom</div>" +
			"</div>";
	}

	getGuestTilesContainerDivs() {
		return "<div class='hexPlayerContainer'>" +
			"<div class='hexPlayerIndicator' style='background: linear-gradient(135deg, #60a5fa, #2563eb); color: white; padding: 8px 16px; border-radius: 8px; font-weight: bold;'>Blue (Guest)</div>" +
			"<div style='color: #9ca3af; font-size: 12px; margin-top: 4px;'>Connect left to right</div>" +
			"</div>";
	}

	callActuate() {
		this.theGame.actuate();
	}

	resetMove() {
		this.gameNotation.removeLastMove();
		this.actuator.clearPossibleMoves();
		rerunAll();
	}

	getDefaultHelpMessageText() {
		return "<h4>Hex</h4>" +
			"<p>Hex is a classic abstract strategy game invented in the 1940s by mathematician Piet Hein " +
			"and independently by John Nash (of 'A Beautiful Mind' fame).</p>" +
			"<p><strong>Objective:</strong></p>" +
			"<ul>" +
			"<li><span style='color:#dc2626; font-weight:bold;'>Red (Host)</span>: Connect the top edge to the bottom edge</li>" +
			"<li><span style='color:#2563eb; font-weight:bold;'>Blue (Guest)</span>: Connect the left edge to the right edge</li>" +
			"</ul>" +
			"<p><strong>Rules:</strong></p>" +
			"<ul>" +
			"<li>Players alternate placing one stone per turn</li>" +
			"<li>Stones cannot be moved or removed once placed</li>" +
			"<li>The first player to create an unbroken chain connecting their two edges wins</li>" +
			"<li>Hex can never end in a draw - one player always wins!</li>" +
			"</ul>" +
			"<p><strong>Strategy Tips:</strong></p>" +
			"<ul>" +
			"<li>Control the center for maximum flexibility</li>" +
			"<li>Create 'bridge' connections that can't be blocked</li>" +
			"<li>Look for 'ladder' patterns that force your opponent</li>" +
			"</ul>";
	}

	getAdditionalMessage() {
		const container = document.createElement('span');

		if (this.theGame.getWinner()) {
			const winner = this.theGame.getWinner();
			const winnerText = winner === HOST ? 'Red (Host)' : 'Blue (Guest)';
			const color = winner === HOST ? '#dc2626' : '#2563eb';
			container.innerHTML = `<span style="color:${color}; font-weight:bold;">${winnerText} wins!</span> ${this.theGame.getWinReason()}`;
		} else {
			const currentPlayer = this.getCurrentPlayer();
			const playerText = currentPlayer === HOST ? 'Red' : 'Blue';
			const color = currentPlayer === HOST ? '#dc2626' : '#2563eb';
			container.innerHTML = `<span style="color:${color}; font-weight:bold;">${playerText}'s</span> turn to play`;
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

		// Build and complete the move
		this.notationBuilder.setCell(row, col);
		this.completeMove();
	}

	pointClicked(htmlPoint) {
		// Not used - we handle clicks in cellClicked
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

		let theAi = activeAi;
		if (activeAi2 && activeAi2.player === getCurrentPlayer()) {
			theAi = activeAi2;
		}

		const self = this;
		setTimeout(function() {
			const move = theAi.getMove(self.theGame.getCopy(), self.gameNotation.getPlayerMoveNum());
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
		return [new HexStrategicAI()];
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

		// Show possible moves for next player
		if (!this.theGame.hasEnded()) {
			this.actuator.showPossibleMoves(this.theGame.getPossibleMoves());
		} else {
			this.actuator.clearPossibleMoves();
		}

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
