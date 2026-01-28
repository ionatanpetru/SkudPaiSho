/**
 * HexActuator - Renders the Hex game board
 *
 * Draws a rhombus-shaped board of hexagons with:
 * - Red edges on top and bottom (Host's goal)
 * - Blue edges on left and right (Guest's goal)
 */

import { createDivWithClass, createDivWithId } from '../ActuatorHelp';
import { CELL } from './HexBoard';

export class HexActuator {
	constructor(gameContainer, isMobile, onCellClick, hostTilesContainerDivs, guestTilesContainerDivs) {
		this.gameContainer = gameContainer;
		this.isMobile = isMobile;
		this.onCellClick = onCellClick;
		this.hostTilesContainerDivs = hostTilesContainerDivs;
		this.guestTilesContainerDivs = guestTilesContainerDivs;

		this.boardSize = 11;
		this.hexSize = isMobile ? 18 : 24; // Radius of hexagon
		this.canvas = null;
		this.ctx = null;
		this.possibleMoves = [];
		this.lastMove = null;

		this.initialize();
	}

	initialize() {
		// Clear container
		this.gameContainer.innerHTML = '';

		// Create board container
		const bcontainer = createDivWithClass('board-container');
		bcontainer.style.display = 'flex';
		bcontainer.style.flexDirection = 'column';
		bcontainer.style.alignItems = 'center';
		bcontainer.style.padding = '10px';
		bcontainer.style.backgroundColor = '#2d3748';

		// Create canvas
		this.canvas = document.createElement('canvas');
		const width = this.calculateBoardWidth();
		const height = this.calculateBoardHeight();
		this.canvas.width = width;
		this.canvas.height = height;
		this.canvas.style.cursor = 'pointer';
		this.ctx = this.canvas.getContext('2d');
		bcontainer.appendChild(this.canvas);

		// Create tile pile container with game messages
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

		// Setup click handler
		this.setupClickHandler();
	}

	calculateBoardWidth() {
		// Width accounts for the rhombus shape offset
		const hexWidth = this.hexSize * Math.sqrt(3);
		return hexWidth * this.boardSize + hexWidth * this.boardSize / 2 + 60;
	}

	calculateBoardHeight() {
		const hexHeight = this.hexSize * 1.5;
		return hexHeight * this.boardSize + this.hexSize + 40;
	}

	/**
	 * Get pixel coordinates for a hex cell center
	 */
	getHexCenter(row, col) {
		const hexWidth = this.hexSize * Math.sqrt(3);
		const hexHeight = this.hexSize * 1.5;

		// Offset each row to create rhombus shape
		const x = 30 + col * hexWidth + row * hexWidth / 2 + hexWidth / 2;
		const y = 20 + row * hexHeight + this.hexSize;

		return { x, y };
	}

	/**
	 * Draw a hexagon at the given center
	 */
	drawHexagon(cx, cy, fillColor, strokeColor, strokeWidth = 2) {
		const ctx = this.ctx;
		ctx.beginPath();

		for (let i = 0; i < 6; i++) {
			const angle = (Math.PI / 3) * i - Math.PI / 6; // Flat-top hexagon
			const x = cx + this.hexSize * Math.cos(angle);
			const y = cy + this.hexSize * Math.sin(angle);
			if (i === 0) {
				ctx.moveTo(x, y);
			} else {
				ctx.lineTo(x, y);
			}
		}
		ctx.closePath();

		if (fillColor) {
			ctx.fillStyle = fillColor;
			ctx.fill();
		}
		if (strokeColor) {
			ctx.strokeStyle = strokeColor;
			ctx.lineWidth = strokeWidth;
			ctx.stroke();
		}
	}

	/**
	 * Draw a stone (circle) at the given center
	 */
	drawStone(cx, cy, color, isLastMove = false) {
		const ctx = this.ctx;
		const radius = this.hexSize * 0.65;

		// Stone shadow
		ctx.beginPath();
		ctx.arc(cx + 2, cy + 2, radius, 0, Math.PI * 2);
		ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
		ctx.fill();

		// Stone
		ctx.beginPath();
		ctx.arc(cx, cy, radius, 0, Math.PI * 2);

		if (color === CELL.RED) {
			const gradient = ctx.createRadialGradient(cx - radius / 3, cy - radius / 3, 0, cx, cy, radius);
			gradient.addColorStop(0, '#ff6b6b');
			gradient.addColorStop(1, '#dc2626');
			ctx.fillStyle = gradient;
		} else {
			const gradient = ctx.createRadialGradient(cx - radius / 3, cy - radius / 3, 0, cx, cy, radius);
			gradient.addColorStop(0, '#60a5fa');
			gradient.addColorStop(1, '#2563eb');
			ctx.fillStyle = gradient;
		}
		ctx.fill();

		// Highlight ring for last move
		if (isLastMove) {
			ctx.beginPath();
			ctx.arc(cx, cy, radius + 3, 0, Math.PI * 2);
			ctx.strokeStyle = '#fbbf24';
			ctx.lineWidth = 3;
			ctx.stroke();
		}
	}

