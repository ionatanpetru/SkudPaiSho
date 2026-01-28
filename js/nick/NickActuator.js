// Nick Actuator

import { ElementStyleTransform } from '../util/ElementStyleTransform';
import { ADEVAR_GUEST_ROTATE, ADEVAR_ROTATE } from '../GameOptions';
import { GUEST, HOST, MOVE, NotationPoint, RowAndColumn } from '../CommonNotationObjects';
import { NickController } from './NickController';
import { NickOptions } from './NickOptions';
import { NickTileCodes } from './NickTiles';
import {
	MARKED,
	NON_PLAYABLE,
	POSSIBLE_MOVE,
} from '../skud-pai-sho/SkudPaiShoBoardPoint';
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
import {
	cos45,
	createBoardArrow,
	createBoardPointDiv,
	getTilesForPlayer,
	isSamePoint,
	setupPaiShoBoard,
	sin45,
} from '../ActuatorHelp';
import { debug } from '../GameData';
import { TrifleAttributeType } from '../trifle/TrifleTileInfo';

export class NickActuator {
	static hostTeamTilesDivId = "hostTilesContainer";
	static guestTeamTilesDivId = "guestTilesContainer";

	static NotationAdjustmentFunction = (row, col) => {
		/* Return string displaying point notation for this game */
		return new RowAndColumn(col, 16 - row).notationPointString;
	};

	constructor(gameContainer, isMobile, enableAnimations) {
		this.gameContainer = gameContainer;
		this.mobile = isMobile;
		this.animationOn = enableAnimations;

		const containers = setupPaiShoBoard(
			this.gameContainer, 
			NickController.getHostTilesContainerDivs(),
			NickController.getGuestTilesContainerDivs(), 
			true,
			NickOptions.viewAsGuest ? ADEVAR_GUEST_ROTATE : ADEVAR_ROTATE
		);

		this.boardContainer = containers.boardContainer;
		this.arrowContainer = containers.arrowContainer;
		this.hostTilesContainer = containers.hostTilesContainer;
		this.guestTilesContainer = containers.guestTilesContainer;
	}

	setAnimationOn(isOn) {
		this.animationOn = isOn;
	}

	actuate(board, tileManager, markingManager, moveToAnimate, moveDetails) {
		debug("Move to animate: ");
		debug(moveToAnimate);

		window.requestAnimationFrame(() => {
			this.htmlify(board, tileManager, markingManager, moveToAnimate, moveDetails);
		});
	}

	htmlify(board, tileManager, markingManager, moveToAnimate, moveDetails) {
		this.clearContainer(this.boardContainer);
		this.clearContainer(this.arrowContainer);

		board.cells.forEach((column) => {
			column.forEach((cell) => {
				if (markingManager.pointIsMarked(cell) && !cell.isType(MARKED)) {
					cell.addType(MARKED);
				}
				else if (!markingManager.pointIsMarked(cell) && cell.isType(MARKED)) {
					cell.removeType(MARKED);
				}
				if (cell) {
					this.addBoardPoint(cell, board, moveToAnimate, moveDetails);
				}
			});
		});

		// Draw all arrows
		for (const [_, arrow] of Object.entries(markingManager.arrows)) {
			this.arrowContainer.appendChild(createBoardArrow(arrow[0], arrow[1]));
		}

		/* Player Tiles */

		this.clearContainerWithId(NickActuator.hostTeamTilesDivId);
		this.clearContainerWithId(NickActuator.guestTeamTilesDivId);
		
		const hostCapturedTiles = getTilesForPlayer(tileManager.capturedTiles, HOST);
		const guestCapturedTiles = getTilesForPlayer(tileManager.capturedTiles, GUEST);

		const hostCapturedTilesContainer = document.createElement("span");
		const guestCapturedTilesContainer = document.createElement("span");

		const showHostCapturedTiles = hostCapturedTiles.length > 0;
		if (showHostCapturedTiles) {
			hostCapturedTilesContainer.classList.add("tileLibrary");
			const capturedTileLabel = document.createElement("span");
			capturedTileLabel.innerText = "--Captured Tiles--";
			hostCapturedTilesContainer.appendChild(capturedTileLabel);
			hostCapturedTilesContainer.appendChild(document.createElement("br"));
			this.hostTilesContainer.appendChild(hostCapturedTilesContainer);
		}

		const showGuestCapturedTiles = guestCapturedTiles.length > 0;
		if (showGuestCapturedTiles) {
			guestCapturedTilesContainer.classList.add("tileLibrary");
			const capturedTileLabel = document.createElement("span");
			capturedTileLabel.innerText = "--Captured Tiles--";
			guestCapturedTilesContainer.appendChild(capturedTileLabel);
			guestCapturedTilesContainer.appendChild(document.createElement("br"));
			this.guestTilesContainer.appendChild(guestCapturedTilesContainer);
		}

		if (showHostCapturedTiles) {
			hostCapturedTiles.forEach((tile) => {
				this.addTile(tile, hostCapturedTilesContainer, true);
			});
		}
		if (showGuestCapturedTiles) {
			guestCapturedTiles.forEach((tile) => {
				this.addTile(tile, guestCapturedTilesContainer, true);
			});
		}
	}

