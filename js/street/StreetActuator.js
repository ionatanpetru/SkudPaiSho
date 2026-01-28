// Actuator

import { ARRANGING, PLANTING } from '../CommonNotationObjects';
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
  piecePlaceAnimation,
  pointClicked,
  showPointMessage,
  showTileMessage,
  unplayedTileClicked
} from '../PaiShoMain';
import { StreetController } from './StreetController';
import { StreetTileManager } from './StreetTileManager';
import {
  createBoardArrow,
  createBoardPointDiv,
  getSkudTilesSrcPath,
  isSamePoint,
  setupPaiShoBoard,
} from '../ActuatorHelp';
import { debug } from '../GameData';

export function StreetActuator(gameContainer, isMobile, enableAnimations) {
	this.gameContainer = gameContainer;
	this.mobile = isMobile;
	this.animationOn = enableAnimations;

	var containers = setupPaiShoBoard(
		this.gameContainer,
		StreetController.getHostTilesContainerDivs(),
		StreetController.getGuestTilesContainerDivs(),
		false
	);

	this.boardContainer = containers.boardContainer;
	this.boardContainer.style.position = "relative";
	this.arrowContainer = containers.arrowContainer;
	this.hostTilesContainer = containers.hostTilesContainer;
	this.guestTilesContainer = containers.guestTilesContainer;
}

StreetActuator.prototype.setAnimationOn = function(isOn) {
	this.animationOn = isOn;
};

StreetActuator.prototype.actuate = function(board, tileManager, markingManager, moveToAnimate) {
	var self = this;

	// self.printBoard(board);

	window.requestAnimationFrame(function () {
		self.htmlify(board, tileManager, markingManager, moveToAnimate);
	});
};

StreetActuator.prototype.htmlify = function(board, tileManager, markingManager, moveToAnimate) {
	this.clearContainer(this.boardContainer);
	this.clearContainer(this.arrowContainer);

	var self = this;

	board.cells.forEach(function(column) {
		column.forEach(function(cell) {
			if (markingManager.pointIsMarked(cell) && !cell.isType(MARKED)){
				cell.addType(MARKED);
			}
			else if (!markingManager.pointIsMarked(cell) && cell.isType(MARKED)){
				cell.removeType(MARKED);
			}
			if (cell) {
				self.addBoardPoint(cell, moveToAnimate);
			}
		});
	});

	// Draw all arrows
	for (var [_, arrow] of Object.entries(markingManager.arrows)) {
		this.arrowContainer.appendChild(createBoardArrow(arrow[0], arrow[1]));
	}

	var fullTileSet = new StreetTileManager(true);

	// Go through tile piles and clear containers
	fullTileSet.hostTiles.forEach(function(tile) {
		self.clearTileContainer(tile);
	});
	fullTileSet.guestTiles.forEach(function(tile) {
		self.clearTileContainer(tile);
	});

	// Go through tile piles and display
	tileManager.hostTiles.forEach(function(tile) {
		self.addTile(tile, self.hostTilesContainer);
	});
	tileManager.guestTiles.forEach(function(tile) {
		self.addTile(tile, self.guestTilesContainer);
	});
};

StreetActuator.prototype.clearContainer = function (container) {
	while (container.firstChild) {
		container.removeChild(container.firstChild);
	}
};

StreetActuator.prototype.clearTileContainer = function (tile) {
	var container = document.querySelector("." + tile.getImageName());
	while (container.firstChild) {
		container.removeChild(container.firstChild);
	}
};

StreetActuator.prototype.addTile = function(tile, mainContainer) {
	var self = this;

	var container = document.querySelector("." + tile.getImageName());

	var theDiv = document.createElement("div");

	theDiv.classList.add("point");
	theDiv.classList.add("hasTile");

	if (tile.selectedFromPile) {
		theDiv.classList.add("selectedFromPile");
		theDiv.classList.add("drained");
	}

	var theImg = document.createElement("img");
	
	var srcValue = getSkudTilesSrcPath();
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
};

