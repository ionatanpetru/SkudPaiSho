// Trifle Actuator

import { ElementStyleTransform } from '../util/ElementStyleTransform';
import { GUEST, HOST } from '../CommonNotationObjects';
import {
	MARKED,
	NON_PLAYABLE,
	POSSIBLE_MOVE,
} from '../skud-pai-sho/SkudPaiShoBoardPoint';
import { TrifleController } from './TrifleController';
import {
	RmbDown,
	RmbUp,
	clearMessage,
	pieceAnimationLength,
	pointClicked,
	showPointMessage,
	showTileMessage,
	unplayedTileClicked,
} from '../PaiShoMain';
import { TrifleAttributeType } from './TrifleTileInfo';
import { TrifleTile } from './TrifleTile';
import { TrifleTileCodes } from './TrifleTiles';
import {
	cos45,
	createBoardArrow,
	createBoardPointDiv,
	setupPaiShoBoard,
	sin45,
} from '../ActuatorHelp';
import { debug } from '../GameData';
import {
	guestPlayerCode,
	hostPlayerCode,
} from '../pai-sho-common/PaiShoPlayerHelp';
import { currentTileMetadata } from './PaiShoGamesTileMetadata';

export class TrifleActuator {
	static imagePath = "images/Trifle/chuji/";
	static hostTeamTilesDivId = "hostTilesContainer";
	static guestTeamTilesDivId = "guestTilesContainer";

	constructor(gameContainer, isMobile) {
		this.gameContainer = gameContainer;
		this.mobile = isMobile;

		const containers = setupPaiShoBoard(
			this.gameContainer,
			TrifleController.getHostTilesContainerDivs(),
			TrifleController.getGuestTilesContainerDivs(),
			true
		);

		this.boardContainer = containers.boardContainer;
		this.arrowContainer = containers.arrowContainer;
		this.hostTilesContainer = containers.hostTilesContainer;
		this.guestTilesContainer = containers.guestTilesContainer;
	}

	actuate(board, tileManager, markingManager) {
		window.requestAnimationFrame(() => {
			this.htmlify(board, tileManager, markingManager);
		});
	}

	htmlify(board, tileManager, markingManager) {
		this.clearContainer(this.boardContainer);
		this.clearContainer(this.arrowContainer);

		board.cells.forEach((column) => {
			column.forEach((cell) => {
				if (markingManager.pointIsMarked(cell) && !cell.isType(MARKED)) {
					cell.addType(MARKED);
				} else if (!markingManager.pointIsMarked(cell) && cell.isType(MARKED)) {
					cell.removeType(MARKED);
				}
				if (cell) {
					this.addBoardPoint(cell, board);
				}
			});
		});

		// Draw all arrows
		for (const [, arrow] of Object.entries(markingManager.arrows)) {
			this.arrowContainer.appendChild(createBoardArrow(arrow[0], arrow[1]));
		}

		/* Player Tiles */
		/* Team Tiles */
		// Go through tile piles and clear containers
		this.clearContainerWithId(TrifleActuator.hostTeamTilesDivId);
		this.clearContainerWithId(TrifleActuator.guestTeamTilesDivId);
		if (tileManager.playersAreSelectingTeams() && !tileManager.hostTeamIsFull()
				|| !tileManager.playersAreSelectingTeams()) {
			tileManager.hostTiles.forEach((tile) => {
				this.addTeamTile(tile, HOST);
			});
		}
		if (tileManager.playersAreSelectingTeams() && !tileManager.guestTeamIsFull()
				|| !tileManager.playersAreSelectingTeams()) {
			tileManager.guestTiles.forEach((tile) => {
				this.addTeamTile(tile, GUEST);
			});
		}

		/* Team Selection Area */
		if (!tileManager.hostTeamIsFull()) {
			this.addLineBreakInTilePile(HOST);
			this.addLineBreakInTilePile(HOST);
			Object.keys(TrifleTileCodes).forEach((key) => {
				if (currentTileMetadata[key] && currentTileMetadata[key].available) {
					this.addTeamTile(new TrifleTile(TrifleTileCodes[key], hostPlayerCode), HOST, true);
				}
			});
		} else if (!tileManager.guestTeamIsFull()) {
			this.addLineBreakInTilePile(GUEST);
			this.addLineBreakInTilePile(GUEST);
			Object.keys(TrifleTileCodes).forEach((key) => {
				if (currentTileMetadata[key] && currentTileMetadata[key].available) {
					this.addTeamTile(new TrifleTile(TrifleTileCodes[key], guestPlayerCode), GUEST, true);
				}
			});
		}
	}