	addTile(tile, tileContainer, isCaptured) {
		if (!tile) {
			return;
		}
		const theDiv = document.createElement("div");

		theDiv.classList.add("point");
		theDiv.classList.add("hasTile");

		if (tile.selectedFromPile || tile.tileIsSelectable) {
			theDiv.classList.add("selectedFromPile");
			theDiv.classList.add("drained");
		}

		const theImg = document.createElement("img");
		
		const srcValue = this.getTileSrcPath(tile);
		theImg.src = srcValue + tile.getImageName() + ".png";
		theDiv.appendChild(theImg);

		theDiv.setAttribute("name", tile.getNotationName());
		theDiv.setAttribute("id", tile.id);

		let clickable = !isCaptured;
		if (tile.tileIsSelectable) {
			clickable = true;
		}
		if (clickable) {
			if (this.mobile) {
				theDiv.addEventListener('click', () => {
					unplayedTileClicked(theDiv);
					showTileMessage(theDiv);
				});
			} else {
				theDiv.addEventListener('click', () => unplayedTileClicked(theDiv));
				theDiv.addEventListener('mouseover', () => showTileMessage(theDiv));
				theDiv.addEventListener('mouseout', clearMessage);
			}
		}

		tileContainer.appendChild(theDiv);
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
									? NickActuator.hostTeamTilesDivId
									: NickActuator.guestTeamTilesDivId;
		const container = document.getElementById(containerDivId);

		const theBr = document.createElement("br");
		theBr.classList.add("clear");
		container.appendChild(theBr);
	}

	addTeamTile(tile, player, isForTeamSelection) {
		const containerDivId = player === HOST 
									? NickActuator.hostTeamTilesDivId
									: NickActuator.guestTeamTilesDivId;
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

		const srcValue = this.getTileSrcPath();

		theImg.src = srcValue + tile.getImageName() + ".png";
		theDiv.appendChild(theImg);

		theDiv.setAttribute("name", tile.getImageName());
		theDiv.setAttribute("id", tile.id);

		if (this.mobile) {
			theDiv.addEventListener('click', () => {
				unplayedTileClicked(theDiv);
				showTileMessage(theDiv);
			});
		} else {
			theDiv.addEventListener('click', () => unplayedTileClicked(theDiv));
			theDiv.addEventListener('mouseover', () => showTileMessage(theDiv));
			theDiv.addEventListener('mouseout', clearMessage);
		}

		container.appendChild(theDiv);
	}