	/**
	 * Draw edge markers to show which sides belong to which player
	 */
	drawEdgeMarkers() {
		const ctx = this.ctx;

		// Top edge - Red
		for (let col = 0; col < this.boardSize; col++) {
			const { x, y } = this.getHexCenter(0, col);
			ctx.beginPath();
			ctx.arc(x, y - this.hexSize - 5, 5, 0, Math.PI * 2);
			ctx.fillStyle = '#dc2626';
			ctx.fill();
		}

		// Bottom edge - Red
		for (let col = 0; col < this.boardSize; col++) {
			const { x, y } = this.getHexCenter(this.boardSize - 1, col);
			ctx.beginPath();
			ctx.arc(x, y + this.hexSize + 5, 5, 0, Math.PI * 2);
			ctx.fillStyle = '#dc2626';
			ctx.fill();
		}

		// Left edge - Blue
		for (let row = 0; row < this.boardSize; row++) {
			const { x, y } = this.getHexCenter(row, 0);
			ctx.beginPath();
			ctx.arc(x - this.hexSize * 0.9, y, 5, 0, Math.PI * 2);
			ctx.fillStyle = '#2563eb';
			ctx.fill();
		}

		// Right edge - Blue
		for (let row = 0; row < this.boardSize; row++) {
			const { x, y } = this.getHexCenter(row, this.boardSize - 1);
			ctx.beginPath();
			ctx.arc(x + this.hexSize * 0.9, y, 5, 0, Math.PI * 2);
			ctx.fillStyle = '#2563eb';
			ctx.fill();
		}
	}

	actuate(board, winner, winningPath, lastMove) {
		this.lastMove = lastMove;
		this.board = board;

		const ctx = this.ctx;

		// Clear canvas
		ctx.fillStyle = '#2d3748';
		ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

		// Draw edge markers
		this.drawEdgeMarkers();

		// Draw all hexagons
		for (let row = 0; row < this.boardSize; row++) {
			for (let col = 0; col < this.boardSize; col++) {
				const { x, y } = this.getHexCenter(row, col);
				const cell = board.getCell(row, col);

				// Determine hex colors
				let fillColor = '#4a5568'; // Default empty
				let strokeColor = '#718096';

				// Check if this is a possible move
				const isPossible = this.possibleMoves.some(m => m.row === row && m.col === col);
				if (isPossible && cell === CELL.EMPTY) {
					fillColor = '#6b7280';
					strokeColor = '#9ca3af';
				}

				// Check if part of winning path
				const isWinning = winningPath && winningPath.some(p => p.row === row && p.col === col);
				if (isWinning) {
					strokeColor = '#fbbf24';
				}

				this.drawHexagon(x, y, fillColor, strokeColor);

				// Draw stone if occupied
				if (cell !== CELL.EMPTY) {
					const isLast = lastMove && lastMove.row === row && lastMove.col === col;
					this.drawStone(x, y, cell, isLast);
				}
			}
		}

		// Draw coordinate labels
		this.drawLabels();
	}

	drawLabels() {
		const ctx = this.ctx;
		ctx.font = `${this.isMobile ? 10 : 12}px sans-serif`;
		ctx.fillStyle = '#9ca3af';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';

		// Column labels (A-K)
		for (let col = 0; col < this.boardSize; col++) {
			const { x, y } = this.getHexCenter(0, col);
			const label = String.fromCharCode(65 + col);
			ctx.fillText(label, x, y - this.hexSize - 15);
		}

		// Row labels (1-11)
		for (let row = 0; row < this.boardSize; row++) {
			const { x, y } = this.getHexCenter(row, 0);
			ctx.fillText(String(row + 1), x - this.hexSize - 10, y);
		}
	}

	setupClickHandler() {
		const handler = (event) => {
			const rect = this.canvas.getBoundingClientRect();
			const scaleX = this.canvas.width / rect.width;
			const scaleY = this.canvas.height / rect.height;

			let clientX, clientY;
			if (event.touches) {
				clientX = event.touches[0].clientX;
				clientY = event.touches[0].clientY;
			} else {
				clientX = event.clientX;
				clientY = event.clientY;
			}

			const x = (clientX - rect.left) * scaleX;
			const y = (clientY - rect.top) * scaleY;

			// Find which hex was clicked
			const clicked = this.findHexAtPoint(x, y);
			if (clicked && this.onCellClick) {
				this.onCellClick(clicked.row, clicked.col);
			}
		};

		this.canvas.addEventListener('click', handler);
		this.canvas.addEventListener('touchend', (e) => {
			e.preventDefault();
			handler(e);
		});

		// Hover effect
		this.canvas.addEventListener('mousemove', (event) => {
			const rect = this.canvas.getBoundingClientRect();
			const scaleX = this.canvas.width / rect.width;
			const scaleY = this.canvas.height / rect.height;
			const x = (event.clientX - rect.left) * scaleX;
			const y = (event.clientY - rect.top) * scaleY;

			const hovered = this.findHexAtPoint(x, y);
			if (hovered && this.board) {
				const cell = this.board.getCell(hovered.row, hovered.col);
				const isPossible = this.possibleMoves.some(m => m.row === hovered.row && m.col === hovered.col);
				this.canvas.style.cursor = (cell === CELL.EMPTY && isPossible) ? 'pointer' : 'default';
			} else {
				this.canvas.style.cursor = 'default';
			}
		});
	}

	/**
	 * Find which hex cell contains a given point
	 */
	findHexAtPoint(px, py) {
		// Check each hex
		for (let row = 0; row < this.boardSize; row++) {
			for (let col = 0; col < this.boardSize; col++) {
				const { x, y } = this.getHexCenter(row, col);
				const dist = Math.sqrt((px - x) ** 2 + (py - y) ** 2);
				if (dist < this.hexSize * 0.9) {
					return { row, col };
				}
			}
		}
		return null;
	}

	showPossibleMoves(moves) {
		this.possibleMoves = moves || [];
	}

	clearPossibleMoves() {
		this.possibleMoves = [];
	}

	cleanup() {
		// Remove event listeners if needed
		this.canvas = null;
		this.ctx = null;
	}
}