	clearContainer(container) {
		while (container.firstChild) {
			container.removeChild(container.firstChild);
		}
	}

	clearContainerWithId(containerIdName) {
		const container = document.getElementById(containerIdName);
		if (container) {
			this.clearContainer(container);
		}
	}

	addLineBreakInTilePile(player) {
		const containerDivId = player === HOST
			? TrifleActuator.hostTeamTilesDivId
			: TrifleActuator.guestTeamTilesDivId;
		const container = document.getElementById(containerDivId);

		const theBr = document.createElement("br");
		theBr.classList.add("clear");
		container.appendChild(theBr);
	}

	addTeamTile(tile, player, isForTeamSelection) {
		const containerDivId = player === HOST
			? TrifleActuator.hostTeamTilesDivId
			: TrifleActuator.guestTeamTilesDivId;
		const container = document.getElementById(containerDivId);

		const theDiv = document.createElement("div");

		theDiv.classList.add("point");
		theDiv.classList.add("hasTile");

		if (isForTeamSelection) {
			theDiv.classList.add("selectedFromPile");
		} else if (tile.selectedFromPile) {
			theDiv.classList.add("selectedFromPile");
			theDiv.classList.add("drained");
		}

		const theImg = document.createElement("img");

		const srcValue = TrifleActuator.imagePath;

		theImg.src = srcValue + tile.getImageName() + ".png";
		theDiv.appendChild(theImg);

		theDiv.setAttribute("name", tile.getImageName());
		theDiv.setAttribute("id", tile.id);

		if (this.mobile) {
			theDiv.addEventListener('click', function() {
				unplayedTileClicked(this);
				showTileMessage(this);
			});
		} else {
			theDiv.addEventListener('click', function() { unplayedTileClicked(this); });
			theDiv.addEventListener('mouseover', function() { showTileMessage(this); });
			theDiv.addEventListener('mouseout', clearMessage);
		}

		container.appendChild(theDiv);
	}

	addBoardPoint(boardPoint, board) {
		const theDiv = createBoardPointDiv(boardPoint);

		if (!boardPoint.isType(NON_PLAYABLE)) {
			theDiv.classList.add("activePoint");
			theDiv.classList.add("vagabondPointRotate");
			if (boardPoint.isType(MARKED)) {
				theDiv.classList.add("markedPoint");
			}
			if (boardPoint.isType(POSSIBLE_MOVE)) {
				theDiv.classList.add("possibleMove");
				if (board.currentlyDeployingTileInfo && board.currentlyDeployingTileInfo.attributes
						&& board.currentlyDeployingTileInfo.attributes.includes(TrifleAttributeType.gigantic)) {
					// Gigantic!
					this.adjustBoardPointForGiganticDeploy(theDiv, boardPoint);
				}

				theDiv.style.zIndex = 95;
			}

			if (this.mobile) {
				theDiv.addEventListener('click', function() {
					pointClicked(this);
					showPointMessage(this);
				});
			} else {
				theDiv.addEventListener('click', function() { pointClicked(this); });
				theDiv.addEventListener('mouseover', function() { showPointMessage(this); });
				theDiv.addEventListener('mouseout', clearMessage);
				theDiv.addEventListener('mousedown', (e) => {
					// Right Mouse Button
					if (e.button === 2) {
						RmbDown(theDiv);
					}
				});
				theDiv.addEventListener('mouseup', (e) => {
					// Right Mouse Button
					if (e.button === 2) {
						RmbUp(theDiv);
					}
				});
				theDiv.addEventListener('contextmenu', (e) => {
					e.preventDefault();
				});
			}
		}

		if (boardPoint.hasTile() && !boardPoint.occupiedByAbility) {
			theDiv.classList.add("hasTile");

			const theImg = document.createElement("img");
			theImg.elementStyleTransform = new ElementStyleTransform(theImg);
			theImg.elementStyleTransform.setValue("rotate", 315, "deg");

			const moveToAnimate = null;
			if (moveToAnimate || boardPoint.tile.isGigantic) {
				this.doAnimateBoardPoint(boardPoint, moveToAnimate, theImg, theDiv);
			}

			const srcValue = TrifleActuator.imagePath;

			theImg.src = srcValue + boardPoint.tile.getImageName() + ".png";

			theDiv.appendChild(theImg);
		}

		if (boardPoint.occupiedByAbility) {
			theDiv.classList.remove("activePoint");
		}

		this.boardContainer.appendChild(theDiv);

		if (boardPoint.betweenHarmony && boardPoint.col === 16) {
			const theBr = document.createElement("div");
			theBr.classList.add("clear");
			this.boardContainer.appendChild(theBr);
		}
	}