StreetActuator.prototype.addBoardPoint = function(boardPoint, moveToAnimate) {
	var self = this;

	var theDiv = createBoardPointDiv(boardPoint);

	if (!boardPoint.isType(NON_PLAYABLE)) {
		theDiv.classList.add("activePoint");
		if (boardPoint.isType(MARKED)) {
			theDiv.classList.add("markedPoint");
		}
		if (boardPoint.isType(POSSIBLE_MOVE)) {
			theDiv.classList.add("possibleMove");
		} else if (boardPoint.betweenHarmony) {
			theDiv.classList.add("betweenHarmony");
			if (boardPoint.betweenHarmonyHost) {
				theDiv.classList.add("bhHost");
			}
			if (boardPoint.betweenHarmonyGuest) {
				theDiv.classList.add("bhGuest");
			}
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
			theDiv.addEventListener('mousedown', e => {
				 // Right Mouse Button
				if (e.button == 2) {
					RmbDown(theDiv);
				}
			});
			theDiv.addEventListener('mouseup', e => {
				 // Right Mouse Button
				if (e.button == 2) {
					RmbUp(theDiv);
				}
			});
			theDiv.addEventListener('contextmenu', e => {
					e.preventDefault();
			});
		}
	}

	if (boardPoint.hasTile()) {
		theDiv.classList.add("hasTile");

		var theImg = document.createElement("img");

		if (moveToAnimate) {
			this.doAnimateBoardPoint(boardPoint, moveToAnimate, theImg, theDiv);
		}

		var srcValue = getSkudTilesSrcPath();
		theImg.src = srcValue + boardPoint.tile.getImageName() + ".png";

		// if (boardPoint.tile.inHarmony) {
		// 	theDiv.classList.add(boardPoint.tile.ownerName + "harmony");
		// }
		if (boardPoint.tile.capturedTile) {
			theDiv.classList.add("hasCapturedTile");
		}

		theDiv.appendChild(theImg);
	}

	this.boardContainer.appendChild(theDiv);

	if (boardPoint.betweenHarmony && boardPoint.col === 16) {
		var theBr = document.createElement("div");
		theBr.classList.add("clear");
		this.boardContainer.appendChild(theBr);
	}
};

StreetActuator.prototype.doAnimateBoardPoint = function(boardPoint, moveToAnimate, theImg, theDiv) {
	if (!this.animationOn) return;

	var x = boardPoint.col, y = boardPoint.row, ox = x, oy = y;

	if (moveToAnimate.moveType === ARRANGING && boardPoint.tile) {
		if (isSamePoint(moveToAnimate.endPoint, x, y)) { // Piece moved
			x = moveToAnimate.startPoint.rowAndColumn.col;
			y = moveToAnimate.startPoint.rowAndColumn.row;
			theImg.style.transform = "scale(1.2)"; // Make the pieces look like they're picked up when moving
			theDiv.style.zIndex = 99; // Make sure "picked up" pieces show up above others
		}
	} else if (moveToAnimate.moveType === PLANTING) {
		if (isSamePoint(moveToAnimate.endPoint, ox, oy)) { // Piece planted
			if (piecePlaceAnimation === 1) {
				theImg.style.transform = "scale(2)";
				theDiv.style.zIndex = 99;
				requestAnimationFrame(function() {
					theImg.style.transform = "scale(1)";
				});
			}
		}
	}

	var pointSizeMultiplierX = 34;
	var pointSizeMultiplierY = pointSizeMultiplierX;
	var unitString = "px";

	/* For small screen size using dynamic vw units */
	if (window.innerWidth <= 612) {
		pointSizeMultiplierX = 5.5555;
		pointSizeMultiplierY = 5.611;
		unitString = "vw";
	}

	theImg.style.position = "relative";
	theImg.style.transition = "left " + pieceAnimationLength + "ms, top " + pieceAnimationLength + "ms, transform " + pieceAnimationLength + "ms";
	theImg.style.left = ((x - ox) * pointSizeMultiplierX) + unitString;
	theImg.style.top = ((y - oy) * pointSizeMultiplierY) + unitString;

	requestAnimationFrame(function() {
		theImg.style.left = "0px";
		theImg.style.top = "0px";
	});
	setTimeout(function() {
		requestAnimationFrame(function() {
			theImg.style.transform = "scale(1)"; // This will size back to normal after moving
		});
	}, pieceAnimationLength);
};

StreetActuator.prototype.printBoard = function(board) {

	debug("");
	var rowNum = 0;
	board.cells.forEach(function (row) {
		var rowStr = rowNum + "\t: ";
		row.forEach(function (boardPoint) {
			var str = boardPoint.getConsoleDisplay();
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
};