	addBoardPoint(boardPoint, board, moveToAnimate, moveDetails) {
		const theDiv = createBoardPointDiv(boardPoint, null, NickActuator.NotationAdjustmentFunction);

		// Visual: highlight White Lotus when it's in check (only if this point currently has a White Lotus)
		if (boardPoint.hasTile() && boardPoint.tile.code === NickTileCodes.WhiteLotus && boardPoint.lotusInCheck) {
			theDiv.classList.add("nick_lotus_in_check");
		}

		if (!boardPoint.isType(NON_PLAYABLE)) {
			theDiv.classList.add("activePoint");
			if (boardPoint.isType(MARKED)) {
				theDiv.classList.add("markedPoint");
			}
			
			if (NickOptions.viewAsGuest) {
				theDiv.classList.add("nickGuestPointRotate");
			} else {
				theDiv.classList.add("nickPointRotate");
			}

			if (boardPoint.isType(POSSIBLE_MOVE)) {
				theDiv.classList.add("possibleMove");
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
					if (e.button == 2) {
						RmbDown(theDiv);
					}
				});
				theDiv.addEventListener('mouseup', (e) => {
					 // Right Mouse Button
					if (e.button == 2) {
						RmbUp(theDiv);
					}
				});
				theDiv.addEventListener('contextmenu', (e) => {
						e.preventDefault();
				});
			}
		}

		if ((boardPoint.hasTile() && !boardPoint.occupiedByAbility)
				|| (moveToAnimate && !boardPoint.hasTile() 
					&& isSamePoint(moveToAnimate.endPoint, boardPoint.col, boardPoint.row))) {
			theDiv.classList.add("hasTile");
			
			const theImg = document.createElement("img");
			theImg.elementStyleTransform = new ElementStyleTransform(theImg);

			theImg.elementStyleTransform.setValue("rotate", 225, "deg");
			if (NickOptions.viewAsGuest) {
				theImg.elementStyleTransform.adjustValue("rotate", 180, "deg");
			}

			if (moveToAnimate || boardPoint.tile.isGigantic) {
				this.doAnimateBoardPoint(boardPoint, moveToAnimate, theImg, theDiv, moveDetails);
			}

			const srcValue = this.getTileSrcPath();

			let tileMoved = boardPoint.tile;

			const showMovedTileDuringAnimation = this.animationOn && moveDetails && moveDetails.movedTile
												&& isSamePoint(moveToAnimate.endPoint, boardPoint.col, boardPoint.row);
			if (showMovedTileDuringAnimation) {
				tileMoved = moveDetails.movedTile;
			}
			
			theImg.src = srcValue + tileMoved.getImageName() + ".png";
			
			theDiv.appendChild(theImg);

			const capturedTile = this.getCapturedTileFromMove(moveDetails);

			if (showMovedTileDuringAnimation) {
				setTimeout(() => {
					requestAnimationFrame(() => {
						if (boardPoint.hasTile()) {
							theImg.src = srcValue + boardPoint.tile.getImageName() + ".png";
						} else {
							theImg.classList.add("gone");
						}
					});
				}, pieceAnimationLength);
			}
			if (this.animationOn && moveToAnimate && capturedTile && isSamePoint(moveToAnimate.endPoint, boardPoint.col, boardPoint.row)) {
				const theImgCaptured = document.createElement("img");
				theImgCaptured.elementStyleTransform = new ElementStyleTransform(theImgCaptured);
				theImgCaptured.src = srcValue + capturedTile.getImageName() + ".png";
				theImgCaptured.classList.add("underneath");

				theImgCaptured.elementStyleTransform.setValue("rotate", 225, "deg");
				if (NickOptions.viewAsGuest) {
					theImgCaptured.elementStyleTransform.adjustValue("rotate", 180, "deg");
				}

				theDiv.appendChild(theImgCaptured);

				/* After animation, hide captured tile */
				setTimeout(() => {
					requestAnimationFrame(() => {
						theImgCaptured.style.visibility = "hidden";
					});
				}, pieceAnimationLength);
			}
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

	getCapturedTileFromMove(moveDetails) {
		if (moveDetails && moveDetails.capturedTiles && moveDetails.capturedTiles.length === 1) {
			return moveDetails.capturedTiles[0];
		}
		return null;
	}

	adjustBoardPointForGiganticDeploy(theDiv, boardPoint) {
		let x = boardPoint.col, y = boardPoint.row, ox = x, oy = y;

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
		let top = (y - oy);

		left += 0.7;
		// top += 0.5;
		
		theDiv.style.left = ((left * cos45 - top * sin45) * pointSizeMultiplierX) + unitString;
		theDiv.style.top = ((top * cos45 + left * sin45) * pointSizeMultiplierY) + unitString;

		theDiv.style.transform = "scale(" + scaleValue + ")";
	}

	doAnimateBoardPoint(boardPoint, moveToAnimate, theImg, theDiv, moveDetails) {
		if (!this.animationOn) return;

		let startX = boardPoint.col, startY = boardPoint.row, endX = startX, endY = startY;

		let movementPath;

		let movementStepIndex = 0;

		if (moveToAnimate.moveType === MOVE && (boardPoint.tile || moveDetails.movedTile)) {
			if (isSamePoint(moveToAnimate.endPoint, endX, endY)) {	// Piece moved
				const moveStartPoint = new NotationPoint(moveToAnimate.startPoint);
				startX = moveStartPoint.rowAndColumn.col;
				startY = moveStartPoint.rowAndColumn.row;
				theImg.elementStyleTransform.setValue("scale", 1.2);	// Make the pieces look like they're picked up a little when moving, good idea or no?
				theDiv.style.zIndex = 99;	// Make sure "picked up" pieces show up above others

				movementPath = moveToAnimate.endPointMovementPath;
				if (!movementPath && moveToAnimate.movementPath) {
					movementPath = moveToAnimate.movementPath;
				}
			} else {
				// Not the tile moved... is it tile pushed?
				if (moveToAnimate.promptTargetData) {
					Object.keys(moveToAnimate.promptTargetData).forEach((key, index) => {
						const promptDataEntry = moveToAnimate.promptTargetData[key];
						const keyObject = JSON.parse(key);
						if (promptDataEntry.movedTilePoint && promptDataEntry.movedTileDestinationPoint) {
							if (isSamePoint(promptDataEntry.movedTileDestinationPoint.pointText, endX, endY)) {
								const moveStartPoint = promptDataEntry.movedTilePoint;
								startX = moveStartPoint.rowAndColumn.col;
								startY = moveStartPoint.rowAndColumn.row;
								setTimeout(() => {
									theImg.elementStyleTransform.setValue("scale", 1.2);	// Make the pieces look like they're picked up a little when moving
									theDiv.style.zIndex = 105;	// Make sure "picked up" pieces show up above others
								}, pieceAnimationLength/1.2);
								movementStepIndex = 1;
							}
						}
					});
				}
			}
		}

		let pointSizeMultiplierX = 34;
		let pointSizeMultiplierY = pointSizeMultiplierX;
		let unitString = "px";

		/* For small screen size using dynamic vw units */
		if (window.innerWidth <= 612) {
			pointSizeMultiplierX = 5.5555;
			pointSizeMultiplierY = 5.611;
			unitString = "vw";
		}

		let left = (startX - endX);
		let top = (startY - endY);
		
		/* Begin tile at origin point */
		theImg.style.left = (left * pointSizeMultiplierX) + unitString;
		theImg.style.top = (top * pointSizeMultiplierY) + unitString;

		if (movementPath) {
			const numMovements = movementPath.length - 1;
			const movementAnimationLength = pieceAnimationLength / numMovements;
			const cssLength = movementAnimationLength * (1 + (0.05 * numMovements));	// Higher multiplication factor gives smoother transition
			theImg.style.transition = "left " + cssLength + "ms ease-out, right " + cssLength + "ms ease-out, top " + cssLength + "ms ease-out, bottom " + movementAnimationLength + "ms ease-out, transform 0.5s ease-in, opacity 0.5s";
			let movementNum = -1;
			movementPath.forEach(pathPointStr => {
				const currentMovementAnimationTime = movementAnimationLength * movementNum;
				setTimeout(() => {
					requestAnimationFrame(() => {
						const pathPoint = new NotationPoint(pathPointStr);
						const pointX = pathPoint.rowAndColumn.col;
						const pointY = pathPoint.rowAndColumn.row;
						left = (pointX - endX);
						top = (pointY - endY);
						theImg.style.left = (left * pointSizeMultiplierX) + unitString;
						theImg.style.top = (top * pointSizeMultiplierY) + unitString;
						debug("time: " + currentMovementAnimationTime + " left: " + left + " top: " + top);
					});
				}, currentMovementAnimationTime);
				movementNum++;
			});
		} else {
			/* Make tile be at it's current point so it animates to that point from start point */
			setTimeout(() => {
				requestAnimationFrame(() => {
					theImg.style.left = "0px";
					theImg.style.top = "0px";
				});
			}, pieceAnimationLength * movementStepIndex);
		}

		/* Scale back to normal size after animation complete */
		setTimeout(() => {
			requestAnimationFrame(() => {
				theImg.elementStyleTransform.setValue("scale", 1); // This will size back to normal after moving
			});
		}, pieceAnimationLength * (movementStepIndex + 0.5));
	}

	getTileSrcPath(tile) {
		if (NickController.isUsingCustomTileDesigns()) {
			return NickController.getCustomTileDesignsUrl();
		} else {
			let srcValue = "images/";
			const gameImgDir = "Nick/" + localStorage.getItem(NickOptions.tileDesignTypeKey);
			srcValue = srcValue + gameImgDir + "/";
			return srcValue;
		}
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

export default NickActuator;