	adjustBoardPointForGiganticDeploy(theDiv, boardPoint) {
		const x = boardPoint.col;
		const y = boardPoint.row;
		const ox = x;
		const oy = y;

		let pointSizeMultiplierX = 34;
		let pointSizeMultiplierY = pointSizeMultiplierX;
		let unitString = "px";

		/* For small screen size using dynamic vw units */
		if (window.innerWidth <= 612) {
			pointSizeMultiplierX = 5.5555;
			pointSizeMultiplierY = 5.611;
			unitString = "vw";
		}

		const scaleValue = 1;

		let left = (x - ox);
		const top = (y - oy);

		left += 0.7;

		theDiv.style.left = ((left * cos45 - top * sin45) * pointSizeMultiplierX) + unitString;
		theDiv.style.top = ((top * cos45 + left * sin45) * pointSizeMultiplierY) + unitString;

		theDiv.style.transform = "scale(" + scaleValue + ")";
	}

	doAnimateBoardPoint(boardPoint, moveToAnimate, theImg, theDiv) {
		const x = boardPoint.col;
		const y = boardPoint.row;
		const ox = x;
		const oy = y;

		let pointSizeMultiplierX = 34;
		let pointSizeMultiplierY = pointSizeMultiplierX;
		let unitString = "px";

		/* For small screen size using dynamic vw units */
		if (window.innerWidth <= 612) {
			pointSizeMultiplierX = 5.5555;
			pointSizeMultiplierY = 5.611;
			unitString = "vw";
		}

		let scaleValue = 1;

		if (boardPoint.tile.isGigantic) {
			scaleValue = 2;
		}

		let finalLeft = 0;
		let finalTop = 0;

		let left = (x - ox);
		const top = (y - oy);
		if (boardPoint.tile.isGigantic) {
			left += 0.7;
			finalLeft += 0.7;

			theDiv.style.zIndex = 90;
		}
		theDiv.style.left = ((left * cos45 - top * sin45) * pointSizeMultiplierX) + unitString;
		theDiv.style.top = ((top * cos45 + left * sin45) * pointSizeMultiplierY) + unitString;

		theDiv.style.transform = "scale(" + scaleValue + ")";

		requestAnimationFrame(() => {
			theDiv.style.left = ((finalLeft * cos45 - finalTop * sin45) * pointSizeMultiplierX) + unitString;
			theDiv.style.top = ((finalTop * cos45 + finalLeft * sin45) * pointSizeMultiplierY) + unitString;
		});
		setTimeout(() => {
			requestAnimationFrame(() => {
				theDiv.style.transform = "scale(" + scaleValue + ")";	// This will size back to normal after moving
			});
		}, pieceAnimationLength);
	}

	printBoard(board) {
		debug("");
		let rowNum = 0;
		board.cells.forEach((row) => {
			let rowStr = rowNum + "\t: ";
			row.forEach((boardPoint) => {
				const str = boardPoint.getConsoleDisplay();
				if (str.length < 3) {
					rowStr += " ";
				}
				rowStr = rowStr + str;
				if (str.length < 2) {
					rowStr = rowStr + " ";
				}
			});
			debug(rowStr);
			rowNum++;
		});
		debug("");
	}
}

export default TrifleActuator;
