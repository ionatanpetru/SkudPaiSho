/**
 * TicTacToeActuator - Renders the Tic Tac Toe game board
 */

import { MARK } from './TicTacToeBoard';
import { createDivWithClass, createDivWithId, removeChildren } from '../ActuatorHelp';

export class TicTacToeActuator {
	constructor(gameContainer, isMobile, onCellClick, hostTilesContainerDivs, guestTilesContainerDivs) {
		this.gameContainer = gameContainer;
		this.isMobile = isMobile;
		this.onCellClick = onCellClick;
		this.hostTilesContainerDivs = hostTilesContainerDivs;
		this.guestTilesContainerDivs = guestTilesContainerDivs;

		this.boardElement = null;
		this.cellElements = [];

		this.initialize();
	}

	initialize() {
		removeChildren(this.gameContainer);

		// Create board container wrapper
		const bcontainer = createDivWithClass('board-container');

		// Create the board element
		this.boardElement = document.createElement('div');
		this.boardElement.className = 'tictactoe-board';

		// Create 9 cells (3x3 grid)
		this.cellElements = [];
		for (let row = 0; row < 3; row++) {
			for (let col = 0; col < 3; col++) {
				const cell = document.createElement('div');
				cell.className = 'tictactoe-cell';
				cell.dataset.row = row;
				cell.dataset.col = col;
				cell.dataset.index = row * 3 + col;

				cell.addEventListener('click', () => {
					if (this.onCellClick) {
						this.onCellClick(row, col);
					}
				});

				this.boardElement.appendChild(cell);
				this.cellElements.push(cell);
			}
		}

		bcontainer.appendChild(this.boardElement);

		// Create tile pile container with game messages (standard structure)
		const tilePileContainer = createDivWithClass('tilePileContainer');

		const response = createDivWithId('response');
		const gameMessage = createDivWithClass('gameMessage');
		const hostTilesContainer = createDivWithClass('hostTilesContainer');
		const guestTilesContainer = createDivWithClass('guestTilesContainer');
		const gameMessage2 = createDivWithClass('gameMessage2');

		hostTilesContainer.innerHTML = this.hostTilesContainerDivs;
		guestTilesContainer.innerHTML = this.guestTilesContainerDivs;

		tilePileContainer.appendChild(response);
		tilePileContainer.appendChild(gameMessage);
		tilePileContainer.appendChild(hostTilesContainer);
		tilePileContainer.appendChild(guestTilesContainer);
		tilePileContainer.appendChild(gameMessage2);

		this.gameContainer.appendChild(bcontainer);
		this.gameContainer.appendChild(tilePileContainer);
	}

	actuate(board, winner, winningLine, lastMove) {
		// Update cell contents
		for (let i = 0; i < 9; i++) {
			const cell = this.cellElements[i];
			const mark = board.getCellByIndex(i);

			// Clear cell classes
			cell.className = 'tictactoe-cell';

			if (mark === MARK.X) {
				cell.textContent = 'X';
				cell.classList.add('mark-x');
			} else if (mark === MARK.O) {
				cell.textContent = 'O';
				cell.classList.add('mark-o');
			} else {
				cell.textContent = '';
				cell.classList.add('empty');
			}

			// Highlight last move
			if (lastMove && lastMove.index === i) {
				cell.classList.add('last-move');
			}

			// Highlight winning line
			if (winningLine && winningLine.includes(i)) {
				cell.classList.add('winning');
			}
		}
	}

	showPossibleMoves(moves) {
		for (const move of moves) {
			const cell = this.cellElements[move.index];
			if (cell) {
				cell.classList.add('possible');
			}
		}
	}

	clearPossibleMoves() {
		for (const cell of this.cellElements) {
			cell.classList.remove('possible');
		}
	}

	cleanup() {
		// Nothing special to clean up
	}
}
